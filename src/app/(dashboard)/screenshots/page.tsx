import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ScreenshotsClient } from "./screenshots-client";

export const metadata = { title: "My Screenshots | Vortex" };

export default async function ScreenshotsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/screenshots");

  const userId = session.user.id;

  const screenshots = await prisma.screenshot.findMany({
    where: { userId },
    include: {
      game: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <ScreenshotsClient screenshots={screenshots} />;
}
