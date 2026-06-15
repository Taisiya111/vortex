import { z } from "zod";

// ─── Schemas extracted from API routes ────────────────────────────────────────

const reviewCreateSchema = z.object({
  gameId: z.string().min(1),
  title: z.string().max(120).optional().nullable(),
  content: z.string().min(10).max(10000),
  rating: z.number().int().min(0).max(10),
  spoiler: z.boolean().optional().default(false),
});

const profileUpdateSchema = z
  .object({
    name: z.string().min(2).max(60).optional(),
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-z0-9_]+$/)
      .optional()
      .nullable(),
    bio: z.string().max(300).optional().nullable(),
    image: z.string().url().optional().nullable(),
    banner: z.string().url().optional().nullable(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z.string().min(8).max(128).optional(),
  })
  .refine((d) => !(d.newPassword && !d.currentPassword), {
    message: "Current password required when setting new password.",
  });

const libraryEntrySchema = z.object({
  gameId: z.string().min(1),
  status: z.enum(["PLAYING", "COMPLETED", "DROPPED", "PAUSED", "PLAN_TO_PLAY"]),
  hoursPlayed: z.number().min(0).max(99999).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

const wishlistAddSchema = z.object({
  gameId: z.string().min(1),
  priority: z.number().int().min(0).max(10).optional(),
  notes: z.string().max(500).optional().nullable(),
});

const gameCreateSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(220),
  description: z.string().min(1),
  shortDesc: z.string().max(300).optional().nullable(),
  coverImage: z.string().optional().nullable(),
  bannerImage: z.string().optional().nullable(),
  releaseDate: z.string().optional().nullable(),
  developer: z.string().max(150).optional().nullable(),
  publisher: z.string().max(150).optional().nullable(),
  website: z.string().url().optional().nullable(),
  metacriticScore: z.number().int().min(0).max(100).optional().nullable(),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
  genreIds: z.array(z.string()).optional().default([]),
  platformIds: z.array(z.string()).optional().default([]),
  categoryIds: z.array(z.string()).optional().default([]),
});

const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const collectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  public: z.boolean().optional().default(true),
});

// ─── Review Schema ─────────────────────────────────────────────────────────────

