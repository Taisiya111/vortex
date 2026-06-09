import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const q = (searchParams.get("q") ?? "").trim();

    if (!q) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: session.user.id } },
          {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { username: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: { id: true, name: true, username: true, image: true },
      take: 10,
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("[GET /api/users/search]", err);
    return NextResponse.json({ error: "Failed to search users." }, { status: 500 });
  }
}
