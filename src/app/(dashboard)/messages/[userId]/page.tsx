import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ThreadClient } from "./thread-client";

const userSelect = {
  id: true,
  name: true,
  username: true,
  image: true,
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, username: true } });
  return { title: `${user?.name ?? user?.username ?? "Conversation"} | Messages | Vortex` };
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/messages");

  const { userId: otherUserId } = await params;
  const sessionUserId = session.user.id;

  if (otherUserId === sessionUserId) redirect("/messages");

  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: userSelect,
  });
  if (!otherUser) redirect("/messages");

  const where = {
    OR: [
      { senderId: sessionUserId, recipientId: otherUserId },
      { senderId: otherUserId, recipientId: sessionUserId },
    ],
  };

  const [recentMessages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.message.count({ where }),
  ]);

  await prisma.message.updateMany({
    where: { senderId: otherUserId, recipientId: sessionUserId, read: false },
    data: { read: true },
  });

  return (
    <ThreadClient
      currentUserId={sessionUserId}
      otherUser={otherUser}
      initialMessages={recentMessages.reverse()}
      initialTotal={total}
    />
  );
}
