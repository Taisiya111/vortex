import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const [
    libraryStats,
    recentLibrary,
    recentReviews,
    wishlistCount,
    collectionsCount,
    recentActivities,
  ] = await Promise.all([
    prisma.libraryEntry.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
    prisma.libraryEntry.findMany({
      where: { userId },
      include: {
        game: {
          include: {
            genres: { include: { genre: true } },
            platforms: { include: { platform: true } },
            _count: { select: { reviews: true, ratings: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.review.findMany({
      where: { userId },
      include: {
        game: { select: { id: true, title: true, slug: true, coverImage: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.wishlist.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { id: true, name: true, image: true } } },
    }),
  ]);

  const statusMap = Object.fromEntries(libraryStats.map((s) => [s.status, s._count as number]));
  const totalGames = Object.values(statusMap).reduce((sum: number, n: number) => sum + n, 0);
  const hoursResult = await prisma.libraryEntry.aggregate({
    where: { userId },
    _sum: { hoursPlayed: true },
  });

  const stats = {
    totalGames,
    playing: statusMap["PLAYING"] ?? 0,
    completed: statusMap["COMPLETED"] ?? 0,
    dropped: statusMap["DROPPED"] ?? 0,
    planToPlay: statusMap["PLAN_TO_PLAY"] ?? 0,
    totalHours: hoursResult._sum.hoursPlayed ?? 0,
    reviews: recentReviews.length,
    wishlistCount,
    collectionsCount,
  };

  return (
    <DashboardClient
      user={session.user}
      stats={stats}
      recentLibrary={recentLibrary as Parameters<typeof DashboardClient>[0]["recentLibrary"]}
      recentReviews={recentReviews as Parameters<typeof DashboardClient>[0]["recentReviews"]}
      recentActivities={recentActivities as Parameters<typeof DashboardClient>[0]["recentActivities"]}
    />
  );
}
