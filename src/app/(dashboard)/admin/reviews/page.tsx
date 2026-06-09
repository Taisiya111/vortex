import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminReviewsClient } from "./admin-reviews-client";

export const metadata = { title: "Manage Reviews | Vortex" };

export default async function AdminReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [reviews, total, reportedCount, publishedCount, unpublishedCount] = await Promise.all([
    prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, username: true, image: true, email: true } },
        game: { select: { id: true, title: true, slug: true, coverImage: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: [{ reported: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.review.count(),
    prisma.review.count({ where: { reported: true } }),
    prisma.review.count({ where: { published: true } }),
    prisma.review.count({ where: { published: false } }),
  ]);

  return (
    <AdminReviewsClient
      initialReviews={JSON.parse(JSON.stringify(reviews))}
      stats={{
        total,
        reported: reportedCount,
        published: publishedCount,
        unpublished: unpublishedCount,
      }}
    />
  );
}
