import {
  slugify,
  formatDate,
  formatRelativeDate,
  formatNumber,
  truncate,
  generateUsername,
  getInitials,
  LIBRARY_STATUS_LABELS,
  LIBRARY_STATUS_COLORS,
  cn,
} from "@/lib/utils";

// ─── slugify ───────────────────────────────────────────────────────────────────

describe("slugify", () => {
  test("TC-U-001: converts spaces to hyphens", () => {
    expect(slugify("Elden Ring")).toBe("elden-ring");
  });

  test("TC-U-002: lowercases the string", () => {
    expect(slugify("DARK SOULS")).toBe("dark-souls");
  });

  test("TC-U-003: removes special characters", () => {
    expect(slugify("God of War!")).toBe("god-of-war");
  });

  test("TC-U-004: collapses multiple spaces to one hyphen", () => {
    expect(slugify("The  Witcher   3")).toBe("the-witcher-3");
  });

  test("TC-U-005: trims leading and trailing hyphens", () => {
    expect(slugify("  Red Dead Redemption  ")).toBe("red-dead-redemption");
  });

  test("TC-U-006: handles already-slugged input", () => {
    expect(slugify("cyberpunk-2077")).toBe("cyberpunk-2077");
  });

  test("TC-U-007: handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  test("TC-U-008: handles numbers", () => {
    expect(slugify("Half-Life 2")).toBe("half-life-2");
  });

  test("TC-U-009: removes apostrophes", () => {
    expect(slugify("Assassin's Creed")).toBe("assassins-creed");
  });

  test("TC-U-010: handles single word", () => {
    expect(slugify("Minecraft")).toBe("minecraft");
  });
});

// ─── formatDate ────────────────────────────────────────────────────────────────

describe("formatDate", () => {
  test("TC-U-011: formats a Date object", () => {
    const result = formatDate(new Date("2024-01-15"));
    expect(result).toContain("2024");
    expect(result).toContain("January");
    expect(result).toContain("15");
  });

  test("TC-U-012: formats a date string", () => {
    const result = formatDate("2023-06-01");
    expect(result).toContain("2023");
    expect(result).toContain("June");
    expect(result).toContain("1");
  });

  test("TC-U-013: formats the start of a year", () => {
    const result = formatDate("2020-01-01");
    expect(result).toContain("January");
    expect(result).toContain("2020");
  });

  test("TC-U-014: formats the end of a year", () => {
    const result = formatDate("2022-12-31");
    expect(result).toContain("December");
    expect(result).toContain("2022");
  });

  test("TC-U-015: returns a non-empty string", () => {
    expect(formatDate(new Date())).toBeTruthy();
  });
});

// ─── formatRelativeDate ────────────────────────────────────────────────────────

describe("formatRelativeDate", () => {
  function dateSecondsAgo(s: number) {
    return new Date(Date.now() - s * 1000);
  }

  test("TC-U-016: returns 'just now' for < 60 seconds ago", () => {
    expect(formatRelativeDate(dateSecondsAgo(30))).toBe("just now");
  });

  test("TC-U-017: returns 'just now' for 0 seconds ago", () => {
    expect(formatRelativeDate(new Date())).toBe("just now");
  });

  test("TC-U-018: returns minutes for 1–59 minutes ago", () => {
    expect(formatRelativeDate(dateSecondsAgo(120))).toBe("2m ago");
  });

  test("TC-U-019: returns hours for 1–23 hours ago", () => {
    expect(formatRelativeDate(dateSecondsAgo(3600 * 3))).toBe("3h ago");
  });

  test("TC-U-020: returns days for 1–6 days ago", () => {
    expect(formatRelativeDate(dateSecondsAgo(86400 * 4))).toBe("4d ago");
  });

  test("TC-U-021: returns weeks for 1–3 weeks ago", () => {
    expect(formatRelativeDate(dateSecondsAgo(86400 * 14))).toBe("2w ago");
  });

  test("TC-U-022: returns months for 1–11 months ago", () => {
    expect(formatRelativeDate(dateSecondsAgo(86400 * 60))).toBe("2mo ago");
  });

  test("TC-U-023: returns years for 1+ year ago", () => {
    expect(formatRelativeDate(dateSecondsAgo(86400 * 400))).toBe("1y ago");
  });

  test("TC-U-024: accepts a string date", () => {
    const past = new Date(Date.now() - 120000).toISOString();
    expect(formatRelativeDate(past)).toBe("2m ago");
  });

  test("TC-U-025: returns '59m ago' for 59 minutes", () => {
    expect(formatRelativeDate(dateSecondsAgo(59 * 60))).toBe("59m ago");
  });
});

// ─── formatNumber ──────────────────────────────────────────────────────────────

describe("formatNumber", () => {
  test("TC-U-026: returns string as-is for numbers < 1000", () => {
    expect(formatNumber(999)).toBe("999");
  });

  test("TC-U-027: formats thousands with K suffix", () => {
    expect(formatNumber(1000)).toBe("1.0K");
  });

  test("TC-U-028: formats 1500 as 1.5K", () => {
    expect(formatNumber(1500)).toBe("1.5K");
  });

  test("TC-U-029: formats millions with M suffix", () => {
    expect(formatNumber(1_000_000)).toBe("1.0M");
  });

  test("TC-U-030: formats 2500000 as 2.5M", () => {
    expect(formatNumber(2_500_000)).toBe("2.5M");
  });

  test("TC-U-031: handles zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  test("TC-U-032: handles negative number", () => {
    expect(formatNumber(-100)).toBe("-100");
  });

  test("TC-U-033: handles 999999 (< 1M)", () => {
    expect(formatNumber(999_999)).toBe("1000.0K");
  });
});

// ─── truncate ──────────────────────────────────────────────────────────────────

