import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { deleteImage } from "@/lib/cloudinary";
import { z } from "zod";

const createSchema = z.object({
  gameId: z.string().min(1),
  url: z.string().url(),
  publicId: z.string().min(1),
  caption: z.string().max(500).optional().nullable(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId") ?? undefined;
    const gameId = searchParams.get("gameId") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") ?? "24", 10));
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (gameId) where.gameId = gameId;

    const [items, total] = await Promise.all([
      prisma.screenshot.findMany({
        where,
        include: {
          game: { select: { id: true, title: true, slug: true } },
          user: { select: { id: true, name: true, username: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.screenshot.count({ where }),
    ]);

    return NextResponse.json({
      data: items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("[GET /api/screenshots]", err);
    return NextResponse.json({ error: "Failed to fetch screenshots." }, { status: 500 });
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

    const { gameId, url, publicId, caption, width, height } = parsed.data;
    const userId = session.user.id;

    const game = await prisma.game.findUnique({ where: { id: gameId }, select: { id: true } });
    if (!game) {
      return NextResponse.json({ error: "Game not found." }, { status: 404 });
    }

    const screenshot = await prisma.screenshot.create({
      data: {
        userId,
        gameId,
        url,
        publicId,
        caption: caption ?? null,
        width,
        height,
      },
      include: {
        game: { select: { id: true, title: true, slug: true } },
        user: { select: { id: true, name: true, username: true, image: true } },
      },
    });

    return NextResponse.json(screenshot, { status: 201 });
  } catch (err) {
    console.error("[POST /api/screenshots]", err);
    return NextResponse.json({ error: "Failed to create screenshot." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required." }, { status: 400 });
    }

    const screenshot = await prisma.screenshot.findUnique({
      where: { id },
      select: { userId: true, publicId: true },
    });
    if (!screenshot) {
      return NextResponse.json({ error: "Screenshot not found." }, { status: 404 });
    }
    if (screenshot.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (screenshot.publicId) {
      try {
        await deleteImage(screenshot.publicId);
      } catch (err) {
        console.error("[DELETE /api/screenshots] cloudinary destroy failed", err);
      }
    }

    await prisma.screenshot.delete({ where: { id } });

    return NextResponse.json({ message: "Screenshot deleted." });
  } catch (err) {
    console.error("[DELETE /api/screenshots]", err);
    return NextResponse.json({ error: "Failed to delete screenshot." }, { status: 500 });
  }
}
