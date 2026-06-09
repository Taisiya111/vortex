"use client";

import React, { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PuzzlePieceIcon,
  ArrowLeftIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface Game {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  developer: string | null;
  publisher: string | null;
  published: boolean;
  featured: boolean;
  createdAt: string;
  _count: { reviews: number; libraryEntries: number; ratings: number };
}

interface GamesResponse {
  data: Game[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function AdminGamesPage() {
  const { toast } = useToast();
  const [data, setData] = useState<GamesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Game | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const pageSize = 20;

  async function fetchGames() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        admin: "true",
      });
      if (query) params.set("q", query);
      if (filter === "published") params.set("published", "true");
      if (filter === "draft") params.set("published", "false");
      if (filter === "featured") params.set("featured", "true");
      const res = await fetch(`/api/games?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch {
      toast({ title: "Error", description: "Failed to load games.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchGames();
  }, [page, filter]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchGames();
  }

  async function togglePublish(game: Game) {
    try {
      const res = await fetch(`/api/games/${game.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !game.published }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await fetchGames();
      toast({
        title: game.published ? "Game unpublished" : "Game published",
        description: `"${game.title}" is now ${game.published ? "a draft" : "live"}.`,
      });
    } catch {
      toast({ title: "Error", description: "Failed to update game.", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/games/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setDeleteTarget(null);
      await fetchGames();
      toast({ title: "Game deleted", description: `"${deleteTarget.title}" was deleted.` });
    } catch {
      toast({ title: "Error", description: "Failed to delete game.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  }

  const games = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/admin">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-black flex items-center gap-2">
            <PuzzlePieceIcon className="h-7 w-7 text-violet-400" />
            Manage Games
          </h2>
          <p className="text-muted-foreground mt-0.5">
            {total.toLocaleString()} games total
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/admin/games/new">
            <PlusIcon className="h-4 w-4" />
            Add Game
          </Link>
        </Button>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search games..."
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline" size="default">
                Search
              </Button>
            </form>
            <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Games Table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base">
            {isLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              `${total.toLocaleString()} game${total !== 1 ? "s" : ""}`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-16">
              <PuzzlePieceIcon className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground">No games found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {games.map((game, i) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors"
                >
                  {/* Cover */}
                  <div className="relative w-10 h-14 rounded overflow-hidden flex-shrink-0">
                    {game.coverImage ? (
                      <Image
                        src={game.coverImage}
                        alt={game.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-900 to-indigo-900 flex items-center justify-center">
                        <span className="text-xs font-bold text-white/30">
                          {game.title[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm line-clamp-1">{game.title}</p>
                      {game.featured && (
                        <Badge
                          variant="outline"
                          className="text-xs text-amber-400 border-amber-400/20 bg-amber-400/10"
                        >
                          Featured
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          game.published
                            ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10"
                            : "text-slate-400 border-slate-400/20 bg-slate-400/10"
                        }`}
                      >
                        {game.published ? "Live" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {game.developer}
                      {game.publisher && game.publisher !== game.developer
                        ? ` · ${game.publisher}`
                        : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {game._count.reviews} reviews · {game._count.libraryEntries} in libraries ·{" "}
                      Added {formatDate(game.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title={game.published ? "Unpublish" : "Publish"}
                      onClick={() => togglePublish(game)}
                    >
                      {game.published ? (
                        <EyeSlashIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link href={`/admin/games/${game.id}/edit`}>
                        <PencilIcon className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(game)}
                    >
                      <TrashIcon className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <TrashIcon className="h-5 w-5" />
              Delete Game
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{deleteTarget?.title}"
            </span>
            ? This action cannot be undone and will remove all associated reviews,
            library entries, and collection items.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={isDeleting}
              disabled={isDeleting}
            >
              Delete Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