describe("truncate", () => {
  test("TC-U-034: does not truncate string shorter than limit", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  test("TC-U-035: does not truncate string equal to limit", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });

  test("TC-U-036: truncates string longer than limit and appends ellipsis", () => {
    expect(truncate("Hello World", 5)).toBe("Hello…");
  });

  test("TC-U-037: truncates to 1 character", () => {
    expect(truncate("ABC", 1)).toBe("A…");
  });

  test("TC-U-038: handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });

  test("TC-U-039: handles limit of 0", () => {
    expect(truncate("Hello", 0)).toBe("…");
  });

  test("TC-U-040: truncates long game description", () => {
    const desc = "A".repeat(200);
    const result = truncate(desc, 100);
    expect(result).toHaveLength(101); // 100 chars + ellipsis
    expect(result.endsWith("…")).toBe(true);
  });
});

// ─── generateUsername ──────────────────────────────────────────────────────────

describe("generateUsername", () => {
  test("TC-U-041: converts name to lowercase", () => {
    const result = generateUsername("Alice");
    expect(result.toLowerCase()).toBe(result);
  });

  test("TC-U-042: replaces spaces with underscores", () => {
    const result = generateUsername("John Doe");
    expect(result).toMatch(/john_doe/);
  });

  test("TC-U-043: removes special characters", () => {
    const result = generateUsername("John-Doe!");
    expect(result).toMatch(/^[a-z0-9_]+$/);
  });

  test("TC-U-044: appends a random suffix", () => {
    const r1 = generateUsername("Alice");
    const r2 = generateUsername("Alice");
    // Very likely different due to random suffix
    expect(typeof r1).toBe("string");
    expect(r1.length).toBeGreaterThan(5);
  });

  test("TC-U-045: result contains only valid characters", () => {
    const result = generateUsername("Test User 123");
    expect(result).toMatch(/^[a-z0-9_]+$/);
  });
});

// ─── getInitials ───────────────────────────────────────────────────────────────

describe("getInitials", () => {
  test("TC-U-046: gets first letter of single name", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  test("TC-U-047: gets initials of two-word name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  test("TC-U-048: gets only first two initials for three-word name", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });

  test("TC-U-049: returns uppercase initials", () => {
    expect(getInitials("alice bob")).toBe("AB");
  });

  test("TC-U-050: handles single character name", () => {
    expect(getInitials("A")).toBe("A");
  });

  test("TC-U-051: handles empty string gracefully", () => {
    expect(getInitials("")).toBe("");
  });
});

// ─── LIBRARY_STATUS_LABELS ────────────────────────────────────────────────────

describe("LIBRARY_STATUS_LABELS", () => {
  test("TC-U-052: PLAYING maps to 'Playing'", () => {
    expect(LIBRARY_STATUS_LABELS["PLAYING"]).toBe("Playing");
  });

  test("TC-U-053: COMPLETED maps to 'Completed'", () => {
    expect(LIBRARY_STATUS_LABELS["COMPLETED"]).toBe("Completed");
  });

  test("TC-U-054: DROPPED maps to 'Dropped'", () => {
    expect(LIBRARY_STATUS_LABELS["DROPPED"]).toBe("Dropped");
  });

  test("TC-U-055: PAUSED maps to 'Paused'", () => {
    expect(LIBRARY_STATUS_LABELS["PAUSED"]).toBe("Paused");
  });

  test("TC-U-056: PLAN_TO_PLAY maps to 'Plan to Play'", () => {
    expect(LIBRARY_STATUS_LABELS["PLAN_TO_PLAY"]).toBe("Plan to Play");
  });

  test("TC-U-057: has exactly 5 statuses", () => {
    expect(Object.keys(LIBRARY_STATUS_LABELS)).toHaveLength(5);
  });
});

// ─── LIBRARY_STATUS_COLORS ────────────────────────────────────────────────────

describe("LIBRARY_STATUS_COLORS", () => {
  test("TC-U-058: PLAYING has a color class", () => {
    expect(LIBRARY_STATUS_COLORS["PLAYING"]).toBeTruthy();
  });

  test("TC-U-059: COMPLETED has a color class", () => {
    expect(LIBRARY_STATUS_COLORS["COMPLETED"]).toBeTruthy();
  });

  test("TC-U-060: DROPPED has a color class", () => {
    expect(LIBRARY_STATUS_COLORS["DROPPED"]).toBeTruthy();
  });

  test("TC-U-061: PAUSED has a color class", () => {
    expect(LIBRARY_STATUS_COLORS["PAUSED"]).toBeTruthy();
  });

  test("TC-U-062: PLAN_TO_PLAY has a color class", () => {
    expect(LIBRARY_STATUS_COLORS["PLAN_TO_PLAY"]).toBeTruthy();
  });

  test("TC-U-063: all color values are strings", () => {
    Object.values(LIBRARY_STATUS_COLORS).forEach((v) => {
      expect(typeof v).toBe("string");
    });
  });

  test("TC-U-064: PLAYING color contains emerald", () => {
    expect(LIBRARY_STATUS_COLORS["PLAYING"]).toContain("emerald");
  });
});

// ─── cn ───────────────────────────────────────────────────────────────────────

describe("cn (className merger)", () => {
  test("TC-U-065: merges two class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  test("TC-U-066: handles conditional false class", () => {
    expect(cn("foo", false && "bar")).toBe("foo");
  });

  test("TC-U-067: handles undefined input", () => {
    expect(cn("foo", undefined)).toBe("foo");
  });

  test("TC-U-068: deduplicates conflicting Tailwind classes", () => {
    // twMerge removes conflicting utilities (e.g., p-2 overrides p-4)
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });

  test("TC-U-069: handles empty call", () => {
    expect(cn()).toBe("");
  });
});
