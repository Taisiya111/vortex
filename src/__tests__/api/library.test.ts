import { NextRequest } from "next/server";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockEntry = {
  id: "entry-1",
  userId: "user-1",
  gameId: "game-1",
  status: "PLAYING",
  hoursPlayed: 42,
  startedAt: null,
  completedAt: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  game: { id: "game-1", title: "Elden Ring", slug: "elden-ring", coverImage: null },
};

const mockPrisma = {
  libraryEntry: {
    findMany: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
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

import { GET, POST, DELETE } from "@/app/api/library/route";

function makeRequest(method: string, params?: Record<string, string>, body?: object): NextRequest {
  const url = new URL("http://localhost/api/library");
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString(), {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ─── GET /api/library ─────────────────────────────────────────────────────────

describe("GET /api/library", () => {
  beforeEach(() => jest.clearAllMocks());

  test("TC-API-L-001: returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized.");
  });

  test("TC-API-L-002: returns paginated library entries", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.libraryEntry.findMany.mockResolvedValue([mockEntry]);
    mockPrisma.libraryEntry.count.mockResolvedValue(1);
    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.total).toBe(1);
  });

  test("TC-API-L-003: response includes pagination metadata", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.libraryEntry.findMany.mockResolvedValue([]);
    mockPrisma.libraryEntry.count.mockResolvedValue(0);
    const res = await GET(makeRequest("GET"));
    const body = await res.json();
    expect(body).toHaveProperty("page");
    expect(body).toHaveProperty("pageSize");
    expect(body).toHaveProperty("totalPages");
  });

  test("TC-API-L-004: filters by status when provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.libraryEntry.findMany.mockResolvedValue([mockEntry]);
    mockPrisma.libraryEntry.count.mockResolvedValue(1);
    await GET(makeRequest("GET", { status: "PLAYING" }));
    const callArg = mockPrisma.libraryEntry.findMany.mock.calls[0][0];
    expect(callArg.where.status).toBe("PLAYING");
  });

  test("TC-API-L-005: filters by gameId when provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.libraryEntry.findMany.mockResolvedValue([]);
    mockPrisma.libraryEntry.count.mockResolvedValue(0);
    await GET(makeRequest("GET", { gameId: "game-1" }));
    const callArg = mockPrisma.libraryEntry.findMany.mock.calls[0][0];
    expect(callArg.where.gameId).toBe("game-1");
  });

  test("TC-API-L-006: always filters by current userId", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-99" } });
    mockPrisma.libraryEntry.findMany.mockResolvedValue([]);
    mockPrisma.libraryEntry.count.mockResolvedValue(0);
    await GET(makeRequest("GET"));
    const callArg = mockPrisma.libraryEntry.findMany.mock.calls[0][0];
    expect(callArg.where.userId).toBe("user-99");
  });

  test("TC-API-L-007: pageSize is capped at 100", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.libraryEntry.findMany.mockResolvedValue([]);
    mockPrisma.libraryEntry.count.mockResolvedValue(0);
    await GET(makeRequest("GET", { pageSize: "999" }));
    const callArg = mockPrisma.libraryEntry.findMany.mock.calls[0][0];
    expect(callArg.take).toBe(100);
  });

  test("TC-API-L-008: returns 500 on DB error", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.libraryEntry.findMany.mockRejectedValue(new Error("DB error"));
    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to fetch library.");
  });
});

// ─── POST /api/library ────────────────────────────────────────────────────────

