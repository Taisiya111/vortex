import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const range = searchParams.get("range") ?? "30d";

    let daysAgo = 30;
    if (range === "7d") daysAgo = 7;
    if (range === "90d") daysAgo = 90;
    if (range === "1y") daysAgo = 365;

    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalGames,
      totalReviews,
      totalLibraryEntries,
      totalCollections,
      totalRatings,
      publishedGames,
      activeUsers,
      newUsers,
      newGames,
      newReviews,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.game.count(),
      prisma.review.count({ where: { published: true } }),
      prisma.libraryEntry.count(),
      prisma.collection.count(),
      prisma.rating.count(),
      prisma.game.count({ where: { published: true } }),
      // Users who were active in the range period
      prisma.user.count({
        where: { updatedAt: { gte: startDate } },
      }),
      prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      prisma.game.count({ where: { createdAt: { gte: startDate } } }),
      prisma.review.count({ where: { createdAt: { gte: startDate }, published: true } }),
    ]);

    // Signups by day for the range
    const signupsByDay = await prisma.$queryRaw<
      { date: string; count: number }[]
    >`
      SELECT
        DATE(created_at)::text as date,
        COUNT(*)::int as count
      FROM users
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    // Library entries by status
    const libraryByStatus = await prisma.libraryEntry.groupBy({
      by: ["status"],
      _count: true,
    });

    // Top games by library entries
    const topGamesByLibrary = await prisma.game.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        _count: { select: { libraryEntries: true, reviews: true } },
      },
      orderBy: { libraryEntries: { _count: "desc" } },
      take: 10,
    });

    // Reviews by rating distribution
    const reviewsByRating = await prisma.review.groupBy({
      by: ["rating"],
      _count: true,
      where: { published: true },
      orderBy: { rating: "asc" },
    });

    // Role distribution
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: true,
    });

    // Fill chart data
    const signupChart: { date: string; signups: number }[] = [];
    for (let i = daysAgo - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const found = (signupsByDay as { date: string; count: number }[]).find((r) => r.date === dateStr);
      signupChart.push({ date: dateStr, signups: found?.count ?? 0 });
    }

    return NextResponse.json({
      overview: {
        totalUsers,
        totalGames,
        totalReviews,
        totalLibraryEntries,
        totalCollections,
        totalRatings,
        publishedGames,
        activeUsers,
        newUsers,
        newGames,
        newReviews,
      },
      charts: {
        signupChart,
      },
      breakdowns: {
        libraryByStatus: Object.fromEntries(
          libraryByStatus.map((s: { status: string; _count: number }) => [s.status, s._count])
        ),
        reviewsByRating: reviewsByRating.map((r: { rating: number; _count: number }) => ({
          rating: r.rating,
          count: r._count,
        })),
        usersByRole: Object.fromEntries(
          usersByRole.map((r: { role: string; _count: number }) => [r.role, r._count])
        ),
      },
      topGamesByLibrary,
    });
  } catch (err) {
    console.error("[GET /api/admin/stats]", err);
    return NextResponse.json({ error: "Failed to fetch admin stats." }, { status: 500 });
  }
}
