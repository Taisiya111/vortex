import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const sendSchema = z.object({
  recipientId: z.string().min(1),
  content: z.string().min(1).max(5000),
});

const userSelect = {
  id: true,
  name: true,
  username: true,
  image: true,
} as const;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

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

    const sorted = Array.from(conversations.values()).sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
    );

    return NextResponse.json({ conversations: sorted });
  } catch (err) {
    console.error("[GET /api/messages]", err);
    return NextResponse.json({ error: "Failed to fetch conversations." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = sendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { recipientId, content } = parsed.data;
    const senderId = session.user.id;

    if (recipientId === senderId) {
      return NextResponse.json(
        { error: "You cannot send a message to yourself." },
        { status: 400 }
      );
    }

    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true },
    });
    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found." }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: { senderId, recipientId, content },
      include: {
        sender: { select: userSelect },
        recipient: { select: userSelect },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error("[POST /api/messages]", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
