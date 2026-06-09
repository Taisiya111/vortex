import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  gameId: z.string().min(1),
  title: z.string().max(120).optional().nullable(),
  content: z.string().min(10).max(10000),
  rating: z.number().int().min(0).max(10),
  spoiler: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const gameId = searchParams.get("gameId") ?? undefined;
    const userId = searchParams.get("userId") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(50, parseInt(searchParams.get("pageSize") ?? "10", 10));
    const sort = searchParams.get("sort") ?? "recent";
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = { published: true };
    if (gameId) where.gameId = gameId;
    if (userId) where.userId = userId;

    type OrderBy = Record<string, "asc" | "desc">;
    let orderBy: OrderBy = { createdAt: "desc" };
    if (sort === "rating_high") orderBy = { rating: "desc" };
    if (sort === "rating_low") orderBy = { rating: "asc" };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, username: true, image: true },
          },
          game: {
            select: { id: true, title: true, slug: true, coverImage: true },
          },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.review.count({ where }),
    ]);

    // Check which reviews the current user liked
    const session = await auth();
    let likedIds: Set<string> = new Set();
    if (session?.user?.id) {
      const likes = await prisma.reviewLike.findMany({
        where: {
          userId: session.user.id,
          reviewId: { in: reviews.map((r: { id: string }) => r.id) },
        },
        select: { reviewId: true },
      });
      likedIds = new Set(likes.map((l: { reviewId: string }) => l.reviewId));
    }

    const reviewsWithLiked = reviews.map((r: { id: string }) => ({
      ...r,
      liked: likedIds.has(r.id),
    }));

    return NextResponse.json({
      data: reviewsWithLiked,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("[GET /api/reviews]", err);
    return NextResponse.json({ error: "Failed to fetch reviews." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
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

    const { gameId, title, content, rating, spoiler } = parsed.data;
    const userId = session.user.id;

    // Verify game exists
    const game = await prisma.game.findUnique({ where: { id: gameId }, select: { id: true, title: true } });
    if (!game) {
      return NextResponse.json({ error: "Game not found." }, { status: 404 });
    }

    // Check if user already reviewed this game
    const existing = await prisma.review.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this game." },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId,
        gameId,
        title: title ?? null,
        content,
        rating,
        spoiler,
        published: true,
      },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
        game: { select: { id: true, title: true, slug: true, coverImage: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId,
        action: "wrote_review",
        entityType: "review",
        entityId: review.id,
        metadata: { gameId, gameTitle: game.title, rating },
      },
    });

    return NextResponse.json({ ...review, liked: false }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/reviews]", err);
    return NextResponse.json({ error: "Failed to create review." }, { status: 500 });
  }
}
