import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  public: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const userId = session.user.id;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(50, parseInt(searchParams.get("pageSize") ?? "20", 10));
    const skip = (page - 1) * pageSize;

    const [collections, total] = await Promise.all([
      prisma.collection.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              game: { select: { id: true, title: true, slug: true, coverImage: true } },
            },
            orderBy: { order: "asc" },
            take: 4,
          },
          _count: { select: { items: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.collection.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      data: collections,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("[GET /api/collections]", err);
    return NextResponse.json({ error: "Failed to fetch collections." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const { name, description, coverImage } = parsed.data;
    const isPublic = parsed.data.public;

    // Generate unique slug for this user
    let slug = slugify(name);
    const existing = await prisma.collection.findUnique({
      where: { userId_slug: { userId, slug } },
    });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const collection = await prisma.collection.create({
      data: {
        userId,
        name,
        description: description ?? null,
        coverImage: coverImage ?? null,
        public: isPublic,
        slug,
      },
      include: {
        items: {
          include: {
            game: { select: { id: true, title: true, slug: true, coverImage: true } },
          },
          take: 4,
        },
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (err) {
    console.error("[POST /api/collections]", err);
    return NextResponse.json({ error: "Failed to create collection." }, { status: 500 });
  }
}