describe("reviewCreateSchema", () => {
  test("TC-S-001: valid review passes", () => {
    const result = reviewCreateSchema.safeParse({
      gameId: "clid123",
      content: "This is a great game with deep mechanics.",
      rating: 8,
    });
    expect(result.success).toBe(true);
  });

  test("TC-S-002: missing gameId fails", () => {
    const result = reviewCreateSchema.safeParse({ content: "Great game", rating: 7 });
    expect(result.success).toBe(false);
  });

  test("TC-S-003: empty gameId fails", () => {
    const result = reviewCreateSchema.safeParse({ gameId: "", content: "Great game worth playing", rating: 7 });
    expect(result.success).toBe(false);
  });

  test("TC-S-004: content shorter than 10 chars fails", () => {
    const result = reviewCreateSchema.safeParse({ gameId: "abc", content: "Short", rating: 5 });
    expect(result.success).toBe(false);
  });

  test("TC-S-005: content exactly 10 chars passes", () => {
    const result = reviewCreateSchema.safeParse({ gameId: "abc", content: "1234567890", rating: 5 });
    expect(result.success).toBe(true);
  });

  test("TC-S-006: content over 10000 chars fails", () => {
    const result = reviewCreateSchema.safeParse({ gameId: "abc", content: "a".repeat(10001), rating: 5 });
    expect(result.success).toBe(false);
  });

  test("TC-S-007: content exactly 10000 chars passes", () => {
    const result = reviewCreateSchema.safeParse({ gameId: "abc", content: "a".repeat(10000), rating: 5 });
    expect(result.success).toBe(true);
  });

  test("TC-S-008: rating of 0 passes (minimum)", () => {
    const result = reviewCreateSchema.safeParse({ gameId: "abc", content: "Great game here!", rating: 0 });
    expect(result.success).toBe(true);
  });

  test("TC-S-009: rating of 10 passes (maximum)", () => {
    const result = reviewCreateSchema.safeParse({ gameId: "abc", content: "Perfect game ever!", rating: 10 });
    expect(result.success).toBe(true);
  });

  test("TC-S-010: rating of 11 fails", () => {
    const result = reviewCreateSchema.safeParse({ gameId: "abc", content: "Good game overall.", rating: 11 });
    expect(result.success).toBe(false);
  });

  test("TC-S-011: rating of -1 fails", () => {
    const result = reviewCreateSchema.safeParse({ gameId: "abc", content: "Terrible game.", rating: -1 });
    expect(result.success).toBe(false);
  });

  test("TC-S-012: rating as float fails (not int)", () => {
    const result = reviewCreateSchema.safeParse({ gameId: "abc", content: "Average game here.", rating: 7.5 });
    expect(result.success).toBe(false);
  });

  test("TC-S-013: spoiler defaults to false when omitted", () => {
    const result = reviewCreateSchema.safeParse({ gameId: "abc", content: "A long enough review", rating: 5 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.spoiler).toBe(false);
  });

  test("TC-S-014: spoiler: true is accepted", () => {
    const result = reviewCreateSchema.safeParse({ gameId: "abc", content: "A long enough review", rating: 5, spoiler: true });
    expect(result.success).toBe(true);
  });

  test("TC-S-015: title over 120 chars fails", () => {
    const result = reviewCreateSchema.safeParse({ gameId: "abc", title: "T".repeat(121), content: "A long enough review", rating: 5 });
    expect(result.success).toBe(false);
  });

  test("TC-S-016: title exactly 120 chars passes", () => {
    const result = reviewCreateSchema.safeParse({ gameId: "abc", title: "T".repeat(120), content: "A long enough review", rating: 5 });
    expect(result.success).toBe(true);
  });

  test("TC-S-017: null title is accepted", () => {
    const result = reviewCreateSchema.safeParse({ gameId: "abc", title: null, content: "A long enough review", rating: 5 });
    expect(result.success).toBe(true);
  });

  test("TC-S-018: missing rating fails", () => {
    const result = reviewCreateSchema.safeParse({ gameId: "abc", content: "A long enough review" });
    expect(result.success).toBe(false);
  });
});

// ─── Profile Update Schema ─────────────────────────────────────────────────────

describe("profileUpdateSchema", () => {
  test("TC-S-019: valid name update passes", () => {
    const result = profileUpdateSchema.safeParse({ name: "Alice" });
    expect(result.success).toBe(true);
  });

  test("TC-S-020: name shorter than 2 chars fails", () => {
    const result = profileUpdateSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
  });

  test("TC-S-021: name over 60 chars fails", () => {
    const result = profileUpdateSchema.safeParse({ name: "A".repeat(61) });
    expect(result.success).toBe(false);
  });

  test("TC-S-022: name exactly 60 chars passes", () => {
    const result = profileUpdateSchema.safeParse({ name: "A".repeat(60) });
    expect(result.success).toBe(true);
  });

  test("TC-S-023: valid lowercase username passes", () => {
    const result = profileUpdateSchema.safeParse({ username: "alice_123" });
    expect(result.success).toBe(true);
  });

  test("TC-S-024: username with uppercase fails", () => {
    const result = profileUpdateSchema.safeParse({ username: "Alice" });
    expect(result.success).toBe(false);
  });

  test("TC-S-025: username with spaces fails", () => {
    const result = profileUpdateSchema.safeParse({ username: "alice bob" });
    expect(result.success).toBe(false);
  });

  test("TC-S-026: username shorter than 3 chars fails", () => {
    const result = profileUpdateSchema.safeParse({ username: "ab" });
    expect(result.success).toBe(false);
  });

  test("TC-S-027: username over 30 chars fails", () => {
    const result = profileUpdateSchema.safeParse({ username: "a".repeat(31) });
    expect(result.success).toBe(false);
  });

  test("TC-S-028: bio over 300 chars fails", () => {
    const result = profileUpdateSchema.safeParse({ bio: "a".repeat(301) });
    expect(result.success).toBe(false);
  });

  test("TC-S-029: bio exactly 300 chars passes", () => {
    const result = profileUpdateSchema.safeParse({ bio: "a".repeat(300) });
    expect(result.success).toBe(true);
  });

  test("TC-S-030: valid image URL passes", () => {
    const result = profileUpdateSchema.safeParse({ image: "https://res.cloudinary.com/test/image.jpg" });
    expect(result.success).toBe(true);
  });

  test("TC-S-031: invalid image URL fails", () => {
    const result = profileUpdateSchema.safeParse({ image: "not-a-url" });
    expect(result.success).toBe(false);
  });

  test("TC-S-032: newPassword without currentPassword fails", () => {
    const result = profileUpdateSchema.safeParse({ newPassword: "NewPass123!" });
    expect(result.success).toBe(false);
  });

  test("TC-S-033: newPassword with currentPassword passes", () => {
    const result = profileUpdateSchema.safeParse({ currentPassword: "OldPass1", newPassword: "NewPass123!" });
    expect(result.success).toBe(true);
  });

  test("TC-S-034: newPassword shorter than 8 chars fails", () => {
    const result = profileUpdateSchema.safeParse({ currentPassword: "OldPass1", newPassword: "short" });
    expect(result.success).toBe(false);
  });

  test("TC-S-035: empty object passes (no changes)", () => {
    const result = profileUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ─── Library Entry Schema ──────────────────────────────────────────────────────

describe("libraryEntrySchema", () => {
  test("TC-S-036: valid entry with PLAYING status passes", () => {
    const result = libraryEntrySchema.safeParse({ gameId: "abc", status: "PLAYING" });
    expect(result.success).toBe(true);
  });

  test("TC-S-037: COMPLETED status passes", () => {
    const result = libraryEntrySchema.safeParse({ gameId: "abc", status: "COMPLETED" });
    expect(result.success).toBe(true);
  });

  test("TC-S-038: DROPPED status passes", () => {
    const result = libraryEntrySchema.safeParse({ gameId: "abc", status: "DROPPED" });
    expect(result.success).toBe(true);
  });

  test("TC-S-039: PAUSED status passes", () => {
    const result = libraryEntrySchema.safeParse({ gameId: "abc", status: "PAUSED" });
    expect(result.success).toBe(true);
  });

  test("TC-S-040: PLAN_TO_PLAY status passes", () => {
    const result = libraryEntrySchema.safeParse({ gameId: "abc", status: "PLAN_TO_PLAY" });
    expect(result.success).toBe(true);
  });

  test("TC-S-041: invalid status fails", () => {
    const result = libraryEntrySchema.safeParse({ gameId: "abc", status: "WISHLIST" });
    expect(result.success).toBe(false);
  });

  test("TC-S-042: empty gameId fails", () => {
    const result = libraryEntrySchema.safeParse({ gameId: "", status: "PLAYING" });
    expect(result.success).toBe(false);
  });

  test("TC-S-043: hoursPlayed 0 passes", () => {
    const result = libraryEntrySchema.safeParse({ gameId: "abc", status: "PLAYING", hoursPlayed: 0 });
    expect(result.success).toBe(true);
  });

  test("TC-S-044: hoursPlayed 99999 passes (maximum)", () => {
    const result = libraryEntrySchema.safeParse({ gameId: "abc", status: "PLAYING", hoursPlayed: 99999 });
    expect(result.success).toBe(true);
  });

  test("TC-S-045: hoursPlayed 100000 fails (over maximum)", () => {
    const result = libraryEntrySchema.safeParse({ gameId: "abc", status: "PLAYING", hoursPlayed: 100000 });
    expect(result.success).toBe(false);
  });

  test("TC-S-046: hoursPlayed negative fails", () => {
    const result = libraryEntrySchema.safeParse({ gameId: "abc", status: "PLAYING", hoursPlayed: -1 });
    expect(result.success).toBe(false);
  });

  test("TC-S-047: notes over 2000 chars fails", () => {
    const result = libraryEntrySchema.safeParse({ gameId: "abc", status: "PLAYING", notes: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });

  test("TC-S-048: notes exactly 2000 chars passes", () => {
    const result = libraryEntrySchema.safeParse({ gameId: "abc", status: "PLAYING", notes: "a".repeat(2000) });
    expect(result.success).toBe(true);
  });
});

// ─── Wishlist Schema ───────────────────────────────────────────────────────────

describe("wishlistAddSchema", () => {
  test("TC-S-049: valid wishlist item passes", () => {
    const result = wishlistAddSchema.safeParse({ gameId: "abc", priority: 5 });
    expect(result.success).toBe(true);
  });

  test("TC-S-050: gameId required", () => {
    const result = wishlistAddSchema.safeParse({ priority: 5 });
    expect(result.success).toBe(false);
  });

  test("TC-S-051: priority 0 passes (minimum)", () => {
    const result = wishlistAddSchema.safeParse({ gameId: "abc", priority: 0 });
    expect(result.success).toBe(true);
  });

  test("TC-S-052: priority 10 passes (maximum)", () => {
    const result = wishlistAddSchema.safeParse({ gameId: "abc", priority: 10 });
    expect(result.success).toBe(true);
  });

  test("TC-S-053: priority 11 fails", () => {
    const result = wishlistAddSchema.safeParse({ gameId: "abc", priority: 11 });
    expect(result.success).toBe(false);
  });

  test("TC-S-054: notes over 500 chars fails", () => {
    const result = wishlistAddSchema.safeParse({ gameId: "abc", notes: "a".repeat(501) });
    expect(result.success).toBe(false);
  });

  test("TC-S-055: notes exactly 500 chars passes", () => {
    const result = wishlistAddSchema.safeParse({ gameId: "abc", notes: "a".repeat(500) });
    expect(result.success).toBe(true);
  });
});

// ─── Game Create Schema ────────────────────────────────────────────────────────

describe("gameCreateSchema", () => {
  const validGame = {
    title: "Elden Ring",
    slug: "elden-ring",
    description: "An action RPG by FromSoftware.",
  };

  test("TC-S-056: minimal valid game passes", () => {
    expect(gameCreateSchema.safeParse(validGame).success).toBe(true);
  });

  test("TC-S-057: empty title fails", () => {
    expect(gameCreateSchema.safeParse({ ...validGame, title: "" }).success).toBe(false);
  });

  test("TC-S-058: title over 200 chars fails", () => {
    expect(gameCreateSchema.safeParse({ ...validGame, title: "T".repeat(201) }).success).toBe(false);
  });

  test("TC-S-059: empty slug fails", () => {
    expect(gameCreateSchema.safeParse({ ...validGame, slug: "" }).success).toBe(false);
  });

  test("TC-S-060: empty description fails", () => {
    expect(gameCreateSchema.safeParse({ ...validGame, description: "" }).success).toBe(false);
  });

  test("TC-S-061: metacriticScore 0 passes", () => {
    expect(gameCreateSchema.safeParse({ ...validGame, metacriticScore: 0 }).success).toBe(true);
  });

  test("TC-S-062: metacriticScore 100 passes", () => {
    expect(gameCreateSchema.safeParse({ ...validGame, metacriticScore: 100 }).success).toBe(true);
  });

  test("TC-S-063: metacriticScore 101 fails", () => {
    expect(gameCreateSchema.safeParse({ ...validGame, metacriticScore: 101 }).success).toBe(false);
  });

  test("TC-S-064: metacriticScore -1 fails", () => {
    expect(gameCreateSchema.safeParse({ ...validGame, metacriticScore: -1 }).success).toBe(false);
  });

  test("TC-S-065: valid website URL passes", () => {
    expect(gameCreateSchema.safeParse({ ...validGame, website: "https://eldenring.com" }).success).toBe(true);
  });

  test("TC-S-066: invalid website URL fails", () => {
    expect(gameCreateSchema.safeParse({ ...validGame, website: "not-url" }).success).toBe(false);
  });

  test("TC-S-067: developer over 150 chars fails", () => {
    expect(gameCreateSchema.safeParse({ ...validGame, developer: "D".repeat(151) }).success).toBe(false);
  });

  test("TC-S-068: publisher over 150 chars fails", () => {
    expect(gameCreateSchema.safeParse({ ...validGame, publisher: "P".repeat(151) }).success).toBe(false);
  });

  test("TC-S-069: genreIds array passes", () => {
    expect(gameCreateSchema.safeParse({ ...validGame, genreIds: ["id1", "id2"] }).success).toBe(true);
  });

  test("TC-S-070: featured defaults to false", () => {
    const result = gameCreateSchema.safeParse(validGame);
    expect(result.success && result.data.featured).toBe(false);
  });

  test("TC-S-071: published defaults to true", () => {
    const result = gameCreateSchema.safeParse(validGame);
    expect(result.success && result.data.published).toBe(true);
  });
});

// ─── Register Schema ───────────────────────────────────────────────────────────

describe("registerSchema", () => {
  test("TC-S-072: valid registration passes", () => {
    const result = registerSchema.safeParse({ name: "Alice", email: "alice@example.com", password: "Password1!" });
    expect(result.success).toBe(true);
  });

  test("TC-S-073: name under 2 chars fails", () => {
    const result = registerSchema.safeParse({ name: "A", email: "a@b.com", password: "Password1!" });
    expect(result.success).toBe(false);
  });

  test("TC-S-074: invalid email fails", () => {
    const result = registerSchema.safeParse({ name: "Alice", email: "notanemail", password: "Password1!" });
    expect(result.success).toBe(false);
  });

  test("TC-S-075: password under 8 chars fails", () => {
    const result = registerSchema.safeParse({ name: "Alice", email: "a@b.com", password: "short" });
    expect(result.success).toBe(false);
  });

  test("TC-S-076: password exactly 8 chars passes", () => {
    const result = registerSchema.safeParse({ name: "Alice", email: "a@b.com", password: "Pass1234" });
    expect(result.success).toBe(true);
  });

  test("TC-S-077: password over 128 chars fails", () => {
    const result = registerSchema.safeParse({ name: "Alice", email: "a@b.com", password: "P".repeat(129) });
    expect(result.success).toBe(false);
  });

  test("TC-S-078: missing all fields fails", () => {
    const result = registerSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ─── Collection Schema ─────────────────────────────────────────────────────────

describe("collectionSchema", () => {
  test("TC-S-079: valid collection passes", () => {
    expect(collectionSchema.safeParse({ name: "My Favorites" }).success).toBe(true);
  });

  test("TC-S-080: empty name fails", () => {
    expect(collectionSchema.safeParse({ name: "" }).success).toBe(false);
  });

  test("TC-S-081: name over 100 chars fails", () => {
    expect(collectionSchema.safeParse({ name: "N".repeat(101) }).success).toBe(false);
  });

  test("TC-S-082: description over 500 chars fails", () => {
    expect(collectionSchema.safeParse({ name: "Test", description: "D".repeat(501) }).success).toBe(false);
  });

  test("TC-S-083: public defaults to true", () => {
    const result = collectionSchema.safeParse({ name: "Test" });
    expect(result.success && result.data.public).toBe(true);
  });

  test("TC-S-084: public: false is accepted", () => {
    expect(collectionSchema.safeParse({ name: "Secret", public: false }).success).toBe(true);
  });
});
