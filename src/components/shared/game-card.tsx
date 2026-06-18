"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { StarIcon, BookmarkIcon, PlusIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatPriceRange, truncate } from "@/lib/utils";
import type { GameWithRelations } from "@/types";

interface GameCardProps {
  game: GameWithRelations;
  variant?: "grid" | "list" | "featured";
  className?: string;
  showActions?: boolean;
}

export function GameCard({ game, variant = "grid", className, showActions = true }: GameCardProps) {
  const avgRating = game.avgRating ?? 0;
  const reviewCount = game._count?.reviews ?? 0;

  if (variant === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
        className={cn("group", className)}
      >
        <Link href={`/games/${game.slug}`}>
          <div className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-300">
            <div className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden">
              {game.coverImage ? (
                <Image src={game.coverImage} alt={game.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-900 to-indigo-900 flex items-center justify-center">
                  <span className="text-xl font-bold text-white/50">{game.title[0]}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {game.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {game.developer} · {game.releaseDate ? new Date(game.releaseDate).getFullYear() : "TBA"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <StarIcon className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-xs font-medium">{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({reviewCount})</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {game.genres.slice(0, 2).map(({ genre }) => (
                    <Badge key={genre.id} variant="secondary" className="text-xs py-0">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
                {(game.priceMin != null || game.priceMax != null) && (
                  <span className="text-xs font-semibold text-primary ml-auto" title="Approximate market price, not the price on Vortex">
                    {formatPriceRange(game.priceMin, game.priceMax)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  if (variant === "featured") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("group relative rounded-2xl overflow-hidden", className)}
      >
        <Link href={`/games/${game.slug}`}>
          <div className="relative h-80 w-full">
            {game.bannerImage || game.coverImage ? (
              <Image
                src={(game.bannerImage ?? game.coverImage)!}
                alt={game.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex gap-2 mb-2">
                {game.genres.slice(0, 3).map(({ genre }) => (
                  <Badge key={genre.id} variant="secondary" className="text-xs glass">
                    {genre.name}
                  </Badge>
                ))}
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{game.title}</h3>
              <p className="text-sm text-white/70 line-clamp-2">{game.shortDesc}</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-semibold text-white">{avgRating.toFixed(1)}</span>
                </div>
                <span className="text-white/40">·</span>
                <span className="text-sm text-white/70">{reviewCount} reviews</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className={cn("group", className)}
    >
      <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        <Link href={`/games/${game.slug}`}>
          <div className="relative aspect-[3/4] w-full overflow-hidden">
            {game.coverImage ? (
              <Image
                src={game.coverImage}
                alt={game.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-900 flex items-center justify-center">
                <span className="text-4xl font-black text-white/20">{game.title[0]}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {game.metacriticScore && (
              <div className={cn(
                "absolute top-2 right-2 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold",
                game.metacriticScore >= 75 ? "bg-emerald-500 text-white" :
                game.metacriticScore >= 50 ? "bg-yellow-500 text-black" :
                "bg-red-500 text-white"
              )}>
                {game.metacriticScore}
              </div>
            )}
            {showActions && (
              <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                <Button size="icon-sm" variant="glass" className="h-8 w-8" onClick={(e) => e.preventDefault()}>
                  <BookmarkIcon className="h-4 w-4" />
                </Button>
                <Button size="icon-sm" variant="glass" className="h-8 w-8" onClick={(e) => e.preventDefault()}>
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Link>
        <div className="p-3">
          <Link href={`/games/${game.slug}`}>
            <h3 className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors">
              {game.title}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{game.developer}</p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                star <= Math.round(avgRating / 2) ? (
                  <StarIcon key={star} className="h-3 w-3 text-yellow-400" />
                ) : (
                  <StarOutline key={star} className="h-3 w-3 text-muted-foreground" />
                )
              ))}
              <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              {(game.priceMin != null || game.priceMax != null) && (
                <span
                  className="text-xs font-semibold text-primary"
                  title="Approximate market price, not the price on Vortex"
                >
                  {formatPriceRange(game.priceMin, game.priceMax)}
                </span>
              )}
              {game.genres.slice(0, 1).map(({ genre }) => (
                <Badge key={genre.id} variant="secondary" className="text-xs py-0 px-1.5">
                  {genre.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
