"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  StarIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  EyeSlashIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatRelativeDate } from "@/lib/utils";

interface ReviewItem {
  id: string;
  content: string;
  title: string | null;
  rating: number;
  spoiler: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  game: { id: string; title: string; slug: string; coverImage: string | null };
  _count: { likes: number; comments: number };
}

interface ReviewsClientProps {
  reviews: ReviewItem[];
  totalReviews: number;
  avgRating: number;
  totalLikes: number;
}

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "rating_high", label: "Highest Rated" },
  { value: "rating_low", label: "Lowest Rated" },
  { value: "liked", label: "Most Liked" },
];

const RATING_FILTERS = [
  { value: "all", label: "All Ratings" },
  { value: "9", label: "9-10" },
  { value: "7", label: "7-8" },
  { value: "5", label: "5-6" },
  { value: "3", label: "3-4" },
  { value: "0", label: "0-2" },
];

export function ReviewsClient({ reviews, totalReviews, avgRating, totalLikes }: ReviewsClientProps) {
  const { toast } = useToast();
  const [list, setList] = useState(reviews);
  const [query, setQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [editTarget, setEditTarget] = useState<ReviewItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [editSpoiler, setEditSpoiler] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ReviewItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    let result = list;

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (r) =>
          r.game.title.toLowerCase().includes(q) ||
          r.title?.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q)
      );
    }

    if (ratingFilter !== "all") {
      const min = parseInt(ratingFilter, 10);
      const max = min === 9 ? 10 : min + 1;
      result = result.filter((r) => r.rating >= min && r.rating <= max);
    }

    switch (sort) {
      case "rating_high":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case "rating_low":
        result = [...result].sort((a, b) => a.rating - b.rating);
        break;
      case "liked":
        result = [...result].sort((a, b) => b._count.likes - a._count.likes);
        break;
      case "recent":
      default:
        result = [...result].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return result;
  }, [list, query, ratingFilter, sort]);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openEdit(review: ReviewItem) {
    setEditTarget(review);
    setEditTitle(review.title ?? "");
    setEditContent(review.content);
    setEditRating(review.rating);
    setEditSpoiler(review.spoiler);
  }

  async function handleSaveEdit() {
    if (!editTarget) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/reviews/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim() || null,
          content: editContent,
          rating: editRating,
          spoiler: editSpoiler,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setList((prev) => prev.map((r) => (r.id === editTarget.id ? { ...r, ...updated } : r)));
      setEditTarget(null);
      toast({ title: "Review updated", description: "Your changes have been saved." });
    } catch {
      toast({ title: "Error", description: "Failed to update review.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reviews/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setList((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast({ title: "Review deleted", description: `Your review of "${deleteTarget.game.title}" was deleted.` });
    } catch {
      toast({ title: "Error", description: "Failed to delete review.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  }

  const totalCount = list.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-black">My Reviews</h2>
          <p className="text-muted-foreground mt-1">
            {totalCount} review{totalCount !== 1 ? "s" : ""} written
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/games">
            <BookOpenIcon className="h-4 w-4" />
            Browse Games
          </Link>
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-3"
      >
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black">{totalReviews}</div>
            <span className="text-xs text-muted-foreground">Total Reviews</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black flex items-center justify-center gap-1">
              <StarSolid className="h-5 w-5 text-yellow-400" />
              {avgRating.toFixed(1)}
            </div>
            <span className="text-xs text-muted-foreground">Average Rating Given</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black flex items-center justify-center gap-1">
              <HeartIcon className="h-5 w-5 text-rose-400" />
              {totalLikes}
            </div>
            <span className="text-xs text-muted-foreground">Likes Received</span>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search, Filter, Sort */}
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
            placeholder="Search your reviews..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RATING_FILTERS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <StarIcon className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">
              {query || ratingFilter !== "all" ? "No reviews found" : "You haven't written any reviews yet"}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {query || ratingFilter !== "all"
                ? "Try a different search or filter"
                : "Share your thoughts on games you've played"}
            </p>
            {!query && ratingFilter === "all" && (
              <Button variant="gradient" asChild>
                <Link href="/games">
                  <BookOpenIcon className="h-4 w-4" />
                  Browse Games
                </Link>
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {filtered.map((review, i) => {
              const expanded = expandedIds.has(review.id);
              const isLong = review.content.length > 320;
              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: Math.min(i * 0.05, 0.5) }}
                >
                  <Card hover>
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <Link href={`/games/${review.game.slug}`} className="flex-shrink-0">
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
                            <div className="min-w-0">
                              <Link
                                href={`/games/${review.game.slug}`}
                                className="font-semibold hover:text-primary transition-colors line-clamp-1"
                              >
                                {review.game.title}
                              </Link>
                              {review.title && (
                                <p className="text-sm text-muted-foreground line-clamp-1">{review.title}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="flex items-center gap-0.5">
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
                                <span className="text-sm font-semibold ml-1">{review.rating}/10</span>
                              </div>
                            </div>
                          </div>

                          {review.spoiler && (
                            <Badge variant="warning" className="mb-2 gap-1">
                              <EyeSlashIcon className="h-3 w-3" />
                              Contains spoilers
                            </Badge>
                          )}

                          <p className={`text-sm text-foreground/80 ${expanded ? "" : "line-clamp-3"}`}>
                            {review.content}
                          </p>
                          {isLong && (
                            <button
                              onClick={() => toggleExpand(review.id)}
                              className="text-xs text-primary hover:underline mt-1 font-medium"
                            >
                              {expanded ? "Show less" : "Read more"}
                            </button>
                          )}

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <HeartIcon className="h-3.5 w-3.5" />
                                {review._count.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <ChatBubbleLeftIcon className="h-3.5 w-3.5" />
                                {review._count.comments}
                              </span>
                              <span>·</span>
                              <span title={formatDate(review.createdAt)}>
                                {formatRelativeDate(review.createdAt)}
                              </span>
                              {review.updatedAt > review.createdAt && (
                                <span className="italic">(edited)</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openEdit(review)}
                                title="Edit review"
                              >
                                <PencilIcon className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setDeleteTarget(review)}
                                title="Delete review"
                              >
                                <TrashIcon className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Dialog */}
      <Dialog open={editTarget !== null} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const value = idx + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setEditRating(value)}
                      className="p-0.5"
                    >
                      <StarSolid
                        className={`h-6 w-6 transition-colors ${
                          value <= editRating ? "text-yellow-400" : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-sm font-semibold ml-2">{editRating}/10</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Review title (optional)"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Share your thoughts..."
                className="min-h-[140px]"
              />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editSpoiler}
                onChange={(e) => setEditSpoiler(e.target.checked)}
                className="h-4 w-4 rounded border-border bg-secondary/50 accent-primary cursor-pointer"
              />
              Contains spoilers
            </label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditTarget(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleSaveEdit}
              loading={isSaving}
              disabled={isSaving || editContent.trim().length < 10 || editRating < 1}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <TrashIcon className="h-5 w-5" />
              Delete Review
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete your review of{" "}
            <span className="font-semibold text-foreground">&ldquo;{deleteTarget?.game.title}&rdquo;</span>?
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
