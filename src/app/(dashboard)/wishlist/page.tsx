import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { WishlistClient } from "./wishlist-client";

export const metadata = { title: "Wishlist | Vortex" };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/wishlist");

  const userId = session.user.id;

  const items = await prisma.wishlist.findMany({
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
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return (
    <WishlistClient items={items as Parameters<typeof WishlistClient>[0]["items"]} />
  );
}
