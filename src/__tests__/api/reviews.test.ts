import { NextRequest } from "next/server";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockReview = {
  id: "review-1",
  userId: "user-1",
  gameId: "game-1",
  title: null,
  content: "An amazing open-world RPG experience.",
  rating: 9,
  spoiler: false,
  published: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  liked: false,
  user: { id: "user-1", name: "Test User", username: "testuser", image: null },
  game: { id: "game-1", title: "Elden Ring", slug: "elden-ring", coverImage: null },
  _count: { likes: 3, comments: 1 },
};

const mockPrisma = {
  review: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  reviewLike: {
    findMany: jest.fn(),
  },
  game: {
    findUnique: jest.fn(),
  },
  activity: {
    create: jest.fn(),
  },
};

jest.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const mockAuth = jest.fn();
jest.mock("@/lib/auth", () => ({ auth: mockAuth }));

import { GET, POST } from "@/app/api/reviews/route";

function makeGetRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL("http://localhost/api/reviews");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString(), { method: "GET" });
}

function makePostRequest(body: object): NextRequest {
  return new NextRequest("http://localhost/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── GET /api/reviews ─────────────────────────────────────────────────────────

describe("GET /api/reviews", () => {
  beforeEach(() => jest.clearAllMocks());

  test("TC-API-R-001: returns paginated reviews without auth", async () => {
    mockAuth.mockResolvedValue(null);
    mockPrisma.review.findMany.mockResolvedValue([mockReview]);
    mockPrisma.review.count.mockResolvedValue(1);
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.total).toBe(1);
  });

  test("TC-API-R-002: response includes pagination fields", async () => {
    mockAuth.mockResolvedValue(null);
    mockPrisma.review.findMany.mockResolvedValue([]);
    mockPrisma.review.count.mockResolvedValue(0);
    const res = await GET(makeGetRequest({ page: "1", pageSize: "10" }));
    const body = await res.json();
    expect(body).toHaveProperty("page", 1);
    expect(body).toHaveProperty("pageSize", 10);
    expect(body).toHaveProperty("totalPages");
  });

  test("TC-API-R-003: filters reviews by gameId", async () => {
    mockAuth.mockResolvedValue(null);
    mockPrisma.review.findMany.mockResolvedValue([mockReview]);
    mockPrisma.review.count.mockResolvedValue(1);
    await GET(makeGetRequest({ gameId: "game-1" }));
    const callArg = mockPrisma.review.findMany.mock.calls[0][0];
    expect(callArg.where.gameId).toBe("game-1");
  });

  test("TC-API-R-004: filters reviews by userId", async () => {
    mockAuth.mockResolvedValue(null);
    mockPrisma.review.findMany.mockResolvedValue([]);
    mockPrisma.review.count.mockResolvedValue(0);
    await GET(makeGetRequest({ userId: "user-1" }));
    const callArg = mockPrisma.review.findMany.mock.calls[0][0];
    expect(callArg.where.userId).toBe("user-1");
  });

  test("TC-API-R-005: adds liked flag when user is authenticated", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.review.findMany.mockResolvedValue([mockReview]);
    mockPrisma.review.count.mockResolvedValue(1);
    mockPrisma.reviewLike.findMany.mockResolvedValue([{ reviewId: "review-1" }]);
    const res = await GET(makeGetRequest());
    const body = await res.json();
    expect(body.data[0].liked).toBe(true);
  });

  test("TC-API-R-006: returns 500 on DB error", async () => {
    mockAuth.mockResolvedValue(null);
    mockPrisma.review.findMany.mockRejectedValue(new Error("DB error"));
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to fetch reviews.");
  });

  test("TC-API-R-007: sort=rating_high orders by rating desc", async () => {
    mockAuth.mockResolvedValue(null);
    mockPrisma.review.findMany.mockResolvedValue([]);
    mockPrisma.review.count.mockResolvedValue(0);
    await GET(makeGetRequest({ sort: "rating_high" }));
    const callArg = mockPrisma.review.findMany.mock.calls[0][0];
    expect(callArg.orderBy).toEqual({ rating: "desc" });
  });

  test("TC-API-R-008: sort=rating_low orders by rating asc", async () => {
    mockAuth.mockResolvedValue(null);
    mockPrisma.review.findMany.mockResolvedValue([]);
    mockPrisma.review.count.mockResolvedValue(0);
    await GET(makeGetRequest({ sort: "rating_low" }));
    const callArg = mockPrisma.review.findMany.mock.calls[0][0];
    expect(callArg.orderBy).toEqual({ rating: "asc" });
  });

  test("TC-API-R-009: default sort orders by createdAt desc", async () => {
    mockAuth.mockResolvedValue(null);
    mockPrisma.review.findMany.mockResolvedValue([]);
    mockPrisma.review.count.mockResolvedValue(0);
    await GET(makeGetRequest());
    const callArg = mockPrisma.review.findMany.mock.calls[0][0];
    expect(callArg.orderBy).toEqual({ createdAt: "desc" });
  });

  test("TC-API-R-010: pageSize is capped at 50", async () => {
    mockAuth.mockResolvedValue(null);
    mockPrisma.review.findMany.mockResolvedValue([]);
    mockPrisma.review.count.mockResolvedValue(0);
    await GET(makeGetRequest({ pageSize: "999" }));
    const callArg = mockPrisma.review.findMany.mock.calls[0][0];
    expect(callArg.take).toBe(50);
  });
});

