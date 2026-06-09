import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "./admin-client";

export const metadata = { title: "Admin Dashboard | Vortex" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [
    totalUsers,
    totalGames,
    totalReviews,
    totalLibraryEntries,
    recentUsers,
    recentGames,
    recentReviews,
    signupsByDay,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.game.count(),
    prisma.review.count(),
    prisma.libraryEntry.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        _count: { select: { library: true, reviews: true } },
      },
    }),
    prisma.game.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        published: true,
        createdAt: true,
        _count: { select: { reviews: true, libraryEntries: true } },
      },
    }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { id: true, name: true, image: true } },
        game: { select: { id: true, title: true, slug: true } },
      },
    }),
    prisma.$queryRaw<{ date: string; count: number }[]>`
      SELECT
        DATE("createdAt")::text as date,
        COUNT(*)::int as count
      FROM users
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC
    `,
  ]);

  const stats = {
    totalUsers,
    totalGames,
    totalReviews,
    totalLibraryEntries,
  };

  // Fill in missing days for chart
  const chartData: { date: string; signups: number }[] = [];
  const typedSignups = signupsByDay as { date: string; count: number }[];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const found = typedSignups.find((r) => r.date === dateStr);
    chartData.push({ date: dateStr, signups: found?.count ?? 0 });
  }

  return (
    <AdminDashboardClient
      stats={stats}
      recentUsers={recentUsers as Parameters<typeof AdminDashboardClient>[0]["recentUsers"]}
      recentGames={recentGames as Parameters<typeof AdminDashboardClient>[0]["recentGames"]}
      recentReviews={recentReviews as Parameters<typeof AdminDashboardClient>[0]["recentReviews"]}
      signupChart={chartData}
    />
  );
}
