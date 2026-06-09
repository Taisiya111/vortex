"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { GameCard } from "@/components/shared/game-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { GameWithRelations } from "@/types";

interface GamesClientProps {
  games: GameWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  genres: { id: string; name: string; slug: string }[];
  platforms: { id: string; name: string; slug: string }[];
  searchParams: { q?: string; genre?: string; platform?: string; sort?: string; page?: string; view?: string };
}

export function GamesClient({ games, total, page, pageSize, genres, platforms, searchParams }: GamesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<"grid" | "list">(searchParams.view as "grid" | "list" ?? "grid");
  const [query, setQuery] = useState(searchParams.q ?? "");
  const totalPages = Math.ceil(total / pageSize);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(Object.entries(searchParams).filter(([, v]) => v != null) as [string, string][]);
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", query);
  }

  const activeFilters = [
    searchParams.q && { key: "q", label: `"${searchParams.q}"` },
    searchParams.genre && { key: "genre", label: genres.find((g) => g.slug === searchParams.genre)?.name ?? searchParams.genre },
    searchParams.platform && { key: "platform", label: platforms.find((p) => p.slug === searchParams.platform)?.name ?? searchParams.platform },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Games Catalog</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {total.toLocaleString()} games available
          </p>
        </div>
      </div>

      {/* Search & Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games, developers..."
            leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
            className="w-full"
          />
        </form>

        <div className="flex gap-2">
          <Select
            value={searchParams.genre ?? "all"}
            onValueChange={(v) => updateParam("genre", v === "all" ? null : v)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((g) => (
                <SelectItem key={g.id} value={g.slug}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.sort ?? "latest"}
            onValueChange={(v) => updateParam("sort", v)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="newest">Newest Release</SelectItem>
              <SelectItem value="oldest">Oldest Release</SelectItem>
              <SelectItem value="title">A–Z</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`p-2.5 transition-colors ${view === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2.5 transition-colors ${view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Filters:</span>
          {activeFilters.map((f) => (
            <Badge
              key={f.key}
              variant="secondary"
              className="gap-1.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
              onClick={() => updateParam(f.key, null)}
            >
              {f.label}
              <XMarkIcon className="h-3 w-3" />
            </Badge>
          ))}
          <button
            onClick={() => { setQuery(""); startTransition(() => router.push(pathname)); }}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Games grid/list */}
      {isPending ? (
        <div className={view === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" : "space-y-3"}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className={view === "grid" ? "aspect-[3/4] rounded-xl" : "h-24 rounded-xl"} />
          ))}
        </div>
      ) : games.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <MagnifyingGlassIcon className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No games found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={view === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
            : "space-y-3"
          }
        >
          {games.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
            >
              <GameCard game={game} variant={view} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateParam("page", String(page - 1))}
          >
            Previous
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = totalPages <= 7 ? i + 1 : i < 3 ? i + 1 : i >= 4 ? totalPages - (6 - i) : page;
              return (
                <button
                  key={p}
                  onClick={() => updateParam("page", String(p))}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"}`}
                >
                  {p}
                </button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => updateParam("page", String(page + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
