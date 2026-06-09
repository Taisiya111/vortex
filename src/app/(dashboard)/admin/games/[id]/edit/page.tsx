import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { EditGameClient } from "./edit-game-client";

export const metadata = { title: "Edit Game | Vortex" };

export default async function EditGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;

  const [game, genres, platforms, categories] = await Promise.all([
    prisma.game.findUnique({
      where: { id },
      include: {
        genres: { include: { genre: { select: { id: true, name: true, slug: true } } } },
        platforms: { include: { platform: { select: { id: true, name: true, slug: true } } } },
        categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
      },
    }),
    prisma.genre.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
    prisma.platform.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
  ]);

  if (!game) notFound();

  return (
    <EditGameClient
      game={JSON.parse(JSON.stringify(game))}
      genres={genres}
      platforms={platforms}
      categories={categories}
    />
  );
}
