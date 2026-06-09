import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const AVATAR_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const BANNER_MAX_SIZE = 8 * 1024 * 1024; // 8MB

type UploadType = "avatar" | "banner" | "screenshot" | "cover" | "collection";

const UPLOAD_CONFIG: Record<UploadType, { folder: string; maxSize: number; transformation: Record<string, unknown>[] }> = {
  avatar: {
    folder: "vortex/avatars",
    maxSize: AVATAR_MAX_SIZE,
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
  },
  banner: {
    folder: "vortex/banners",
    maxSize: BANNER_MAX_SIZE,
    transformation: [
      { width: 1200, height: 400, crop: "fill" },
      { quality: "auto", fetch_format: "auto" },
    ],
  },
  screenshot: {
    folder: "vortex/screenshots",
    maxSize: MAX_SIZE,
    transformation: [
      { width: 1920, height: 1080, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
  },
  cover: {
    folder: "vortex/covers",
    maxSize: MAX_SIZE,
    transformation: [
      { width: 600, height: 800, crop: "fill" },
      { quality: "auto", fetch_format: "auto" },
    ],
  },
  collection: {
    folder: "vortex/collections",
    maxSize: MAX_SIZE,
    transformation: [
      { width: 800, height: 400, crop: "fill" },
      { quality: "auto", fetch_format: "auto" },
    ],
  },
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as UploadType) ?? "screenshot";

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
        { status: 400 }
      );
    }

    const config = UPLOAD_CONFIG[type] ?? UPLOAD_CONFIG.screenshot;

    if (file.size > config.maxSize) {
      const maxMB = config.maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxMB}MB.` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<{ secure_url: string; public_id: string; width: number; height: number }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: config.folder,
            transformation: config.transformation,
            resource_type: "image",
            overwrite: true,
            public_id: type === "avatar" ? `user_${session.user!.id}` : undefined,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as { secure_url: string; public_id: string; width: number; height: number });
          }
        );
        uploadStream.end(buffer);
      }
    );

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
