import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const userSelect = {
  id: true,
  name: true,
  username: true,
  image: true,
} as const;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { userId: otherUserId } = await params;
    const sessionUserId = session.user.id;

    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: userSelect,
    });
    if (!otherUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") ?? "50", 10));
    const skip = (page - 1) * pageSize;

    const where = {
      OR: [
        { senderId: sessionUserId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: sessionUserId },
      ],
    };

    // Fetched newest-first for pagination, then reversed to chronological (oldest first)
    // so the client can render top-to-bottom without re-sorting.
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.message.count({ where }),
    ]);

    await prisma.message.updateMany({
      where: { senderId: otherUserId, recipientId: sessionUserId, read: false },
      data: { read: true },
    });

    return NextResponse.json({
      messages: messages.reverse(),
      user: otherUser,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("[GET /api/messages/[userId]]", err);
    return NextResponse.json({ error: "Failed to fetch conversation." }, { status: 500 });
  }
}
