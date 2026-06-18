import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        genres: {
          include: { genre: { select: { id: true, name: true, slug: true, color: true } } },
        },
        platforms: {
          include: { platform: { select: { id: true, name: true, slug: true } } },
        },
        categories: {
          include: { category: { select: { id: true, name: true, slug: true } } },
        },
        tags: {
          include: { tag: { select: { id: true, name: true, slug: true } } },
        },
        screenshots: { orderBy: { createdAt: "desc" } },
        _count: {
          select: { reviews: true, ratings: true, libraryEntries: true, wishlists: true },
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found." }, { status: 404 });
    }

    // Compute average rating
    const ratingData = await prisma.rating.aggregate({
      where: { gameId: id },
      _avg: { score: true },
    });

    return NextResponse.json({
      ...game,
      avgRating: ratingData._avg.score ?? 0,
    });
  } catch (err) {
    console.error("[GET /api/games/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch game." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const allowedFields = [
      "title",
      "slug",
      "description",
      "shortDesc",
      "coverImage",
      "bannerImage",
      "releaseDate",
      "developer",
      "publisher",
      "website",
      "metacriticScore",
      "priceMin",
      "priceMax",
      "steamAppId",
      "igdbId",
      "featured",
      "published",
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        data[field] = body[field];
      }
    }

    if ("releaseDate" in data) {
      const releaseDate = data.releaseDate;
      data.releaseDate = releaseDate ? new Date(releaseDate as string) : null;
    }

    if (
      data.priceMin != null &&
      data.priceMax != null &&
      (data.priceMax as number) < (data.priceMin as number)
    ) {
      return NextResponse.json(
        { error: "Maximum price must be greater than or equal to minimum price." },
        { status: 400 }
      );
    }

    const hasGenreIds = Array.isArray(body.genreIds);
    const hasPlatformIds = Array.isArray(body.platformIds);
    const hasCategoryIds = Array.isArray(body.categoryIds);

    if (Object.keys(data).length === 0 && !hasGenreIds && !hasPlatformIds && !hasCategoryIds) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    const game = await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length > 0) {
        await tx.game.update({ where: { id }, data });
      }

      if (hasGenreIds) {
        const genreIds = body.genreIds as string[];
        await tx.gameGenre.deleteMany({ where: { gameId: id } });
        if (genreIds.length > 0) {
          await tx.gameGenre.createMany({
            data: genreIds.map((genreId) => ({ gameId: id, genreId })),
          });
        }
      }

      if (hasPlatformIds) {
        const platformIds = body.platformIds as string[];
        await tx.gamePlatform.deleteMany({ where: { gameId: id } });
        if (platformIds.length > 0) {
          await tx.gamePlatform.createMany({
            data: platformIds.map((platformId) => ({ gameId: id, platformId })),
          });
        }
      }

      if (hasCategoryIds) {
        const categoryIds = body.categoryIds as string[];
        await tx.gameCategory.deleteMany({ where: { gameId: id } });
        if (categoryIds.length > 0) {
          await tx.gameCategory.createMany({
            data: categoryIds.map((categoryId) => ({ gameId: id, categoryId })),
          });
        }
      }

      return tx.game.findUnique({
        where: { id },
        include: {
          genres: { include: { genre: { select: { id: true, name: true, slug: true, color: true } } } },
          platforms: { include: { platform: { select: { id: true, name: true, slug: true } } } },
          categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
        },
      });
    });

    return NextResponse.json(game);
  } catch (err) {
    console.error("[PATCH /api/games/[id]]", err);
    return NextResponse.json({ error: "Failed to update game." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    await prisma.game.delete({ where: { id } });

    return NextResponse.json({ message: "Game deleted." });
  } catch (err) {
    console.error("[DELETE /api/games/[id]]", err);
    return NextResponse.json({ error: "Failed to delete game." }, { status: 500 });
  }
}
