import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export const CLOUDINARY_FOLDERS = {
  avatars: "vortex/avatars",
  banners: "vortex/banners",
  gameCovers: "vortex/games/covers",
  gameBanners: "vortex/games/banners",
  screenshots: "vortex/screenshots",
  collections: "vortex/collections",
} as const;

export async function uploadImage(
  file: Buffer | string,
  folder: string,
  options?: { width?: number; height?: number; quality?: number }
) {
  const result = await cloudinary.uploader.upload(
    typeof file === "string" ? file : `data:image/webp;base64,${file.toString("base64")}`,
    {
      folder,
      resource_type: "image",
      transformation: [
        { quality: options?.quality ?? "auto:good" },
        { fetch_format: "auto" },
        ...(options?.width || options?.height
          ? [{ width: options.width, height: options.height, crop: "fill", gravity: "auto" }]
          : []),
      ],
    }
  );
  return { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height };
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}
