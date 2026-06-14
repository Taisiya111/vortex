"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { PhotoIcon, ArrowUpTrayIcon, XMarkIcon, LinkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  uploadType: "cover" | "banner" | "avatar" | "screenshot" | "collection";
  aspectRatio?: "portrait" | "landscape" | "square";
  error?: string;
}

export function ImageUpload({
  label,
  value,
  onChange,
  uploadType,
  aspectRatio = "portrait",
  error,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const aspectClass = {
    portrait: "aspect-[3/4]",
    landscape: "aspect-[16/6]",
    square: "aspect-square",
  }[aspectRatio];

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", uploadType);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed. Try again.");
        return;
      }

      onChange(data.url);
    } catch {
      setUploadError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <button
          type="button"
          onClick={() => setUrlMode((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LinkIcon className="h-3 w-3" />
          {urlMode ? "Upload file" : "Paste URL"}
        </button>
      </div>

      {urlMode ? (
        <div className="space-y-2">
          <Input
            placeholder="https://..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            error={error}
          />
          {value && (
            <div className={cn("relative w-full overflow-hidden rounded-lg bg-secondary", aspectClass)}>
              <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
            </div>
          )}
        </div>
      ) : (
        <>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={cn(
              "relative w-full overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer group",
              aspectClass,
              uploading
                ? "border-primary/50 bg-primary/5 cursor-wait"
                : value
                ? "border-transparent"
                : "border-border hover:border-primary/50 hover:bg-secondary/50"
            )}
          >
            {value && !uploading ? (
              <>
                <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-2">
                    <ArrowUpTrayIcon className="h-8 w-8 text-white" />
                    <span className="text-sm text-white font-medium">Change image</span>
                  </div>
                </div>
              </>
            ) : uploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Uploading to Cloudinary…</span>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <PhotoIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Drop image here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-0.5">JPEG, PNG, WebP · max 10 MB</p>
                </div>
                <Button type="button" variant="outline" size="sm" tabIndex={-1}>
                  <ArrowUpTrayIcon className="h-3.5 w-3.5" />
                  Choose file
                </Button>
              </div>
            )}
          </div>

          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
              Remove image
            </button>
          )}

          {uploadError && (
            <p className="text-xs text-destructive">{uploadError}</p>
          )}
          {error && !uploadError && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
