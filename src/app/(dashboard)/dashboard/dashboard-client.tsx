"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  BookmarkIcon,
  FolderOpenIcon,
  TrophyIcon,
  FireIcon,
  ArrowRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatRelativeDate, LIBRARY_STATUS_COLORS, LIBRARY_STATUS_LABELS, getInitials } from "@/lib/utils";

interface DashboardClientProps {
  user: { id?: string; name?: string | null; email?: string | null; image?: string | null };
  stats: {
    totalGames: number;
    playing: number;
    completed: number;
    dropped: number;
    planToPlay: number;
    totalHours: number;
    reviews: number;
    wishlistCount: number;
    collectionsCount: number;
  };
  recentLibrary: Array<{
    id: string;
    status: string;
    hoursPlayed: number | null;
    updatedAt: Date;
    game: {
      id: string;
      title: string;
      slug: string;
      coverImage: string | null;
      genres: { genre: { id: string; name: string } }[];
    };
  }>;
  recentReviews: Array<{
    id: string;
    rating: number;
    content: string;
    createdAt: Date;
    game: { id: string; title: string; slug: string; coverImage: string | null };
    _count: { likes: number; comments: number };
  }>;
  recentActivities: Array<{
    id: string;
    action: string;
    entityType: string;
    createdAt: Date;
    user: { id: string; name: string | null; image: string | null };
  }>;
}

const statCards = [
  { key: "totalGames", label: "Total Games", icon: BookOpenIcon, color: "from-violet-500 to-indigo-500" },
  { key: "playing", label: "Currently Playing", icon: FireIcon, color: "from-emerald-500 to-teal-500" },
  { key: "completed", label: "Completed", icon: CheckCircleIcon, color: "from-blue-500 to-cyan-500" },
  { key: "totalHours", label: "Hours Tracked", icon: ClockIcon, color: "from-amber-500 to-orange-500" },
];

export function DashboardClient({ user, stats, recentLibrary, recentReviews, recentActivities }: DashboardClientProps) {
  const completionRate = stats.totalGames > 0 ? Math.round((stats.completed / stats.totalGames) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-black">
            Welcome back, {user.name?.split(" ")[0] ?? "Gamer"} 👾
          </h2>
          <p className="text-muted-foreground mt-1">Here's your gaming overview</p>
        </div>
        <Button variant="gradient" asChild className="hidden sm:flex">
          <Link href="/games">
            <PlusIcon className="h-4 w-4" />
            Add game
          </Link>
        </Button>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, color }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card hover className="relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-full`} />
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-black">
                  {key === "totalHours"
                    ? `${stats.totalHours.toFixed(0)}h`
                    : stats[key as keyof typeof stats]}
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Library breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Library Breakdown
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/library">View all <ArrowRightIcon className="h-3.5 w-3.5 ml-1" /></Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Completion rate</span>
                  <span className="font-semibold">{completionRate}%</span>
                </div>
                <Progress value={completionRate} />
              </div>
              <Separator />
              {[
                { key: "PLAYING", count: stats.playing },
                { key: "COMPLETED", count: stats.completed },
                { key: "DROPPED", count: stats.dropped },
                { key: "PLAN_TO_PLAY", count: stats.planToPlay },
              ].map(({ key, count }) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${LIBRARY_STATUS_COLORS[key]}`}>
                      {LIBRARY_STATUS_LABELS[key]}
                    </span>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recently added */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Recently in Library
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/library">View all <ArrowRightIcon className="h-3.5 w-3.5 ml-1" /></Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentLibrary.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpenIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Your library is empty</p>
                  <Button variant="gradient" size="sm" asChild className="mt-4">
                    <Link href="/games">Browse games</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {recentLibrary.slice(0, 6).map((entry) => (
                    <Link key={entry.id} href={`/games/${entry.game.slug}`}>
                      <div className="group relative rounded-lg overflow-hidden aspect-[3/4] bg-secondary">
                        {entry.game.coverImage ? (
                          <Image src={entry.game.coverImage} alt={entry.game.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-violet-900 to-indigo-900 flex items-center justify-center">
                            <span className="text-white/30 font-black text-2xl">{entry.game.title[0]}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-white text-xs font-semibold line-clamp-1">{entry.game.title}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${LIBRARY_STATUS_COLORS[entry.status]}`}>
                            {LIBRARY_STATUS_LABELS[entry.status]}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: StarIcon, value: stats.reviews, label: "Reviews", href: "/reviews" },
                  { icon: BookmarkIcon, value: stats.wishlistCount, label: "Wishlist", href: "/wishlist" },
                  { icon: FolderOpenIcon, value: stats.collectionsCount, label: "Collections", href: "/collections" },
                ].map(({ icon: Icon, value, label, href }) => (
                  <Link key={label} href={href} className="group text-center p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-secondary/50 transition-all duration-200">
                    <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
                    <div className="text-2xl font-black">{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Recent Reviews
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/reviews">View all <ArrowRightIcon className="h-3.5 w-3.5 ml-1" /></Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentReviews.length === 0 ? (
                <div className="text-center py-6">
                  <StarIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReviews.map((review) => (
                    <Link key={review.id} href={`/games/${review.game.slug}`} className="flex items-center gap-3 group p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="relative w-10 h-12 rounded overflow-hidden flex-shrink-0">
                        {review.game.coverImage ? (
                          <Image src={review.game.coverImage} alt={review.game.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-secondary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{review.game.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon key={i} className={`h-3 w-3 ${i < Math.round(review.rating / 2) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">{formatRelativeDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