// ─── POST /api/reviews ────────────────────────────────────────────────────────

describe("POST /api/reviews", () => {
  beforeEach(() => jest.clearAllMocks());

  const validBody = {
    gameId: "game-1",
    content: "An amazing open-world RPG experience.",
    rating: 9,
    spoiler: false,
  };

  test("TC-API-R-011: returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makePostRequest(validBody));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized.");
  });

  test("TC-API-R-012: creates review and returns 201", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.game.findUnique.mockResolvedValue({ id: "game-1", title: "Elden Ring" });
    mockPrisma.review.findUnique.mockResolvedValue(null);
    mockPrisma.review.create.mockResolvedValue(mockReview);
    mockPrisma.activity.create.mockResolvedValue({});
    const res = await POST(makePostRequest(validBody));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.rating).toBe(9);
  });

  test("TC-API-R-013: returns 400 for content shorter than 10 chars", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await POST(makePostRequest({ ...validBody, content: "Too short" }));
    expect(res.status).toBe(400);
  });

  test("TC-API-R-014: returns 400 for rating above 10", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await POST(makePostRequest({ ...validBody, rating: 11 }));
    expect(res.status).toBe(400);
  });

  test("TC-API-R-015: returns 400 for rating below 0", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await POST(makePostRequest({ ...validBody, rating: -1 }));
    expect(res.status).toBe(400);
  });

  test("TC-API-R-016: returns 404 when game does not exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.game.findUnique.mockResolvedValue(null);
    const res = await POST(makePostRequest(validBody));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Game not found.");
  });

  test("TC-API-R-017: returns 409 when user already reviewed game", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.game.findUnique.mockResolvedValue({ id: "game-1", title: "Elden Ring" });
    mockPrisma.review.findUnique.mockResolvedValue(mockReview);
    const res = await POST(makePostRequest(validBody));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe("You have already reviewed this game.");
  });

  test("TC-API-R-018: returns 400 when gameId is empty", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await POST(makePostRequest({ ...validBody, gameId: "" }));
    expect(res.status).toBe(400);
  });

  test("TC-API-R-019: returns 500 on DB error during create", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.game.findUnique.mockResolvedValue({ id: "game-1", title: "Elden Ring" });
    mockPrisma.review.findUnique.mockResolvedValue(null);
    mockPrisma.review.create.mockRejectedValue(new Error("DB error"));
    const res = await POST(makePostRequest(validBody));
    expect(res.status).toBe(500);
  });

  test("TC-API-R-020: created review has liked: false", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.game.findUnique.mockResolvedValue({ id: "game-1", title: "Elden Ring" });
    mockPrisma.review.findUnique.mockResolvedValue(null);
    mockPrisma.review.create.mockResolvedValue(mockReview);
    mockPrisma.activity.create.mockResolvedValue({});
    const res = await POST(makePostRequest(validBody));
    const body = await res.json();
    expect(body.liked).toBe(false);
  });
});
