"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ChartBarIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  TagIcon,
  BookOpenIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LIBRARY_STATUS_LABELS } from "@/lib/utils";

interface GameLite {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
}

interface TopRatedGame extends GameLite {
  avgRating: number;
  ratingCount: number;
}

interface MostReviewedGame extends GameLite {
  _count: { reviews: number };
}

interface MostWishlistedGame extends GameLite {
  _count: { wishlists: number };
}

interface GenrePopularity {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  count: number;
}

interface LibraryStatusEntry {
  status: string;
  count: number;
}

interface AdminAnalyticsClientProps {
  signupChart: { date: string; signups: number }[];
  libraryStatusDistribution: LibraryStatusEntry[];
  topRated: TopRatedGame[];
  mostReviewed: MostReviewedGame[];
  mostWishlisted: MostWishlistedGame[];
  genrePopularity: GenrePopularity[];
}

const PIE_COLORS = [
  "#8b5cf6",
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
];

function GameThumb({ game }: { game: GameLite }) {
  return (
    <div className="relative w-9 h-12 rounded overflow-hidden flex-shrink-0">
      {game.coverImage ? (
        <Image src={game.coverImage} alt={game.title} fill className="object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-violet-900 to-indigo-900 flex items-center justify-center">
          <span className="text-xs font-bold text-white/30">{game.title[0]}</span>
        </div>
      )}
    </div>
  );
}

function RankedList<T extends GameLite>({
  items,
  renderMeta,
}: {
  items: T[];
  renderMeta: (item: T) => React.ReactNode;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>;
  }
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <Link
          key={item.id}
          href={`/games/${item.slug}`}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
        >
          <span className="w-5 text-center text-sm font-black text-muted-foreground group-hover:text-primary transition-colors">
            {i + 1}
          </span>
          <GameThumb game={item} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
              {item.title}
            </p>
          </div>
          {renderMeta(item)}
        </Link>
      ))}
    </div>
  );
}

export function AdminAnalyticsClient({
  signupChart,
  libraryStatusDistribution,
  topRated,
  mostReviewed,
  mostWishlisted,
  genrePopularity,
}: AdminAnalyticsClientProps) {
  const totalSignups = signupChart.reduce((sum, d) => sum + d.signups, 0);
  const totalLibraryEntries = libraryStatusDistribution.reduce((sum, d) => sum + d.count, 0);

  const statusChartData = libraryStatusDistribution.map((d) => ({
    name: LIBRARY_STATUS_LABELS[d.status] ?? d.status,
    status: d.status,
    value: d.count,
  }));

  const genreChartData = genrePopularity.map((g) => ({
    name: g.name,
    count: g.count,
  }));

  const summaryCards = [
    {
      label: "New Signups (30d)",
      value: totalSignups.toLocaleString(),
      icon: ArrowTrendingUpIcon,
      color: "from-violet-500 to-indigo-500",
    },
    {
      label: "Library Entries",
      value: totalLibraryEntries.toLocaleString(),
      icon: BookOpenIcon,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Top Genres Tracked",
      value: genrePopularity.length.toLocaleString(),
      icon: TagIcon,
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Top Rated Games",
      value: topRated.length.toLocaleString(),
      icon: StarIcon,
      color: "from-blue-500 to-cyan-500",
    },
  ];

  return (
    <div className="space-y-8">
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
            <ChartBarIcon className="h-7 w-7 text-violet-400" />
            Analytics
          </h2>
          <p className="text-muted-foreground mt-0.5">
            Deep insights into platform growth and engagement
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-10 rounded-bl-full`} />
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-black">{value}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-violet-400" />
                User Growth (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={signupChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4 text-emerald-400" />
                Library Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {statusChartData.map((entry, i) => (
                      <Cell key={entry.status} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "0.75rem",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TagIcon className="h-4 w-4 text-amber-400" />
              Genre Popularity (Top 10 by Game Count)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={genreChartData} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "0.75rem",
                  }}
                  formatter={(v) => [v as number, "Games"]}
                  cursor={{ fill: "hsl(var(--secondary))", opacity: 0.4 }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <StarIcon className="h-4 w-4 text-amber-400" />
                Top Rated Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RankedList
                items={topRated}
                renderMeta={(g) => (
                  <Badge variant="outline" className="text-xs flex-shrink-0 flex items-center gap-1">
                    <StarIcon className="h-3 w-3 text-amber-400" />
                    {g.avgRating.toFixed(1)}
                    <span className="text-muted-foreground">({g.ratingCount})</span>
                  </Badge>
                )}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ChatBubbleLeftIcon className="h-4 w-4 text-blue-400" />
                Most Reviewed Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RankedList
                items={mostReviewed}
                renderMeta={(g) => (
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {g._count.reviews} review{g._count.reviews !== 1 ? "s" : ""}
                  </Badge>
                )}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <HeartIcon className="h-4 w-4 text-rose-400" />
                Most Wishlisted Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RankedList
                items={mostWishlisted}
                renderMeta={(g) => (
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {g._count.wishlists} wishlist{g._count.wishlists !== 1 ? "s" : ""}
                  </Badge>
                )}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
