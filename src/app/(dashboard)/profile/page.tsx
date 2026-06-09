import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";

export const metadata = { title: "My Profile | Vortex" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/profile");

  const userId = session.user.id;

  const [user, libraryEntries, reviews, collections, followStats] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          image: true,
          banner: true,
          bio: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.libraryEntry.findMany({
        where: { userId },
        include: {
          game: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImage: true,
              developer: true,
              releaseDate: true,
              genres: { include: { genre: { select: { id: true, name: true } } } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 12,
      }),
      prisma.review.findMany({
        where: { userId, published: true },
        include: {
          game: {
            select: { id: true, title: true, slug: true, coverImage: true },
          },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.collection.findMany({
        where: { userId },
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
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      prisma.$transaction([
        prisma.follow.count({ where: { followingId: userId } }),
        prisma.follow.count({ where: { followerId: userId } }),
      ]),
    ]);

  if (!user) redirect("/login");

  const [followerCount, followingCount] = followStats;

  const libraryStats = await prisma.libraryEntry.groupBy({
    by: ["status"],
    where: { userId },
    _count: true,
  });

  const statusMap = Object.fromEntries(
    libraryStats.map((s: { status: string; _count: number }) => [s.status, s._count])
  );

  const totalHoursResult = await prisma.libraryEntry.aggregate({
    where: { userId },
    _sum: { hoursPlayed: true },
  });

  const achievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: {
      achievement: true,
    },
    orderBy: { unlockedAt: "desc" },
    take: 12,
  });

  const stats = {
    totalGames: Object.values(statusMap).reduce((sum, n) => sum + n, 0),
    playing: statusMap["PLAYING"] ?? 0,
    completed: statusMap["COMPLETED"] ?? 0,
    dropped: statusMap["DROPPED"] ?? 0,
    paused: statusMap["PAUSED"] ?? 0,
    planToPlay: statusMap["PLAN_TO_PLAY"] ?? 0,
    totalHours: totalHoursResult._sum.hoursPlayed ?? 0,
    reviews: reviews.length,
    collections: collections.length,
    followerCount,
    followingCount,
  };

  return (
    <ProfileClient
      user={user}
      stats={stats}
      libraryEntries={
        libraryEntries as Parameters<typeof ProfileClient>[0]["libraryEntries"]
      }
      reviews={reviews as Parameters<typeof ProfileClient>[0]["reviews"]}
      collections={
        collections as Parameters<typeof ProfileClient>[0]["collections"]
      }
      achievements={achievements}
    />
  );
}
