import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const count = await prisma.message.count({
      where: { recipientId: session.user.id, read: false },
    });

    return NextResponse.json({ count });
  } catch (err) {
    console.error("[GET /api/messages/unread-count]", err);
    return NextResponse.json({ error: "Failed to fetch unread count." }, { status: 500 });
  }
}
