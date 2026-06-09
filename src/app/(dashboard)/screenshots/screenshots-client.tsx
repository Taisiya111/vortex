"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface ScreenshotItem {
  id: string;
  url: string;
  publicId: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  createdAt: Date;
  game: { id: string; title: string; slug: string };
}

interface GameOption {
  id: string;
  title: string;
  slug: string;
}

interface ScreenshotsClientProps {
  screenshots: ScreenshotItem[];
}

export function ScreenshotsClient({ screenshots }: ScreenshotsClientProps) {
  const { toast } = useToast();
  const [list, setList] = useState(screenshots);
  const [lightbox, setLightbox] = useState<ScreenshotItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScreenshotItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [games, setGames] = useState<GameOption[]>([]);
  const [gameQuery, setGameQuery] = useState("");
  const [selectedGameId, setSelectedGameId] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!uploadOpen) return;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ pageSize: "30" });
        if (gameQuery.trim()) params.set("q", gameQuery.trim());
        const res = await fetch(`/api/games?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) return;
        const json = await res.json();
        setGames(
          (json.data ?? []).map((g: { id: string; title: string; slug: string }) => ({
            id: g.id,
            title: g.title,
            slug: g.slug,
          }))
        );
      } catch {
        // ignore aborted/failed search
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [uploadOpen, gameQuery]);

  const selectedGame = useMemo(
    () => games.find((g) => g.id === selectedGameId) ?? null,
    [games, selectedGameId]
  );

  function resetUploadForm() {
    setSelectedGameId("");
    setGameQuery("");
    setCaption("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleUpload() {
    if (!file || !selectedGameId) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "screenshot");

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => null);
        throw new Error(err?.error ?? "Upload failed");
      }
      const uploaded = await uploadRes.json();

      const createRes = await fetch("/api/screenshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: selectedGameId,
          url: uploaded.url,
          publicId: uploaded.publicId,
          width: uploaded.width,
          height: uploaded.height,
          caption: caption.trim() || null,
        }),
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => null);
        throw new Error(err?.error ?? "Failed to save screenshot");
      }
      const created = await createRes.json();
      setList((prev) => [created, ...prev]);
      setUploadOpen(false);
      resetUploadForm();
      toast({ title: "Screenshot uploaded", description: "Your screenshot was added to your gallery." });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to upload screenshot.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/screenshots?id=${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setList((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      if (lightbox?.id === deleteTarget.id) setLightbox(null);
      setDeleteTarget(null);
      toast({ title: "Screenshot deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete screenshot.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  }

  const totalCount = list.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-black">My Screenshots</h2>
          <p className="text-muted-foreground mt-1">
            {totalCount} screenshot{totalCount !== 1 ? "s" : ""} captured
          </p>
        </div>
        <Button variant="gradient" onClick={() => setUploadOpen(true)}>
          <ArrowUpTrayIcon className="h-4 w-4" />
          Upload Screenshot
        </Button>
      </motion.div>

      {/* Gallery */}
      <AnimatePresence mode="wait">
        {totalCount === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <PhotoIcon className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No screenshots yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Capture and share your favorite gaming moments
            </p>
            <Button variant="gradient" onClick={() => setUploadOpen(true)}>
              <ArrowUpTrayIcon className="h-4 w-4" />
              Upload Your First Screenshot
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="columns-2 sm:columns-3 lg:columns-4 gap-4 [&>*]:mb-4"
          >
            {list.map((shot, i) => (
              <motion.div
                key={shot.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: Math.min(i * 0.04, 0.5) }}
                className="break-inside-avoid"
              >
                <Card className="overflow-hidden group relative">
                  <button onClick={() => setLightbox(shot)} className="block w-full text-left cursor-pointer">
                    <div
                      className="relative w-full bg-secondary"
                      style={{
                        aspectRatio:
                          shot.width && shot.height ? `${shot.width} / ${shot.height}` : "16 / 9",
                      }}
                    >
                      <Image
                        src={shot.url}
                        alt={shot.caption ?? shot.game.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-xs font-semibold line-clamp-1">{shot.game.title}</p>
                        {shot.caption && (
                          <p className="text-white/70 text-xs line-clamp-1">{shot.caption}</p>
                        )}
                      </div>
                    </div>
                  </button>
                  <Button
                    variant="glass"
                    size="icon-sm"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(shot);
                    }}
                    title="Delete screenshot"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <Dialog open={lightbox !== null} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent className="max-w-3xl">
          {lightbox && (
            <div className="space-y-4">
              <div
                className="relative w-full max-h-[60vh] rounded-lg overflow-hidden bg-secondary"
                style={{
                  aspectRatio:
                    lightbox.width && lightbox.height ? `${lightbox.width} / ${lightbox.height}` : "16 / 9",
                }}
              >
                <Image
                  src={lightbox.url}
                  alt={lightbox.caption ?? lightbox.game.title}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/games/${lightbox.game.slug}`}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    {lightbox.game.title}
                  </Link>
                  {lightbox.caption && (
                    <p className="text-sm text-muted-foreground mt-1">{lightbox.caption}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    Uploaded {formatDate(lightbox.createdAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                  onClick={() => setDeleteTarget(lightbox)}
                  title="Delete screenshot"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog
        open={uploadOpen}
        onOpenChange={(open) => {
          setUploadOpen(open);
          if (!open) resetUploadForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpTrayIcon className="h-5 w-5" />
              Upload Screenshot
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="screenshot-game">Game</Label>
              <Select value={selectedGameId} onValueChange={setSelectedGameId}>
                <SelectTrigger id="screenshot-game">
                  <SelectValue placeholder="Select a game" />
                </SelectTrigger>
                <SelectContent>
                  <div className="flex items-center px-2 pb-1.5 sticky top-0 bg-popover">
                    <MagnifyingGlassIcon className="absolute left-4 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={gameQuery}
                      onChange={(e) => setGameQuery(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="Search games..."
                      className="pl-7 h-8 text-xs"
                    />
                  </div>
                  {games.length === 0 ? (
                    <div className="px-2 py-3 text-xs text-muted-foreground text-center">No games found</div>
                  ) : (
                    games.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedGame && (
                <p className="text-xs text-muted-foreground">Selected: {selectedGame.title}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="screenshot-file">Image</Label>
              <input
                ref={fileInputRef}
                id="screenshot-file"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="flex w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="screenshot-caption">Caption</Label>
              <Textarea
                id="screenshot-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption (optional)"
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUploadOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleUpload}
              loading={isUploading}
              disabled={isUploading || !file || !selectedGameId}
            >
              <PlusIcon className="h-4 w-4" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <TrashIcon className="h-5 w-5" />
              Delete Screenshot
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this screenshot of{" "}
            <span className="font-semibold text-foreground">&ldquo;{deleteTarget?.game.title}&rdquo;</span>?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={isDeleting} disabled={isDeleting}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
