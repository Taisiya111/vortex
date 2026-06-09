import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  public: z.boolean().optional(),
});

const addItemSchema = z.object({
  gameId: z.string().min(1),
  notes: z.string().max(500).optional().nullable(),
  order: z.number().int().min(0).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
        items: {
          include: {
            game: {
              include: {
                genres: { include: { genre: { select: { id: true, name: true, slug: true } } } },
                platforms: { include: { platform: { select: { id: true, name: true, slug: true } } } },
                _count: { select: { reviews: true, ratings: true } },
              },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: { select: { items: true } },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found." }, { status: 404 });
    }

    // Private collections only visible to owner
    if (!collection.public && collection.userId !== session?.user?.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    return NextResponse.json(collection);
  } catch (err) {
    console.error("[GET /api/collections/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch collection." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    const collection = await prisma.collection.findUnique({
      where: { id },
      select: { userId: true, slug: true },
    });
    if (!collection) {
      return NextResponse.json({ error: "Collection not found." }, { status: 404 });
    }
    if (collection.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = await req.json();

    // Handle adding a game item
    if (body.action === "add_game") {
      const parsed = addItemSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid input.", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      const { gameId, notes, order = 0 } = parsed.data;

      const item = await prisma.collectionItem.upsert({
        where: { collectionId_gameId: { collectionId: id, gameId } },
        create: { collectionId: id, gameId, notes: notes ?? null, order },
        update: { notes: notes ?? undefined, order },
      });

      // Update collection's updatedAt
      await prisma.collection.update({ where: { id }, data: { updatedAt: new Date() } });

      return NextResponse.json(item);
    }

    // Handle removing a game
    if (body.action === "remove_game") {
      if (!body.gameId) {
        return NextResponse.json({ error: "gameId is required." }, { status: 400 });
      }
      await prisma.collectionItem.delete({
        where: { collectionId_gameId: { collectionId: id, gameId: body.gameId } },
      });
      await prisma.collection.update({ where: { id }, data: { updatedAt: new Date() } });
      return NextResponse.json({ message: "Game removed from collection." });
    }

    // Handle updating collection metadata
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) {
      updateData.name = parsed.data.name;
      const newSlug = slugify(parsed.data.name);
      const existingSlug = await prisma.collection.findFirst({
        where: { userId: collection.userId, slug: newSlug, id: { not: id } },
      });
      updateData.slug = existingSlug ? `${newSlug}-${Date.now()}` : newSlug;
    }
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.coverImage !== undefined) updateData.coverImage = parsed.data.coverImage;
    if (parsed.data.public !== undefined) updateData.public = parsed.data.public;

    const updated = await prisma.collection.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            game: { select: { id: true, title: true, slug: true, coverImage: true } },
          },
          orderBy: { order: "asc" },
          take: 4,
        },
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/collections/[id]]", err);
    return NextResponse.json({ error: "Failed to update collection." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    const collection = await prisma.collection.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!collection) {
      return NextResponse.json({ error: "Collection not found." }, { status: 404 });
    }
    if (collection.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    await prisma.collection.delete({ where: { id } });

    return NextResponse.json({ message: "Collection deleted." });
  } catch (err) {
    console.error("[DELETE /api/collections/[id]]", err);
    return NextResponse.json({ error: "Failed to delete collection." }, { status: 500 });
  }
}
