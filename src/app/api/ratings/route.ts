import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const ratingSchema = z.object({
  gameId: z.string().min(1),
  score: z.number().int().min(1).max(10),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const gameId = searchParams.get("gameId");

    if (!gameId) {
      return NextResponse.json({ error: "gameId is required." }, { status: 400 });
    }

    const session = await auth();

    const [aggregate, userRating] = await Promise.all([
      prisma.rating.aggregate({
        where: { gameId },
        _avg: { score: true },
        _count: true,
      }),
      session?.user?.id
        ? prisma.rating.findUnique({
            where: { userId_gameId: { userId: session.user.id, gameId } },
            select: { score: true },
          })
        : Promise.resolve(null),
    ]);

    return NextResponse.json({
      avg: aggregate._avg.score ?? 0,
      count: aggregate._count,
      userScore: userRating?.score ?? null,
    });
  } catch (err) {
    console.error("[GET /api/ratings]", err);
    return NextResponse.json({ error: "Failed to fetch ratings." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ratingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { gameId, score } = parsed.data;
    const userId = session.user.id;

    // Verify game exists
    const game = await prisma.game.findUnique({ where: { id: gameId }, select: { id: true } });
    if (!game) {
      return NextResponse.json({ error: "Game not found." }, { status: 404 });
    }

    const rating = await prisma.rating.upsert({
      where: { userId_gameId: { userId, gameId } },
      create: { userId, gameId, score },
      update: { score },
    });

    // Recalculate aggregate
    const aggregate = await prisma.rating.aggregate({
      where: { gameId },
      _avg: { score: true },
      _count: true,
    });

    return NextResponse.json({
      rating,
      avg: aggregate._avg.score ?? 0,
      count: aggregate._count,
    });
  } catch (err) {
    console.error("[POST /api/ratings]", err);
    return NextResponse.json({ error: "Failed to save rating." }, { status: 500 });
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

    await prisma.rating.delete({
      where: { userId_gameId: { userId: session.user.id, gameId } },
    });

    return NextResponse.json({ message: "Rating removed." });
  } catch (err) {
    console.error("[DELETE /api/ratings]", err);
    return NextResponse.json({ error: "Failed to remove rating." }, { status: 500 });
  }
}
