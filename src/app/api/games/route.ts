import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const createSchema = z
  .object({
    title: z.string().min(1).max(200),
    slug: z.string().min(1).max(220).optional(),
    description: z.string().min(1),
    shortDesc: z.string().max(300).optional().nullable(),
    coverImage: z.string().url().optional().nullable(),
    bannerImage: z.string().url().optional().nullable(),
    releaseDate: z.string().optional().nullable(),
    developer: z.string().max(150).optional().nullable(),
    publisher: z.string().max(150).optional().nullable(),
    website: z.string().url().optional().nullable(),
    metacriticScore: z.number().int().min(0).max(100).optional().nullable(),
    priceMin: z.number().min(0).max(99999).optional().nullable(),
    priceMax: z.number().min(0).max(99999).optional().nullable(),
    steamAppId: z.string().optional().nullable(),
    igdbId: z.string().optional().nullable(),
    featured: z.boolean().optional().default(false),
    published: z.boolean().optional().default(true),
    genreIds: z.array(z.string()).optional().default([]),
    platformIds: z.array(z.string()).optional().default([]),
    categoryIds: z.array(z.string()).optional().default([]),
  })
  .refine(
    (data) =>
      data.priceMin == null || data.priceMax == null || data.priceMax >= data.priceMin,
    { message: "Maximum price must be greater than or equal to minimum price.", path: ["priceMax"] }
  );

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      genreIds,
      platformIds,
      categoryIds,
      releaseDate,
      slug: providedSlug,
      ...data
    } = parsed.data;

    const slug = providedSlug?.trim() ? slugify(providedSlug) : slugify(data.title);

    const existing = await prisma.game.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A game with this slug already exists." }, { status: 409 });
    }

    const game = await prisma.game.create({
      data: {
        ...data,
        slug,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        genres: genreIds.length ? { create: genreIds.map((genreId) => ({ genreId })) } : undefined,
        platforms: platformIds.length ? { create: platformIds.map((platformId) => ({ platformId })) } : undefined,
        categories: categoryIds.length ? { create: categoryIds.map((categoryId) => ({ categoryId })) } : undefined,
      },
    });

    return NextResponse.json(game, { status: 201 });
  } catch (err) {
    console.error("[POST /api/games]", err);
    return NextResponse.json({ error: "Failed to create game." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q") ?? "";
    const genre = searchParams.get("genre") ?? "";
    const platform = searchParams.get("platform") ?? "";
    const sort = searchParams.get("sort") ?? "latest";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") ?? "24", 10));
    const featured = searchParams.get("featured") === "true";
    const publishedParam = searchParams.get("published");
    const isAdmin = searchParams.get("admin") === "true";

    const session = await auth();
    const isAdminUser = session?.user?.role === "ADMIN";

    // Build where clause
    const where: Record<string, unknown> = {};

    // Non-admins only see published games
    if (!isAdminUser || !isAdmin) {
      where.published = true;
    } else if (publishedParam !== null) {
      where.published = publishedParam === "true";
    }

    if (featured) {
      where.featured = true;
    }

    if (searchParams.get("featured") === "true" && isAdminUser) {
      where.featured = true;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { developer: { contains: q, mode: "insensitive" } },
        { publisher: { contains: q, mode: "insensitive" } },
        { shortDesc: { contains: q, mode: "insensitive" } },
      ];
    }

    if (genre) {
      where.genres = {
        some: { genre: { slug: genre } },
      };
    }

    if (platform) {
      where.platforms = {
        some: { platform: { slug: platform } },
      };
    }

    // Sort order
    type OrderBy = Record<string, "asc" | "desc"> | { releaseDate: "asc" | "desc" } | { title: "asc" | "desc" } | { createdAt: "asc" | "desc" };
    let orderBy: OrderBy = { createdAt: "desc" };
    switch (sort) {
      case "newest":
        orderBy = { releaseDate: "desc" };
        break;
      case "oldest":
        orderBy = { releaseDate: "asc" };
        break;
      case "title":
        orderBy = { title: "asc" };
        break;
      case "latest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const skip = (page - 1) * pageSize;

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          genres: { include: { genre: { select: { id: true, name: true, slug: true, color: true } } } },
          platforms: { include: { platform: { select: { id: true, name: true, slug: true } } } },
          categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
          _count: {
            select: { reviews: true, ratings: true, libraryEntries: true, wishlists: true },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.game.count({ where }),
    ]);

    // Compute average ratings
    const gameIds = games.map((g: { id: string }) => g.id);
    let ratingsMap: Record<string, number> = {};
    if (gameIds.length > 0) {
      const ratings = await prisma.rating.groupBy({
        by: ["gameId"],
        where: { gameId: { in: gameIds } },
        _avg: { score: true },
      });
      ratingsMap = Object.fromEntries(
        ratings.map((r: { gameId: string; _avg: { score: number | null } }) => [r.gameId, r._avg.score ?? 0])
      );
    }

    const gamesWithRatings = games.map((g: { id: string }) => ({
      ...g,
      avgRating: ratingsMap[g.id] ?? 0,
    }));

    return NextResponse.json({
      data: gamesWithRatings,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("[GET /api/games]", err);
    return NextResponse.json({ error: "Failed to fetch games." }, { status: 500 });
  }
}
