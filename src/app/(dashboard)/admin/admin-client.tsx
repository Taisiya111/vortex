"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  UsersIcon,
  PuzzlePieceIcon,
  StarIcon,
  BookOpenIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatRelativeDate, getInitials } from "@/lib/utils";

interface AdminStats {
  totalUsers: number;
  totalGames: number;
  totalReviews: number;
  totalLibraryEntries: number;
}

interface RecentUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
  _count: { library: number; reviews: number };
}

interface RecentGame {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  published: boolean;
  createdAt: Date;
  _count: { reviews: number; libraryEntries: number };
}

interface RecentReview {
  id: string;
  rating: number;
  content: string;
  createdAt: Date;
  user: { id: string; name: string | null; image: string | null };
  game: { id: string; title: string; slug: string };
}

interface AdminDashboardClientProps {
  stats: AdminStats;
  recentUsers: RecentUser[];
  recentGames: RecentGame[];
  recentReviews: RecentReview[];
  signupChart: { date: string; signups: number }[];
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-400 border-red-500/20",
  MODERATOR: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  USER: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export function AdminDashboardClient({
  stats,
  recentUsers,
  recentGames,
  recentReviews,
  signupChart,
}: AdminDashboardClientProps) {
  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: UsersIcon,
      color: "from-violet-500 to-indigo-500",
      href: "/admin/users",
    },
    {
      label: "Total Games",
      value: stats.totalGames.toLocaleString(),
      icon: PuzzlePieceIcon,
      color: "from-blue-500 to-cyan-500",
      href: "/admin/games",
    },
    {
      label: "Total Reviews",
      value: stats.totalReviews.toLocaleString(),
      icon: StarIcon,
      color: "from-emerald-500 to-teal-500",
      href: "/admin/reviews",
    },
    {
      label: "Library Entries",
      value: stats.totalLibraryEntries.toLocaleString(),
      icon: BookOpenIcon,
      color: "from-amber-500 to-orange-500",
      href: "/admin/library",
    },
  ];

  const quickLinks = [
    {
      href: "/admin/users",
      icon: UsersIcon,
      label: "Manage Users",
      desc: "View, ban, and manage user accounts",
    },
    {
      href: "/admin/games",
      icon: PuzzlePieceIcon,
      label: "Manage Games",
      desc: "Add, edit, and publish games",
    },
    {
      href: "/admin/reviews",
      icon: StarIcon,
      label: "Manage Reviews",
      desc: "Moderate reported reviews",
    },
    {
      href: "/admin/settings",
      icon: CogIcon,
      label: "Site Settings",
      desc: "Configure platform settings",
    },
  ];

  const latestSignupDate =
    signupChart[signupChart.length - 1]?.date?.slice(5) ?? "";
  const chartMax = Math.max(...signupChart.map((d) => d.signups), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
          <ShieldCheckIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black">Admin Dashboard</h2>
          <p className="text-muted-foreground mt-0.5">
            Platform overview and management
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, href }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={href}>
              <Card hover className="relative overflow-hidden">
                <div
                  className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-10 rounded-bl-full`}
                />
                <CardContent className="p-5">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-2xl font-black">{value}</div>
                  <div className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                    {label}
                    <ArrowRightIcon className="h-3 w-3 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Chart + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Signups Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ChartBarIcon className="h-4 w-4 text-violet-400" />
                User Signups (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={signupChart}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) => v.slice(5)}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "0.75rem",
                    }}
                    labelFormatter={(v) => `Date: ${v}`}
                    formatter={(v) => [v as number, "Signups"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="signups"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickLinks.map(({ href, icon: Icon, label, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-secondary/50 transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {desc}
                    </p>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Recent Users
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/users">
                    View all <ArrowRightIcon className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                      {getInitials(user.name ?? user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">
                      {user.name ?? user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeDate(user.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${roleColors[user.role] ?? roleColors.USER}`}
                  >
                    {user.role}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Games */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Recent Games
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/games">
                    View all <ArrowRightIcon className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentGames.map((game) => (
                <div key={game.id} className="flex items-center gap-3">
                  <div className="relative w-9 h-12 rounded overflow-hidden flex-shrink-0">
                    {game.coverImage ? (
                      <Image
                        src={game.coverImage}
                        alt={game.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-900 to-indigo-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{game.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {game._count.reviews} reviews · {game._count.libraryEntries} in libraries
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs flex-shrink-0 ${
                      game.published
                        ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10"
                        : "text-slate-400 border-slate-400/20 bg-slate-400/10"
                    }`}
                  >
                    {game.published ? "Live" : "Draft"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Recent Reviews
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/reviews">
                    View all <ArrowRightIcon className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentReviews.map((review) => (
                <div key={review.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={review.user.image ?? ""}
                        alt={review.user.name ?? ""}
                      />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                        {getInitials(review.user.name ?? "?")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {review.user.name} on{" "}
                      <Link
                        href={`/games/${review.game.slug}`}
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        {review.game.title}
                      </Link>
                    </span>
                    <span className="text-xs font-semibold ml-auto">
                      {review.rating}/10
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 pl-8">
                    {review.content}
                  </p>
                  {review !== recentReviews[recentReviews.length - 1] && (
                    <Separator className="mt-2" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
