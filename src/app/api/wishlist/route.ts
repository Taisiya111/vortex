import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const addSchema = z.object({
  gameId: z.string().min(1),
  priority: z.number().int().min(0).max(10).optional(),
  notes: z.string().max(500).optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const userId = session.user.id;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") ?? "50", 10));
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.wishlist.findMany({
        where: { userId },
        include: {
          game: {
            include: {
              genres: { include: { genre: { select: { id: true, name: true, slug: true } } } },
              platforms: { include: { platform: { select: { id: true, name: true, slug: true } } } },
              _count: { select: { reviews: true, ratings: true, libraryEntries: true } },
            },
          },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.wishlist.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      data: items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("[GET /api/wishlist]", err);
    return NextResponse.json({ error: "Failed to fetch wishlist." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = addSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { gameId, priority = 0, notes } = parsed.data;
    const userId = session.user.id;

    // Verify game exists
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return NextResponse.json({ error: "Game not found." }, { status: 404 });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Game already in wishlist." },
        { status: 409 }
      );
    }

    const item = await prisma.wishlist.create({
      data: { userId, gameId, priority, notes: notes ?? null },
      include: {
        game: { select: { id: true, title: true, slug: true, coverImage: true } },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("[POST /api/wishlist]", err);
    return NextResponse.json({ error: "Failed to add to wishlist." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const gameId = searchParams.get("gameId");

    if (!gameId) {
      return NextResponse.json({ error: "gameId is required." }, { status: 400 });
    }

    await prisma.wishlist.delete({
      where: { userId_gameId: { userId: session.user.id, gameId } },
    });

    return NextResponse.json({ message: "Removed from wishlist." });
  } catch (err) {
    console.error("[DELETE /api/wishlist]", err);
    return NextResponse.json({ error: "Failed to remove from wishlist." }, { status: 500 });
  }
}
