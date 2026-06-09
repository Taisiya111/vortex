"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronUpDownIcon,
  HeartIcon,
  BookOpenIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { Card, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";

interface WishlistGame {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  developer: string | null;
  releaseDate: Date | null;
  genres: { genre: { id: string; name: string; slug: string } }[];
  platforms: { platform: { id: string; name: string; slug: string } }[];
  _count?: { reviews: number; ratings: number; libraryEntries: number };
}

interface WishlistItem {
  id: string;
  priority: number;
  notes: string | null;
  createdAt: Date;
  game: WishlistGame;
}

interface WishlistClientProps {
  items: WishlistItem[];
}

const SORT_OPTIONS = [
  { value: "priority", label: "Priority" },
  { value: "added", label: "Date Added" },
  { value: "title", label: "Title A–Z" },
  { value: "release", label: "Release Date" },
];

export function WishlistClient({ items }: WishlistClientProps) {
  const { toast } = useToast();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("priority");
  const [list, setList] = useState(items);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = list;

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.game.title.toLowerCase().includes(q) ||
          item.game.developer?.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "added":
        result = [...result].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "title":
        result = [...result].sort((a, b) => a.game.title.localeCompare(b.game.title));
        break;
      case "release":
        result = [...result].sort((a, b) => {
          const aTime = a.game.releaseDate ? new Date(a.game.releaseDate).getTime() : 0;
          const bTime = b.game.releaseDate ? new Date(b.game.releaseDate).getTime() : 0;
          return bTime - aTime;
        });
        break;
      case "priority":
      default:
        result = [...result].sort((a, b) => {
          if (b.priority !== a.priority) return b.priority - a.priority;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
    }

    return result;
  }, [list, query, sort]);

  async function handleRemove(item: WishlistItem) {
    setRemovingId(item.id);
    const previous = list;
    setList((prev) => prev.filter((i) => i.id !== item.id));
    try {
      const res = await fetch(`/api/wishlist?gameId=${item.game.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");
      toast({ title: "Removed from wishlist", description: `"${item.game.title}" was removed.` });
    } catch {
      setList(previous);
      toast({ title: "Error", description: "Failed to remove from wishlist.", variant: "destructive" });
    } finally {
      setRemovingId(null);
    }
  }

  const totalCount = list.length;
  const highPriorityCount = list.filter((i) => i.priority >= 7).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-black">Wishlist</h2>
          <p className="text-muted-foreground mt-1">
            {totalCount} game{totalCount !== 1 ? "s" : ""}
            {highPriorityCount > 0 && (
              <> · {highPriorityCount} high priority</>
            )}
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/games">
            <BookOpenIcon className="h-4 w-4" />
            Browse Games
          </Link>
        </Button>
      </motion.div>

      {/* Search, Sort, View */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your wishlist..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44">
              <ChevronUpDownIcon className="h-4 w-4 mr-1 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`p-2.5 transition-colors ${
                view === "grid"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2.5 transition-colors ${
                view === "list"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <HeartIcon className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">
              {query ? "No games found" : "Your wishlist is empty"}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {query
                ? "Try a different search term"
                : "Save games you're excited about to find them here later"}
            </p>
            {!query && (
              <Button variant="gradient" asChild>
                <Link href="/games">
                  <BookOpenIcon className="h-4 w-4" />
                  Browse Games
                </Link>
              </Button>
            )}
          </motion.div>
        ) : view === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: Math.min(i * 0.04, 0.5) }}
              >
                <Card className="overflow-hidden h-full flex flex-col">
                  <Link href={`/games/${item.game.slug}`}>
                    <div className="group relative aspect-[3/4] bg-secondary">
                      {item.game.coverImage ? (
                        <Image
                          src={item.game.coverImage}
                          alt={item.game.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-900 flex items-center justify-center">
                          <span className="text-3xl font-black text-white/20">
                            {item.game.title[0]}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      {item.priority >= 7 && (
                        <Badge
                          variant="warning"
                          className="absolute top-2 left-2 gap-1 glass"
                        >
                          <StarIcon className="h-3 w-3" />
                          High priority
                        </Badge>
                      )}
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-sm font-semibold line-clamp-1">
                          {item.game.title}
                        </p>
                        <p className="text-white/60 text-xs mt-0.5 line-clamp-1">
                          {item.game.developer}
                          {item.game.releaseDate && (
                            <> · {new Date(item.game.releaseDate).getFullYear()}</>
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <CardContent className="p-3 flex-1 flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1">
                      {item.game.genres.slice(0, 2).map(({ genre }) => (
                        <Badge key={genre.id} variant="secondary" className="text-xs">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground italic line-clamp-2">
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}
                    <div className="mt-auto pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                        onClick={() => handleRemove(item)}
                        disabled={removingId === item.id}
                        loading={removingId === item.id}
                      >
                        <XMarkIcon className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
              >
                <Card hover className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-4">
                      <Link href={`/games/${item.game.slug}`} className="flex-shrink-0">
                        <div className="relative w-14 h-20 rounded-lg overflow-hidden">
                          {item.game.coverImage ? (
                            <Image
                              src={item.game.coverImage}
                              alt={item.game.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-violet-900 to-indigo-900 flex items-center justify-center">
                              <span className="text-lg font-bold text-white/30">
                                {item.game.title[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 justify-between">
                          <div>
                            <Link
                              href={`/games/${item.game.slug}`}
                              className="font-semibold line-clamp-1 hover:text-primary transition-colors"
                            >
                              {item.game.title}
                            </Link>
                            {item.game.developer && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.game.developer}
                                {item.game.releaseDate && (
                                  <> · {new Date(item.game.releaseDate).getFullYear()}</>
                                )}
                              </p>
                            )}
                          </div>
                          {item.priority >= 7 && (
                            <Badge variant="warning" className="gap-1 flex-shrink-0">
                              <StarIcon className="h-3 w-3" />
                              High priority
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {item.game.genres.slice(0, 2).map(({ genre }) => (
                            <Badge key={genre.id} variant="secondary" className="text-xs">
                              {genre.name}
                            </Badge>
                          ))}
                          {item.notes && (
                            <span className="text-xs text-muted-foreground italic line-clamp-1">
                              &ldquo;{item.notes}&rdquo;
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="flex-shrink-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemove(item)}
                        disabled={removingId === item.id}
                        title="Remove from wishlist"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
