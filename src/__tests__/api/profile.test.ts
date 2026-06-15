import { NextRequest } from "next/server";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUser = {
  id: "user-1",
  name: "Test User",
  username: "testuser",
  email: "test@example.com",
  image: null,
  banner: null,
  bio: "Hello world",
  role: "USER",
  password: "$2a$12$hashedpassword",
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { library: 5, reviews: 3, collections: 2, followers: 10, following: 7 },
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const mockAuth = jest.fn();
jest.mock("@/lib/auth", () => ({ auth: mockAuth }));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import bcrypt from "bcryptjs";

// Import after mocks
import { GET, PATCH, DELETE } from "@/app/api/profile/route";

function makeRequest(method: string, body?: object): NextRequest {
  return new NextRequest("http://localhost/api/profile", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ─── GET /api/profile ─────────────────────────────────────────────────────────

describe("GET /api/profile", () => {
  beforeEach(() => jest.clearAllMocks());

  test("TC-API-P-001: returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized.");
  });

  test("TC-API-P-002: returns user data when authenticated", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.email).toBe("test@example.com");
  });

  test("TC-API-P-003: returns 404 when user not found in DB", async () => {
    mockAuth.mockResolvedValue({ user: { id: "ghost" } });
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(404);
  });

  test("TC-API-P-004: returns 500 on DB error", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.user.findUnique.mockRejectedValue(new Error("DB error"));
    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(500);
  });

  test("TC-API-P-005: response includes _count statistics", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    const res = await GET(makeRequest("GET"));
    const body = await res.json();
    expect(body._count).toBeDefined();
    expect(body._count.library).toBe(5);
  });
});

// ─── PATCH /api/profile ───────────────────────────────────────────────────────

describe("PATCH /api/profile", () => {
  beforeEach(() => jest.clearAllMocks());

  test("TC-API-P-006: returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PATCH(makeRequest("PATCH", { name: "Alice" }));
    expect(res.status).toBe(401);
  });

  test("TC-API-P-007: updates name successfully", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.user.update.mockResolvedValue({ ...mockUser, name: "New Name" });
    const res = await PATCH(makeRequest("PATCH", { name: "New Name" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("New Name");
  });

  test("TC-API-P-008: returns 400 for invalid input (name < 2 chars)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await PATCH(makeRequest("PATCH", { name: "A" }));
    expect(res.status).toBe(400);
  });

  test("TC-API-P-009: returns 409 when username is taken", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.user.findFirst.mockResolvedValue({ id: "user-2" });
    const res = await PATCH(makeRequest("PATCH", { username: "takenuser" }));
    expect(res.status).toBe(409);
  });

  test("TC-API-P-010: returns 200 when username is available", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.update.mockResolvedValue({ ...mockUser, username: "newuser" });
    const res = await PATCH(makeRequest("PATCH", { username: "newuser" }));
    expect(res.status).toBe(200);
  });

  test("TC-API-P-011: returns 400 for username with uppercase", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await PATCH(makeRequest("PATCH", { username: "InvalidUser" }));
    expect(res.status).toBe(400);
  });

  test("TC-API-P-012: password change without currentPassword returns 400", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await PATCH(makeRequest("PATCH", { newPassword: "NewPass123!" }));
    expect(res.status).toBe(400);
  });

  test("TC-API-P-013: password change with wrong currentPassword returns 400", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.user.findUnique.mockResolvedValue({ password: "$2a$12$hash" });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const res = await PATCH(makeRequest("PATCH", { currentPassword: "wrong", newPassword: "NewPass123!" }));
    expect(res.status).toBe(400);
  });

  test("TC-API-P-014: password change with correct currentPassword returns 200", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.user.findUnique.mockResolvedValue({ password: "$2a$12$hash" });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue("$2a$12$newhash");
    mockPrisma.user.update.mockResolvedValue(mockUser);
    const res = await PATCH(makeRequest("PATCH", { currentPassword: "OldPass1", newPassword: "NewPass123!" }));
    expect(res.status).toBe(200);
  });

  test("TC-API-P-015: returns 400 if social login user tries to change password", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.user.findUnique.mockResolvedValue({ password: null });
    const res = await PATCH(makeRequest("PATCH", { currentPassword: "anything", newPassword: "NewPass123!" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("social login");
  });

  test("TC-API-P-016: returns 200 'No changes made' when payload is empty object", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const res = await PATCH(makeRequest("PATCH", {}));
    expect(res.status).toBe(200);
  });

  test("TC-API-P-017: returns 500 on unexpected DB error", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.update.mockRejectedValue(new Error("Connection error"));
    const res = await PATCH(makeRequest("PATCH", { username: "validuser" }));
    expect(res.status).toBe(500);
  });
});

// ─── DELETE /api/profile ──────────────────────────────────────────────────────

describe("DELETE /api/profile", () => {
  beforeEach(() => jest.clearAllMocks());

  test("TC-API-P-018: returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE"));
    expect(res.status).toBe(401);
  });

  test("TC-API-P-019: deletes user and returns 200", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.user.delete.mockResolvedValue(mockUser);
    const res = await DELETE(makeRequest("DELETE"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Account deleted.");
  });

  test("TC-API-P-020: calls prisma.user.delete with correct userId", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.user.delete.mockResolvedValue(mockUser);
    await DELETE(makeRequest("DELETE"));
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });

  test("TC-API-P-021: returns 500 when DB delete fails", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.user.delete.mockRejectedValue(new Error("Delete failed"));
    const res = await DELETE(makeRequest("DELETE"));
    expect(res.status).toBe(500);
  });

  test("TC-API-P-022: returns error message on failure", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.user.delete.mockRejectedValue(new Error("DB error"));
    const res = await DELETE(makeRequest("DELETE"));
    const body = await res.json();
    expect(body.error).toBe("Failed to delete account.");
  });
});
