import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ReviewsClient } from "./reviews-client";

export const metadata = { title: "My Reviews | Vortex" };

export default async function ReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/reviews");

  const userId = session.user.id;

  const [reviews, aggregate, likesAggregate] = await Promise.all([
    prisma.review.findMany({
      where: { userId },
      include: {
        game: { select: { id: true, title: true, slug: true, coverImage: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.aggregate({
      where: { userId },
      _avg: { rating: true },
      _count: true,
    }),
    prisma.reviewLike.count({ where: { review: { userId } } }),
  ]);

  return (
    <ReviewsClient
      reviews={reviews}
      totalReviews={aggregate._count}
      avgRating={aggregate._avg.rating ?? 0}
      totalLikes={likesAggregate}
    />
  );
}
