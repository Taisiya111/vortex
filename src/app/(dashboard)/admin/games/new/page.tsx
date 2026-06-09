import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NewGameClient } from "./new-game-client";

export const metadata = { title: "Add Game | Vortex" };

export default async function NewGamePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [genres, platforms, categories] = await Promise.all([
    prisma.genre.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
    prisma.platform.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
  ]);

  return <NewGameClient genres={genres} platforms={platforms} categories={categories} />;
}
