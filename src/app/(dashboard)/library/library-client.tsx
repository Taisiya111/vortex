"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ClockIcon,
  StarIcon,
  BookOpenIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LIBRARY_STATUS_COLORS,
  LIBRARY_STATUS_LABELS,
} from "@/lib/utils";

interface LibraryGame {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  developer: string | null;
  releaseDate: Date | null;
  genres: { genre: { id: string; name: string; slug: string } }[];
  platforms: { platform: { id: string; name: string; slug: string } }[];
  _count?: { reviews: number; ratings: number; libraryEntries: number };
  avgRating?: number;
}

interface LibraryEntry {
  id: string;
  status: string;
  hoursPlayed: number | null;
  startedAt: Date | null;
  completedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  game: LibraryGame;
}

interface LibraryClientProps {
  entries: LibraryEntry[];
  statusCounts: Record<string, number>;
  totalHours: number;
}

const STATUS_TABS = [
  { value: "ALL", label: "All" },
  { value: "PLAYING", label: "Playing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PAUSED", label: "Paused" },
  { value: "DROPPED", label: "Dropped" },
  { value: "PLAN_TO_PLAY", label: "Plan to Play" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Recently Updated" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "title_desc", label: "Title Z–A" },
  { value: "hours_desc", label: "Most Hours" },
  { value: "hours_asc", label: "Fewest Hours" },
  { value: "added", label: "Date Added" },
];

export function LibraryClient({
  entries,
  statusCounts,
  totalHours,
}: LibraryClientProps) {
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");

  const filtered = useMemo(() => {
    let result = entries;

    if (activeStatus !== "ALL") {
      result = result.filter((e) => e.status === activeStatus);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (e) =>
          e.game.title.toLowerCase().includes(q) ||
          e.game.developer?.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "title_asc":
        result = [...result].sort((a, b) =>
          a.game.title.localeCompare(b.game.title)
        );
        break;
      case "title_desc":
        result = [...result].sort((a, b) =>
          b.game.title.localeCompare(a.game.title)
        );
        break;
      case "hours_desc":
        result = [...result].sort(
          (a, b) => (b.hoursPlayed ?? 0) - (a.hoursPlayed ?? 0)
        );
        break;
      case "hours_asc":
        result = [...result].sort(
          (a, b) => (a.hoursPlayed ?? 0) - (b.hoursPlayed ?? 0)
        );
        break;
      case "added":
        result = [...result].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "recent":
      default:
        result = [...result].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
    }

    return result;
  }, [entries, activeStatus, query, sort]);

  const totalCount = entries.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-black">My Library</h2>
          <p className="text-muted-foreground mt-1">
            {totalCount} games · {Math.round(totalHours)}h tracked
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/games">
            <BookOpenIcon className="h-4 w-4" />
            Browse Games
          </Link>
        </Button>
      </motion.div>

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 sm:grid-cols-6 gap-3"
      >
        {STATUS_TABS.filter((t) => t.value !== "ALL").map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveStatus(value)}
            className={`p-3 rounded-xl border text-center transition-all duration-200 ${
              activeStatus === value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/30 hover:bg-secondary/50"
            }`}
          >
            <div className="text-xl font-black">{statusCounts[value] ?? 0}</div>
            <span className={`text-xs ${LIBRARY_STATUS_COLORS[value]}`}>
              {label}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Search, Sort, View */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your library..."
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

      {/* Status filter tabs */}
      <Tabs value={activeStatus} onValueChange={setActiveStatus}>
        <TabsList className="flex flex-wrap gap-1 h-auto p-1">
          {STATUS_TABS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value} className="text-xs sm:text-sm">
              {label}
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {value === "ALL" ? totalCount : (statusCounts[value] ?? 0)}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

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
            <BookOpenIcon className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">
              {query ? "No games found" : "No games here yet"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {query
                ? "Try a different search term"
                : "Add games to your library to see them here"}
            </p>
          </motion.div>
        ) : view === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
          >
            {filtered.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.5) }}
              >
                <Link href={`/games/${entry.game.slug}`}>
                  <div className="group relative rounded-xl overflow-hidden aspect-[3/4] bg-secondary border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                    {entry.game.coverImage ? (
                      <Image
                        src={entry.game.coverImage}
                        alt={entry.game.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-900 flex items-center justify-center">
                        <span className="text-3xl font-black text-white/20">
                          {entry.game.title[0]}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 space-y-1">
                      <p className="text-white text-xs font-semibold line-clamp-1">
                        {entry.game.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${LIBRARY_STATUS_COLORS[entry.status]}`}
                        >
                          {LIBRARY_STATUS_LABELS[entry.status]}
                        </span>
                        {entry.hoursPlayed != null && entry.hoursPlayed > 0 && (
                          <span className="text-white/60 text-xs flex items-center gap-0.5">
                            <ClockIcon className="h-3 w-3" />
                            {entry.hoursPlayed.toFixed(0)}h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
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
            {filtered.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
              >
                <Link href={`/games/${entry.game.slug}`}>
                  <Card hover className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-4 p-4">
                        <div className="relative w-14 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          {entry.game.coverImage ? (
                            <Image
                              src={entry.game.coverImage}
                              alt={entry.game.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-violet-900 to-indigo-900 flex items-center justify-center">
                              <span className="text-lg font-bold text-white/30">
                                {entry.game.title[0]}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 justify-between">
                            <div>
                              <h3 className="font-semibold line-clamp-1 hover:text-primary transition-colors">
                                {entry.game.title}
                              </h3>
                              {entry.game.developer && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {entry.game.developer}
                                  {entry.game.releaseDate && (
                                    <> · {new Date(entry.game.releaseDate).getFullYear()}</>
                                  )}
                                </p>
                              )}
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${LIBRARY_STATUS_COLORS[entry.status]}`}
                            >
                              {LIBRARY_STATUS_LABELS[entry.status]}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mt-2">
                            {entry.game.genres.slice(0, 2).map(({ genre }) => (
                              <Badge
                                key={genre.id}
                                variant="secondary"
                                className="text-xs"
                              >
                                {genre.name}
                              </Badge>
                            ))}
                            {entry.hoursPlayed != null && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                {entry.hoursPlayed.toFixed(0)}h played
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
