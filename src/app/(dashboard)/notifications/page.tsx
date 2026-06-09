import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NotificationsClient } from "./notifications-client";

export const metadata = { title: "Notifications | Vortex" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/notifications");

  const userId = session.user.id;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  return (
    <NotificationsClient
      initialNotifications={JSON.parse(JSON.stringify(notifications))}
      initialUnreadCount={unreadCount}
    />
  );
}
