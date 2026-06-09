import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().max(120).optional().nullable(),
  content: z.string().min(10).max(10000).optional(),
  rating: z.number().int().min(0).max(10).optional(),
  spoiler: z.boolean().optional(),
  published: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
        game: { select: { id: true, title: true, slug: true, coverImage: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, username: true, image: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }

    const session = await auth();
    let liked = false;
    if (session?.user?.id) {
      const like = await prisma.reviewLike.findUnique({
        where: {
          userId_reviewId: { userId: session.user.id, reviewId: id },
        },
      });
      liked = !!like;
    }

    return NextResponse.json({ ...review, liked });
  } catch (err) {
    console.error("[GET /api/reviews/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch review." }, { status: 500 });
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

    // Verify ownership or admin
    const review = await prisma.review.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!review) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }
    if (review.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.review.update({
      where: { id },
      data: parsed.data,
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
        game: { select: { id: true, title: true, slug: true, coverImage: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/reviews/[id]]", err);
    return NextResponse.json({ error: "Failed to update review." }, { status: 500 });
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

    const review = await prisma.review.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!review) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }
    if (review.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ message: "Review deleted." });
  } catch (err) {
    console.error("[DELETE /api/reviews/[id]]", err);
    return NextResponse.json({ error: "Failed to delete review." }, { status: 500 });
  }
}
