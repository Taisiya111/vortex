import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const patchSchema = z.object({
  ids: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(50, parseInt(searchParams.get("pageSize") ?? "20", 10));
    const skip = (page - 1) * pageSize;

    const [data, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      unreadCount,
    });
  } catch (err) {
    console.error("[GET /api/notifications]", err);
    return NextResponse.json({ error: "Failed to fetch notifications." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { ids, all } = parsed.data;

    if (!all && (!ids || ids.length === 0)) {
      return NextResponse.json({ error: "No notifications specified." }, { status: 400 });
    }

    const where: Record<string, unknown> = { userId };
    if (!all && ids) {
      where.id = { in: ids };
    }

    const result = await prisma.notification.updateMany({
      where,
      data: { read: true },
    });

    return NextResponse.json({ message: "Notifications marked as read.", count: result.count });
  } catch (err) {
    console.error("[PATCH /api/notifications]", err);
    return NextResponse.json({ error: "Failed to update notifications." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing notification id." }, { status: 400 });
    }

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Notification not found." }, { status: 404 });
    }

    await prisma.notification.delete({ where: { id } });

    return NextResponse.json({ message: "Notification deleted." });
  } catch (err) {
    console.error("[DELETE /api/notifications]", err);
    return NextResponse.json({ error: "Failed to delete notification." }, { status: 500 });
  }
}
