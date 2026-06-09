"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  BookOpenIcon,
  StarIcon,
  FolderOpenIcon,
  TrophyIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  FireIcon,
  UsersIcon,
  PencilIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatRelativeDate,
  formatDate,
  LIBRARY_STATUS_COLORS,
  LIBRARY_STATUS_LABELS,
  getInitials,
} from "@/lib/utils";

interface ProfileUser {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  image: string | null;
  banner: string | null;
  bio: string | null;
  role: string;
  createdAt: Date;
}

interface ProfileStats {
  totalGames: number;
  playing: number;
  completed: number;
  dropped: number;
  paused: number;
  planToPlay: number;
  totalHours: number;
  reviews: number;
  collections: number;
  followerCount: number;
  followingCount: number;
}

interface LibraryEntry {
  id: string;
  status: string;
  hoursPlayed: number | null;
  updatedAt: Date;
  game: {
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
    developer: string | null;
    releaseDate: Date | null;
    genres: { genre: { id: string; name: string } }[];
  };
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  spoiler: boolean;
  createdAt: Date;
  game: { id: string; title: string; slug: string; coverImage: string | null };
  _count: { likes: number; comments: number };
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  public: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    game: { id: string; title: string; slug: string; coverImage: string | null };
  }[];
  _count: { items: number };
}

interface Achievement {
  id: string;
  unlockedAt: Date;
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string | null;
    points: number;
  };
}

