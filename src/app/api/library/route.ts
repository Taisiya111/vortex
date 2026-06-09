import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const addSchema = z.object({
  gameId: z.string().min(1),
  status: z.enum(["PLAYING", "COMPLETED", "DROPPED", "PAUSED", "PLAN_TO_PLAY"]),
  hoursPlayed: z.number().min(0).max(99999).optional().nullable(),
  startedAt: z.string().datetime().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const userId = session.user.id;
    const status = searchParams.get("status") ?? undefined;
    const gameId = searchParams.get("gameId") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") ?? "50", 10));
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;
    if (gameId) where.gameId = gameId;

    const [entries, total] = await Promise.all([
      prisma.libraryEntry.findMany({
        where,
        include: {
          game: {
            include: {
              genres: { include: { genre: { select: { id: true, name: true, slug: true } } } },
              platforms: { include: { platform: { select: { id: true, name: true, slug: true } } } },
              _count: { select: { reviews: true, ratings: true } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.libraryEntry.count({ where }),
    ]);

    return NextResponse.json({
      data: entries,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("[GET /api/library]", err);
    return NextResponse.json({ error: "Failed to fetch library." }, { status: 500 });
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

    const { gameId, status, hoursPlayed, startedAt, completedAt, notes } = parsed.data;
    const userId = session.user.id;

    // Verify game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, title: true },
    });
    if (!game) {
      return NextResponse.json({ error: "Game not found." }, { status: 404 });
    }

    // Upsert the library entry
    const entry = await prisma.libraryEntry.upsert({
      where: { userId_gameId: { userId, gameId } },
      create: {
        userId,
        gameId,
        status,
        hoursPlayed: hoursPlayed ?? null,
        startedAt: startedAt ? new Date(startedAt) : null,
        completedAt: completedAt ? new Date(completedAt) : null,
        notes: notes ?? null,
      },
      update: {
        status,
        hoursPlayed: hoursPlayed ?? undefined,
        startedAt: startedAt ? new Date(startedAt) : undefined,
        completedAt: completedAt ? new Date(completedAt) : undefined,
        notes: notes ?? undefined,
      },
      include: {
        game: { select: { id: true, title: true, slug: true, coverImage: true } },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId,
        action: `added_to_library`,
        entityType: "game",
        entityId: gameId,
        metadata: { status, gameTitle: game.title },
      },
    });

    return NextResponse.json(entry, { status: 200 });
  } catch (err) {
    console.error("[POST /api/library]", err);
    return NextResponse.json({ error: "Failed to update library." }, { status: 500 });
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

    await prisma.libraryEntry.delete({
      where: { userId_gameId: { userId: session.user.id, gameId } },
    });

    return NextResponse.json({ message: "Removed from library." });
  } catch (err) {
    console.error("[DELETE /api/library]", err);
    return NextResponse.json({ error: "Failed to remove entry." }, { status: 500 });
  }
}
