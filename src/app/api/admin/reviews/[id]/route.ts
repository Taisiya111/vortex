import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  published: z.boolean().optional(),
  reported: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(review);
  } catch (err) {
    console.error("[PATCH /api/admin/reviews/[id]]", err);
    return NextResponse.json({ error: "Failed to update review." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { id } = await params;

    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ message: "Review deleted." });
  } catch (err) {
    console.error("[DELETE /api/admin/reviews/[id]]", err);
    return NextResponse.json({ error: "Failed to delete review." }, { status: 500 });
  }
}
