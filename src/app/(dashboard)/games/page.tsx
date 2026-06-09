import { prisma } from "@/lib/prisma";
import { GamesClient } from "./games-client";
import { Prisma } from "@prisma/client";

export const metadata = { title: "Games Catalog" };

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; platform?: string; sort?: string; page?: string; view?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const pageSize = 24;
  const skip = (page - 1) * pageSize;

  const where: Prisma.GameWhereInput = {
    published: true,
    ...(params.q && {
      OR: [
        { title: { contains: params.q, mode: "insensitive" } },
        { developer: { contains: params.q, mode: "insensitive" } },
        { publisher: { contains: params.q, mode: "insensitive" } },
      ],
    }),
    ...(params.genre && {
      genres: { some: { genre: { slug: params.genre } } },
    }),
    ...(params.platform && {
      platforms: { some: { platform: { slug: params.platform } } },
    }),
  };

  const orderBy: Prisma.GameOrderByWithRelationInput =
    params.sort === "oldest"
      ? { releaseDate: "asc" }
      : params.sort === "newest"
      ? { releaseDate: "desc" }
      : params.sort === "title"
      ? { title: "asc" }
      : { createdAt: "desc" };

  const [games, total, genres, platforms] = await Promise.all([
    prisma.game.findMany({
      where,
      include: {
        genres: { include: { genre: true } },
        platforms: { include: { platform: true } },
        categories: { include: { category: true } },
        _count: { select: { reviews: true, ratings: true, libraryEntries: true, wishlists: true } },
      },
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.game.count({ where }),
    prisma.genre.findMany({ orderBy: { name: "asc" } }),
    prisma.platform.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <GamesClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      games={games as any}
      total={total}
      page={page}
      pageSize={pageSize}
      genres={genres}
      platforms={platforms}
      searchParams={params}
    />
  );
}
