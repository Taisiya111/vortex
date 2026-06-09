import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { GameDetailClient } from "./game-detail-client";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await prisma.game.findUnique({ where: { slug }, select: { title: true, shortDesc: true } });
  if (!game) return { title: "Game not found" };
  return { title: game.title, description: game.shortDesc };
}

export default async function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  const game = await prisma.game.findUnique({
    where: { slug, published: true },
    include: {
      genres: { include: { genre: true } },
      platforms: { include: { platform: true } },
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      screenshots: { take: 8, orderBy: { createdAt: "desc" } },
      _count: { select: { reviews: true, ratings: true, libraryEntries: true, wishlists: true } },
    },
  });

  if (!game) notFound();

  // Aggregate average rating
  const ratingAgg = await prisma.rating.aggregate({
    where: { gameId: game.id },
    _avg: { score: true },
  });

  // Fetch reviews
  const reviews = await prisma.review.findMany({
    where: { gameId: game.id, published: true },
    include: {
      user: { select: { id: true, name: true, username: true, image: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // User-specific data
  let userLibraryEntry = null;
  let userRating = null;
  let userReview = null;
  let isWishlisted = false;

  if (session?.user?.id) {
    [userLibraryEntry, userRating, userReview, isWishlisted] = await Promise.all([
      prisma.libraryEntry.findUnique({ where: { userId_gameId: { userId: session.user.id, gameId: game.id } } }),
      prisma.rating.findUnique({ where: { userId_gameId: { userId: session.user.id, gameId: game.id } } }),
      prisma.review.findUnique({ where: { userId_gameId: { userId: session.user.id, gameId: game.id } } }),
      prisma.wishlist.findUnique({ where: { userId_gameId: { userId: session.user.id, gameId: game.id } } }).then(Boolean),
    ]);
  }

  // Similar games by genre
  const similarGames = game.genres.length > 0
    ? await prisma.game.findMany({
        where: {
          published: true,
          id: { not: game.id },
          genres: { some: { genreId: game.genres[0].genreId } },
        },
        include: {
          genres: { include: { genre: true } },
          platforms: { include: { platform: true } },
          _count: { select: { reviews: true, ratings: true } },
        },
        take: 6,
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <GameDetailClient
      game={game as Parameters<typeof GameDetailClient>[0]["game"]}
      avgRating={ratingAgg._avg.score ?? 0}
      reviews={reviews as Parameters<typeof GameDetailClient>[0]["reviews"]}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      similarGames={similarGames as any}
      userLibraryEntry={userLibraryEntry}
      userRating={userRating}
      userReview={userReview}
      isWishlisted={isWishlisted}
      isAuthenticated={!!session}
    />
  );
}