interface ProfileClientProps {
  user: ProfileUser;
  stats: ProfileStats;
  libraryEntries: LibraryEntry[];
  reviews: Review[];
  collections: Collection[];
  achievements: Achievement[];
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-400 border-red-500/20",
  MODERATOR: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  USER: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

const statusOrder = ["PLAYING", "COMPLETED", "PAUSED", "DROPPED", "PLAN_TO_PLAY"];

export function ProfileClient({
  user,
  stats,
  libraryEntries,
  reviews,
  collections,
  achievements,
}: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState("library");
  const completionRate =
    stats.totalGames > 0
      ? Math.round((stats.completed / stats.totalGames) * 100)
      : 0;

  const displayName = user.name ?? user.username ?? user.email;

  return (
    <div className="space-y-6">
      {/* Banner & Avatar Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Banner */}
        <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-900">
          {user.banner ? (
            <Image
              src={user.banner}
              alt="Profile banner"
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-900">
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-white/10"
                    style={{
                      width: Math.random() * 100 + 20,
                      height: Math.random() * 100 + 20,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Edit banner button */}
          <div className="absolute top-4 right-4">
            <Button variant="glass" size="sm" asChild>
              <Link href="/settings">
                <CameraIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Avatar & Info */}
        <div className="px-4 sm:px-6 -mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="relative">
              <Avatar className="h-28 w-28 border-4 border-background shadow-2xl ring-2 ring-violet-500/30">
                <AvatarImage src={user.image ?? ""} alt={displayName} />
                <AvatarFallback className="text-2xl font-black bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-background" />
            </div>

            <div className="flex-1 min-w-0 pb-2">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black truncate">{displayName}</h1>
                <Badge
                  variant="outline"
                  className={`text-xs ${roleColors[user.role] ?? roleColors.USER}`}
                >
                  {user.role}
                </Badge>
              </div>
              {user.username && (
                <p className="text-muted-foreground text-sm">@{user.username}</p>
              )}
              {user.bio && (
                <p className="text-sm mt-2 max-w-xl text-foreground/80">{user.bio}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5" />
                Joined {formatDate(user.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-3 pb-2">
              <Button variant="gradient" size="sm" asChild>
                <Link href="/settings">
                  <PencilIcon className="h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {[
          {
            icon: BookOpenIcon,
            value: stats.totalGames,
            label: "Games",
            color: "from-violet-500 to-indigo-500",
          },
          {
            icon: CheckCircleIcon,
            value: stats.completed,
            label: "Completed",
            color: "from-blue-500 to-cyan-500",
          },
          {
            icon: FireIcon,
            value: stats.playing,
            label: "Playing",
            color: "from-emerald-500 to-teal-500",
          },
          {
            icon: ClockIcon,
            value: `${Math.round(stats.totalHours)}h`,
            label: "Hours",
            color: "from-amber-500 to-orange-500",
          },
          {
            icon: UsersIcon,
            value: stats.followerCount,
            label: "Followers",
            color: "from-pink-500 to-rose-500",
          },
          {
            icon: StarIcon,
            value: stats.reviews,
            label: "Reviews",
            color: "from-yellow-500 to-amber-500",
          },
        ].map(({ icon: Icon, value, label, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card hover className="text-center relative overflow-hidden">
              <div
                className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${color}`}
              />
              <CardContent className="p-4">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-2`}
                >
                  <Icon className="h-4.5 w-4.5 text-white" />
                </div>
                <div className="text-xl font-black">{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex gap-1 mb-6">
            <TabsTrigger value="library" className="gap-1.5">
              <BookOpenIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Library</span>
              <Badge variant="secondary" className="text-xs ml-1 hidden sm:inline-flex">
                {stats.totalGames}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-1.5">
              <StarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Reviews</span>
              <Badge variant="secondary" className="text-xs ml-1 hidden sm:inline-flex">
                {stats.reviews}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="collections" className="gap-1.5">
              <FolderOpenIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Collections</span>
              <Badge variant="secondary" className="text-xs ml-1 hidden sm:inline-flex">
                {stats.collections}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-1.5">
              <TrophyIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
          </TabsList>

          {/* Library Tab */}
          <TabsContent value="library">
            <AnimatePresence mode="wait">
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Status breakdown */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Library Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Completion rate</span>
                      <span className="font-semibold">{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                    <Separator />
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {statusOrder.map((status) => {
                        const count =
                          stats[
                            status === "PLAN_TO_PLAY"
                              ? "planToPlay"
                              : (status.toLowerCase() as keyof ProfileStats)
                          ] as number;
                        return (
                          <div key={status} className="text-center p-3 rounded-xl border border-border">
                            <div className="text-lg font-black">{count}</div>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${LIBRARY_STATUS_COLORS[status]}`}
                            >
                              {LIBRARY_STATUS_LABELS[status]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent library entries */}
                {libraryEntries.length === 0 ? (
                  <div className="text-center py-16">
                    <BookOpenIcon className="h-14 w-14 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No games yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Start building your library
                    </p>
                    <Button variant="gradient" asChild>
                      <Link href="/games">Browse Games</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {libraryEntries.map((entry, i) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Link href={`/games/${entry.game.slug}`}>
                          <div className="group relative rounded-xl overflow-hidden aspect-[3/4] bg-secondary border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                            {entry.game.coverImage ? (
                              <Image
                                src={entry.game.coverImage}
                                alt={entry.game.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-violet-900 to-indigo-900 flex items-center justify-center">
                                <span className="text-3xl font-black text-white/20">
                                  {entry.game.title[0]}
                                </span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="text-white text-xs font-semibold line-clamp-1 mb-1">
                                {entry.game.title}
                              </p>
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded-full ${LIBRARY_STATUS_COLORS[entry.status]}`}
                              >
                                {LIBRARY_STATUS_LABELS[entry.status]}
                              </span>
                              {entry.hoursPlayed != null && (
                                <p className="text-white/60 text-xs mt-0.5">
                                  {entry.hoursPlayed.toFixed(0)}h
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <AnimatePresence mode="wait">
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {reviews.length === 0 ? (
                  <div className="text-center py-16">
                    <StarIcon className="h-14 w-14 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Share your thoughts on games
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review, i) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <Card hover>
                          <CardContent className="p-5">
                            <div className="flex gap-4">
                              <Link
                                href={`/games/${review.game.slug}`}
                                className="flex-shrink-0"
                              >
                                <div className="relative w-14 h-20 rounded-lg overflow-hidden">
                                  {review.game.coverImage ? (
                                    <Image
                                      src={review.game.coverImage}
                                      alt={review.game.title}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-secondary" />
                                  )}
                                </div>
                              </Link>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div>
                                    <Link
                                      href={`/games/${review.game.slug}`}
                                      className="font-semibold hover:text-primary transition-colors line-clamp-1"
                                    >
                                      {review.game.title}
                                    </Link>
                                    {review.title && (
                                      <p className="text-sm text-muted-foreground line-clamp-1">
                                        {review.title}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-0.5 flex-shrink-0">
                                    {Array.from({ length: 5 }).map((_, s) => (
                                      <StarSolid
                                        key={s}
                                        className={`h-4 w-4 ${
                                          s < Math.round(review.rating / 2)
                                            ? "text-yellow-400"
                                            : "text-muted-foreground/30"
                                        }`}
                                      />
                                    ))}
                                    <span className="text-sm font-semibold ml-1">
                                      {review.rating}/10
                                    </span>
                                  </div>
                                </div>
                                {review.spoiler ? (
                                  <p className="text-sm text-muted-foreground italic">
                                    [Contains spoilers]
                                  </p>
                                ) : (
                                  <p className="text-sm text-foreground/80 line-clamp-3">
                                    {review.content}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                                  <span>{formatRelativeDate(review.createdAt)}</span>
                                  <span>·</span>
                                  <span>{review._count.likes} likes</span>
                                  <span>·</span>
                                  <span>{review._count.comments} comments</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections">
            <AnimatePresence mode="wait">
              <motion.div
                key="collections"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {collections.length === 0 ? (
                  <div className="text-center py-16">
                    <FolderOpenIcon className="h-14 w-14 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Organize your games into collections
                    </p>
                    <Button variant="gradient" asChild>
                      <Link href="/collections">Create Collection</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collections.map((collection, i) => (
                      <motion.div
                        key={collection.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <Card hover className="overflow-hidden">
                          {/* Cover grid */}
                          <div className="grid grid-cols-2 h-32">
                            {collection.items.slice(0, 4).map((item, idx) => (
                              <div
                                key={item.id}
                                className="relative overflow-hidden bg-secondary"
                              >
                                {item.game.coverImage ? (
                                  <Image
                                    src={item.game.coverImage}
                                    alt={item.game.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-violet-900 to-indigo-900" />
                                )}
                              </div>
                            ))}
                            {Array.from({
                              length: Math.max(0, 4 - collection.items.length),
                            }).map((_, idx) => (
                              <div
                                key={`empty-${idx}`}
                                className="bg-secondary/50"
                              />
                            ))}
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold line-clamp-1">
                                  {collection.name}
                                </h3>
                                {collection.description && (
                                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                    {collection.description}
                                  </p>
                                )}
                              </div>
                              {!collection.public && (
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  Private
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-muted-foreground">
                                {collection._count.items} games
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeDate(collection.updatedAt)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <AnimatePresence mode="wait">
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {achievements.length === 0 ? (
                  <div className="text-center py-16">
                    <TrophyIcon className="h-14 w-14 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Keep playing to unlock achievements
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((ua, i) => (
                      <motion.div
                        key={ua.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card hover>
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-amber-500/20">
                              {ua.achievement.icon ?? "🏆"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold line-clamp-1">
                                {ua.achievement.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {ua.achievement.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <Badge
                                  variant="secondary"
                                  className="text-xs text-amber-400"
                                >
                                  +{ua.achievement.points} pts
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatRelativeDate(ua.unlockedAt)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
