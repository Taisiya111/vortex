import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CollectionsClient } from "./collections-client";

export const metadata = { title: "My Collections | Vortex" };

export default async function CollectionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/collections");

  const userId = session.user.id;

  const collections = await prisma.collection.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          game: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImage: true,
              developer: true,
            },
          },
        },
        orderBy: { order: "asc" },
        take: 4,
      },
      _count: { select: { items: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <CollectionsClient
      collections={
        collections as Parameters<typeof CollectionsClient>[0]["collections"]
      }
    />
  );
}
