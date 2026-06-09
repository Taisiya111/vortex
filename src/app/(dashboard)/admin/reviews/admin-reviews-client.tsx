"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  StarIcon,
  FlagIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeDate, getInitials, truncate } from "@/lib/utils";

interface Review {
  id: string;
  title: string | null;
  content: string;
  rating: number;
  spoiler: boolean;
  published: boolean;
  reported: boolean;
  createdAt: string;
  user: { id: string; name: string | null; username: string | null; image: string | null; email: string };
  game: { id: string; title: string; slug: string; coverImage: string | null };
  _count: { likes: number; comments: number };
}

interface AdminReviewsClientProps {
  initialReviews: Review[];
  stats: { total: number; reported: number; published: number; unpublished: number };
}

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "reported", label: "Reported" },
  { value: "unpublished", label: "Unpublished" },
];

export function AdminReviewsClient({ initialReviews, stats }: AdminReviewsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = reviews;
    if (filter === "reported") result = result.filter((r) => r.reported);
    if (filter === "unpublished") result = result.filter((r) => !r.published);

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (r) =>
          r.game.title.toLowerCase().includes(q) ||
          r.user.name?.toLowerCase().includes(q) ||
          r.user.username?.toLowerCase().includes(q) ||
          r.user.email.toLowerCase().includes(q)
      );
    }

    return result;
  }, [reviews, filter, query]);

  const statCards = [
    { label: "Total Reviews", value: stats.total, icon: StarIcon, color: "from-violet-500 to-indigo-500" },
    { label: "Reported", value: stats.reported, icon: FlagIcon, color: "from-red-500 to-orange-500" },
    { label: "Published", value: stats.published, icon: EyeIcon, color: "from-emerald-500 to-teal-500" },
    { label: "Unpublished", value: stats.unpublished, icon: EyeSlashIcon, color: "from-slate-500 to-slate-600" },
  ];

  async function patchReview(review: Review, data: Partial<{ published: boolean; reported: boolean }>) {
    setActioningId(review.id);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, ...updated } : r))
      );
      router.refresh();
      return true;
    } catch {
      toast({ title: "Error", description: "Failed to update review.", variant: "destructive" });
      return false;
    } finally {
      setActioningId(null);
    }
  }

  async function handleDismissReport(review: Review) {
    const ok = await patchReview(review, { reported: false });
    if (ok) toast({ title: "Report dismissed", description: `Report cleared for review on "${review.game.title}".` });
  }

  async function handleTogglePublish(review: Review) {
    const ok = await patchReview(review, { published: !review.published });
    if (ok) {
      toast({
        title: review.published ? "Review unpublished" : "Review republished",
        description: `Review on "${review.game.title}" is now ${review.published ? "hidden" : "visible"}.`,
      });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/reviews/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast({ title: "Review deleted", description: `The review on "${deleteTarget.game.title}" was deleted.` });
      router.refresh();
    } catch {
      toast({ title: "Error", description: "Failed to delete review.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
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
            <StarIcon className="h-7 w-7 text-violet-400" />
            Manage Reviews
          </h2>
          <p className="text-muted-foreground mt-0.5">
            Moderate reported reviews and manage published content
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }, i) => (
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
                <div className="text-2xl font-black">{value.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList>
                {FILTER_TABS.map(({ value, label }) => (
                  <TabsTrigger key={value} value={value}>
                    {label}
                    {value === "reported" && stats.reported > 0 && (
                      <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-[10px]">
                        {stats.reported}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="relative sm:w-72">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by game or user..."
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base">
            {filtered.length.toLocaleString()} review{filtered.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <StarIcon className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground">No reviews found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex flex-col sm:flex-row gap-4 p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start gap-3 sm:w-64 flex-shrink-0">
                    <div className="relative w-9 h-12 rounded overflow-hidden flex-shrink-0">
                      {review.game.coverImage ? (
                        <Image src={review.game.coverImage} alt={review.game.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-900 to-indigo-900 flex items-center justify-center">
                          <span className="text-xs font-bold text-white/30">{review.game.title[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/games/${review.game.slug}`}
                        className="text-sm font-semibold line-clamp-1 hover:text-primary transition-colors"
                      >
                        {review.game.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={review.user.image ?? ""} alt={review.user.name ?? ""} />
                          <AvatarFallback className="text-[10px] bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                            {getInitials(review.user.name ?? review.user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {review.user.name ?? review.user.username ?? review.user.email}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatRelativeDate(review.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <StarIcon className="h-3 w-3 text-amber-400" />
                        {review.rating}/10
                      </Badge>
                      {review.reported && (
                        <Badge variant="destructive" className="text-xs flex items-center gap-1">
                          <FlagIcon className="h-3 w-3" />
                          Reported
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          review.published
                            ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10"
                            : "text-slate-400 border-slate-400/20 bg-slate-400/10"
                        }`}
                      >
                        {review.published ? "Published" : "Unpublished"}
                      </Badge>
                      {review.spoiler && (
                        <Badge variant="warning" className="text-xs flex items-center gap-1">
                          <ExclamationTriangleIcon className="h-3 w-3" />
                          Spoiler
                        </Badge>
                      )}
                    </div>
                    {review.title && (
                      <p className="text-sm font-medium line-clamp-1">{review.title}</p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                      {truncate(review.content, 220)}
                    </p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <HeartIcon className="h-3.5 w-3.5" /> {review._count.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <ChatBubbleLeftIcon className="h-3.5 w-3.5" /> {review._count.comments}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-stretch gap-2 flex-shrink-0 sm:w-40">
                    {review.reported && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDismissReport(review)}
                        disabled={actioningId === review.id}
                      >
                        <FlagIcon className="h-3.5 w-3.5" />
                        Dismiss report
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(review)}
                      disabled={actioningId === review.id}
                    >
                      {review.published ? (
                        <>
                          <EyeSlashIcon className="h-3.5 w-3.5" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <EyeIcon className="h-3.5 w-3.5" />
                          Republish
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(review)}
                      className="text-destructive/70 hover:text-destructive"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <TrashIcon className="h-5 w-5" />
              Delete Review
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete the review by{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.user.name ?? deleteTarget?.user.email}
            </span>{" "}
            on{" "}
            <span className="font-semibold text-foreground">&quot;{deleteTarget?.game.title}&quot;</span>?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={isDeleting} disabled={isDeleting}>
              Delete Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