describe("POST /api/library", () => {
  beforeEach(() => jest.clearAllMocks());

  const validBody = { gameId: "game-1", status: "PLAYING" };

  test("TC-API-L-009: returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeRequest("POST", {}, validBody));
    expect(res.status).toBe(401);
  });

  test("TC-API-L-010: creates/updates library entry and returns 200", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.game.findUnique.mockResolvedValue({ id: "game-1", title: "Elden Ring" });
    mockPrisma.libraryEntry.upsert.mockResolvedValue(mockEntry);
    mockPrisma.activity.create.mockResolvedValue({});
    const res = await POST(makeRequest("POST", {}, validBody));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("PLAYING");
  });

  test("TC-API-L-011: returns 400 for invalid status value", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await POST(makeRequest("POST", {}, { gameId: "game-1", status: "INVALID" }));
    expect(res.status).toBe(400);
  });

  test("TC-API-L-012: returns 404 when game does not exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.game.findUnique.mockResolvedValue(null);
    const res = await POST(makeRequest("POST", {}, validBody));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Game not found.");
  });

  test("TC-API-L-013: returns 400 for missing gameId", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await POST(makeRequest("POST", {}, { status: "PLAYING" }));
    expect(res.status).toBe(400);
  });

  test("TC-API-L-014: returns 400 for hoursPlayed > 99999", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await POST(makeRequest("POST", {}, { gameId: "game-1", status: "PLAYING", hoursPlayed: 100000 }));
    expect(res.status).toBe(400);
  });

  test("TC-API-L-015: upsert called with correct userId and gameId", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-42" } });
    mockPrisma.game.findUnique.mockResolvedValue({ id: "game-1", title: "Elden Ring" });
    mockPrisma.libraryEntry.upsert.mockResolvedValue(mockEntry);
    mockPrisma.activity.create.mockResolvedValue({});
    await POST(makeRequest("POST", {}, validBody));
    const callArg = mockPrisma.libraryEntry.upsert.mock.calls[0][0];
    expect(callArg.where.userId_gameId.userId).toBe("user-42");
    expect(callArg.where.userId_gameId.gameId).toBe("game-1");
  });

  test("TC-API-L-016: accepts COMPLETED status", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.game.findUnique.mockResolvedValue({ id: "game-1", title: "Elden Ring" });
    mockPrisma.libraryEntry.upsert.mockResolvedValue({ ...mockEntry, status: "COMPLETED" });
    mockPrisma.activity.create.mockResolvedValue({});
    const res = await POST(makeRequest("POST", {}, { gameId: "game-1", status: "COMPLETED" }));
    expect(res.status).toBe(200);
  });

  test("TC-API-L-017: returns 500 on DB error", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.game.findUnique.mockResolvedValue({ id: "game-1", title: "Elden Ring" });
    mockPrisma.libraryEntry.upsert.mockRejectedValue(new Error("DB error"));
    const res = await POST(makeRequest("POST", {}, validBody));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to update library.");
  });
});

// ─── DELETE /api/library ──────────────────────────────────────────────────────

describe("DELETE /api/library", () => {
  beforeEach(() => jest.clearAllMocks());

  test("TC-API-L-018: returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE", { gameId: "game-1" }));
    expect(res.status).toBe(401);
  });

  test("TC-API-L-019: returns 400 when gameId is missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await DELETE(makeRequest("DELETE"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("gameId is required.");
  });

  test("TC-API-L-020: deletes library entry and returns 200", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.libraryEntry.delete.mockResolvedValue(mockEntry);
    const res = await DELETE(makeRequest("DELETE", { gameId: "game-1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Removed from library.");
  });

  test("TC-API-L-021: calls delete with correct userId_gameId composite key", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-5" } });
    mockPrisma.libraryEntry.delete.mockResolvedValue(mockEntry);
    await DELETE(makeRequest("DELETE", { gameId: "game-99" }));
    expect(mockPrisma.libraryEntry.delete).toHaveBeenCalledWith({
      where: { userId_gameId: { userId: "user-5", gameId: "game-99" } },
    });
  });

  test("TC-API-L-022: returns 500 when delete throws an error", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.libraryEntry.delete.mockRejectedValue(new Error("Record not found"));
    const res = await DELETE(makeRequest("DELETE", { gameId: "game-1" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to remove entry.");
  });
});
