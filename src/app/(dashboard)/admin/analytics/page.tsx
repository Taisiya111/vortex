import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminAnalyticsClient } from "./admin-analytics-client";

export const metadata = { title: "Analytics | Vortex" };

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const [
    signupsByDay,
    libraryStatusGroups,
    topRatedRaw,
    mostReviewedGames,
    mostWishlistedGames,
    genreCounts,
  ] = await Promise.all([
    prisma.$queryRaw<{ date: string; count: number }[]>`
      SELECT
        DATE("createdAt")::text as date,
        COUNT(*)::int as count
      FROM users
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC
    `,
    prisma.libraryEntry.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.rating.groupBy({
      by: ["gameId"],
      _avg: { score: true },
      _count: true,
      having: { gameId: { _count: { gte: 1 } } },
      orderBy: { _avg: { score: "desc" } },
      take: 10,
    }),
    prisma.game.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        _count: { select: { reviews: true } },
      },
      orderBy: { reviews: { _count: "desc" } },
      take: 10,
    }),
    prisma.game.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        _count: { select: { wishlists: true } },
      },
      orderBy: { wishlists: { _count: "desc" } },
      take: 10,
    }),
    prisma.genre.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        _count: { select: { games: true } },
      },
      orderBy: { games: { _count: "desc" } },
      take: 10,
    }),
  ]);

  const chartData: { date: string; signups: number }[] = [];
  const typedSignups = signupsByDay as { date: string; count: number }[];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const found = typedSignups.find((r) => r.date === dateStr);
    chartData.push({ date: dateStr, signups: found?.count ?? 0 });
  }

  const topRatedGameIds = topRatedRaw.map((r) => r.gameId);
  const topRatedGames = await prisma.game.findMany({
    where: { id: { in: topRatedGameIds } },
    select: { id: true, title: true, slug: true, coverImage: true },
  });
  const topRatedMap = new Map(topRatedGames.map((g) => [g.id, g]));
  const topRated = topRatedRaw
    .map((r) => {
      const game = topRatedMap.get(r.gameId);
      if (!game) return null;
      return {
        ...game,
        avgRating: r._avg.score ?? 0,
        ratingCount: r._count,
      };
    })
    .filter((g): g is NonNullable<typeof g> => g !== null);

  const libraryStatusDistribution = libraryStatusGroups.map(
    (g: { status: string; _count: number }) => ({ status: g.status, count: g._count })
  );

  const genrePopularity = genreCounts.map((g) => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
    color: g.color,
    count: g._count.games,
  }));

  return (
    <AdminAnalyticsClient
      signupChart={chartData}
      libraryStatusDistribution={libraryStatusDistribution}
      topRated={topRated}
      mostReviewed={mostReviewedGames}
      mostWishlisted={mostWishlistedGames}
      genrePopularity={genrePopularity}
    />
  );
}
