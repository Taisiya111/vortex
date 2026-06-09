import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LibraryClient } from "./library-client";

export const metadata = { title: "My Library | Vortex" };

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/library");

  const userId = session.user.id;

  const [libraryEntries, stats] = await Promise.all([
    prisma.libraryEntry.findMany({
      where: { userId },
      include: {
        game: {
          include: {
            genres: { include: { genre: { select: { id: true, name: true, slug: true } } } },
            platforms: { include: { platform: { select: { id: true, name: true, slug: true } } } },
            _count: { select: { reviews: true, ratings: true, libraryEntries: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.libraryEntry.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
      _sum: { hoursPlayed: true },
    }),
  ]);

  const statusCounts = Object.fromEntries(
    stats.map((s: { status: string; _count: number }) => [s.status, s._count])
  );
  const totalHours = stats.reduce(
    (sum: number, s: { _sum: { hoursPlayed: number | null } }) =>
      sum + (s._sum.hoursPlayed ?? 0),
    0
  );

  return (
    <LibraryClient
      entries={libraryEntries as Parameters<typeof LibraryClient>[0]["entries"]}
      statusCounts={statusCounts}
      totalHours={totalHours}
    />
  );
}
