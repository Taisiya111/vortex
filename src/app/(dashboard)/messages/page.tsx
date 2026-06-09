import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MessagesClient } from "./messages-client";

export const metadata = { title: "Messages | Vortex" };

const userSelect = {
  id: true,
  name: true,
  username: true,
  image: true,
} as const;

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/messages");

  const userId = session.user.id;

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { recipientId: userId }] },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: userSelect },
      recipient: { select: userSelect },
    },
  });

  type ConversationEntry = {
    user: { id: string; name: string | null; username: string | null; image: string | null };
    lastMessage: { id: string; content: string; createdAt: Date; senderId: string; read: boolean };
    unreadCount: number;
  };

  const conversations = new Map<string, ConversationEntry>();

  for (const message of messages) {
    const isSender = message.senderId === userId;
    const otherUser = isSender ? message.recipient : message.sender;

    let entry = conversations.get(otherUser.id);
    if (!entry) {
      entry = {
        user: otherUser,
        lastMessage: {
          id: message.id,
          content: message.content,
          createdAt: message.createdAt,
          senderId: message.senderId,
          read: message.read,
        },
        unreadCount: 0,
      };
      conversations.set(otherUser.id, entry);
    }

    if (!isSender && !message.read) {
      entry.unreadCount += 1;
    }
  }

  const initialConversations = Array.from(conversations.values()).sort(
    (a, b) =>
      new Date(b.lastMessage.createdAt).getTime() -
      new Date(a.lastMessage.createdAt).getTime()
  );

  return <MessagesClient initialConversations={initialConversations} />;
}
