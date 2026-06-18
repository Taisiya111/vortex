"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  StarIcon,
  BookmarkIcon,
  PlusIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ArrowTopRightOnSquareIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid, BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GameCard } from "@/components/shared/game-card";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatPrice, formatRelativeDate, getInitials, LIBRARY_STATUS_LABELS } from "@/lib/utils";
import type { GameWithRelations } from "@/types";

interface GameDetailClientProps {
  game: GameWithRelations & {
    screenshots: { id: string; url: string; caption: string | null }[];
    tags: { tag: { id: string; name: string } }[];
  };
  avgRating: number;
  reviews: Array<{
    id: string;
    content: string;
    title: string | null;
    rating: number;
    spoiler: boolean;
    createdAt: Date;
    user: { id: string; name: string | null; username: string | null; image: string | null };
    _count: { likes: number; comments: number };
  }>;
  similarGames: GameWithRelations[];
  userLibraryEntry: { id: string; status: string } | null;
  userRating: { score: number } | null;
  userReview: { id: string; content: string } | null;
  isWishlisted: boolean;
  isAuthenticated: boolean;
}

export function GameDetailClient({
  game, avgRating, reviews, similarGames,
  userLibraryEntry, userRating, userReview, isWishlisted, isAuthenticated,
}: GameDetailClientProps) {
  const { toast } = useToast();
  const [wishlistState, setWishlistState] = useState(isWishlisted);
  const [libraryStatus, setLibraryStatus] = useState(userLibraryEntry?.status ?? null);
  const [userScore, setUserScore] = useState(userRating?.score ?? 0);
  const [hoverScore, setHoverScore] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewContent, setReviewContent] = useState(userReview?.content ?? "");
  const [reviewRating, setReviewRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [localReviews, setLocalReviews] = useState(reviews);
  const [hasReviewed, setHasReviewed] = useState(!!userReview);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  async function toggleWishlist() {
    if (!isAuthenticated) { toast({ title: "Sign in required", description: "Create an account to save to wishlist.", variant: "destructive" }); return; }
    try {
      const method = wishlistState ? "DELETE" : "POST";
      await fetch(`/api/wishlist`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gameId: game.id }) });
      setWishlistState(!wishlistState);
      toast({ title: wishlistState ? "Removed from wishlist" : "Added to wishlist", variant: "success" as Parameters<typeof toast>[0]["variant"] });
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    }
  }

  async function updateLibraryStatus(status: string) {
    if (!isAuthenticated) { toast({ title: "Sign in required" }); return; }
    try {
      await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game.id, status }),
      });
      setLibraryStatus(status);
      toast({ title: "Library updated", description: `Marked as ${LIBRARY_STATUS_LABELS[status]}` });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function submitReview() {
    if (!reviewContent.trim() || reviewContent.trim().length < 10) {
      toast({ title: "Review too short", description: "Your review must be at least 10 characters.", variant: "destructive" });
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game.id, content: reviewContent.trim(), rating: reviewRating, spoiler: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Failed to publish review", description: data.error ?? "Please try again.", variant: "destructive" });
        return;
      }
      setLocalReviews((prev) => [data, ...prev]);
      setHasReviewed(true);
      setShowReviewForm(false);
      setReviewContent("");
      setReviewRating(0);
      toast({ title: "Review published!", description: "Your review has been posted." });
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmittingReview(false);
    }
  }

  async function submitRating(score: number) {
    if (!isAuthenticated) { toast({ title: "Sign in required" }); return; }
    try {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game.id, score }),
      });
      setUserScore(score);
      toast({ title: "Rating saved!" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  const displayRating = hoverScore || userScore;

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80">
        {game.bannerImage || game.coverImage ? (
          <Image
            src={(game.bannerImage ?? game.coverImage)!}
            alt={game.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Game info */}
      <div className="flex flex-col sm:flex-row gap-6 -mt-20 relative z-10">
        {/* Cover */}
        <div className="relative w-36 h-48 sm:w-44 sm:h-56 rounded-xl overflow-hidden border-2 border-border shadow-2xl flex-shrink-0 mx-auto sm:mx-0">
          {game.coverImage ? (
            <Image src={game.coverImage} alt={game.title} fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-900 to-indigo-900 flex items-center justify-center">
              <span className="text-4xl font-black text-white/30">{game.title[0]}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 pt-20 sm:pt-0 sm:mt-auto">
          <div className="flex gap-2 mb-3 flex-wrap">
            {game.genres.slice(0, 3).map(({ genre }) => (
              <Badge key={genre.id} variant="default">{genre.name}</Badge>
            ))}
            {game.releaseDate && (
              <Badge variant="secondary">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {new Date(game.releaseDate).getFullYear()}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2">{game.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            {game.developer && <span>by <span className="text-foreground font-medium">{game.developer}</span></span>}
            {game.publisher && game.publisher !== game.developer && <span>· Published by {game.publisher}</span>}
          </div>

          {/* Rating display */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <StarSolid key={s} className={`h-5 w-5 ${s <= Math.round(avgRating / 2) ? "text-yellow-400" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="font-bold text-lg">{avgRating.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">({game._count?.ratings} ratings)</span>
            </div>
            {game.metacriticScore && (
              <div className={`px-3 py-1 rounded-lg text-sm font-bold ${game.metacriticScore >= 75 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"}`}>
                MC: {game.metacriticScore}
              </div>
            )}
            {game.price != null && (
              <div className="px-3 py-1 rounded-lg text-sm font-bold bg-primary/10 text-primary border border-primary/30">
                {formatPrice(game.price)}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Select
              value={libraryStatus ?? ""}
              onValueChange={updateLibraryStatus}
            >
              <SelectTrigger className="w-44">
                <div className="flex items-center gap-2">
                  <PlusIcon className="h-4 w-4" />
                  <SelectValue placeholder="Add to library" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LIBRARY_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={wishlistState ? "accent" : "outline"}
              onClick={toggleWishlist}
              className="gap-2"
            >
              {wishlistState ? <BookmarkSolid className="h-4 w-4" /> : <BookmarkIcon className="h-4 w-4" />}
              {wishlistState ? "Wishlisted" : "Wishlist"}
            </Button>

            {game.website && (
              <Button variant="ghost" asChild>
                <a href={game.website} target="_blank" rel="noopener noreferrer">
                  <GlobeAltIcon className="h-4 w-4" />
                  Website
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 opacity-60" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <Card>
            <CardHeader><CardTitle>About</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{game.description}</p>
            </CardContent>
          </Card>

          {/* Screenshots */}
          {game.screenshots.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Screenshots</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {game.screenshots.map((screenshot) => (
                    <button
                      key={screenshot.id}
                      onClick={() => setSelectedScreenshot(screenshot.url)}
                      className="relative aspect-video rounded-lg overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all"
                    >
                      <Image src={screenshot.url} alt={screenshot.caption ?? ""} fill className="object-cover hover:scale-105 transition-transform" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Reviews ({game._count?.reviews})
                {isAuthenticated && !hasReviewed && (
                  <Button size="sm" variant="outline" onClick={() => setShowReviewForm(!showReviewForm)}>
                    Write a review
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showReviewForm && (
                <div className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5">
                  <h4 className="font-semibold mb-3">Your Review</h4>
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-xs text-muted-foreground mr-2">Rating:</span>
                    {[1,2,3,4,5,6,7,8,9,10].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setReviewRating(score)}
                        className={`w-6 h-6 rounded text-xs font-bold transition-all ${
                          score <= reviewRating
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:bg-primary/20"
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                    {reviewRating > 0 && (
                      <button type="button" onClick={() => setReviewRating(0)} className="ml-1 text-xs text-muted-foreground hover:text-destructive">✕</button>
                    )}
                  </div>
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Share your thoughts about this game... (min. 10 characters)"
                    className="w-full min-h-[120px] rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <Button variant="ghost" size="sm" onClick={() => { setShowReviewForm(false); setReviewContent(""); setReviewRating(0); }} disabled={submittingReview}>Cancel</Button>
                    <Button variant="gradient" size="sm" onClick={submitReview} loading={submittingReview} disabled={submittingReview || reviewContent.trim().length < 10}>
                      Publish review
                    </Button>
                  </div>
                </div>
              )}

              {localReviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <StarSolid className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {localReviews.map((review) => (
                    <div key={review.id} className="flex gap-4">
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage src={review.user.image ?? undefined} />
                        <AvatarFallback className="text-xs">{getInitials(review.user.name ?? "U")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-sm">{review.user.name}</span>
                          <div className="flex">
                            {[1,2,3,4,5].map((s) => (
                              <StarSolid key={s} className={`h-3.5 w-3.5 ${s <= Math.round(review.rating / 2) ? "text-yellow-400" : "text-muted-foreground/30"}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{formatRelativeDate(review.createdAt)}</span>
                        </div>
                        {review.spoiler ? (
                          <p className="text-sm text-muted-foreground blur-sm hover:blur-none transition-all cursor-pointer" title="Click to reveal spoiler">{review.content}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3">
                          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                            <HeartIcon className="h-3.5 w-3.5" />
                            {review._count.likes}
                          </button>
                          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                            <ChatBubbleLeftIcon className="h-3.5 w-3.5" />
                            {review._count.comments}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Your rating */}
          <Card>
            <CardHeader><CardTitle className="text-base">Your Rating</CardTitle></CardHeader>
            <CardContent>
              <div className="flex justify-center gap-1 mb-3">
                {[1,2,3,4,5,6,7,8,9,10].map((score) => (
                  <button
                    key={score}
                    onMouseEnter={() => setHoverScore(score)}
                    onMouseLeave={() => setHoverScore(0)}
                    onClick={() => submitRating(score)}
                    className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                      score <= displayRating
                        ? "bg-primary text-primary-foreground scale-110"
                        : "bg-secondary text-muted-foreground hover:bg-primary/20"
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                {displayRating ? `Your score: ${displayRating}/10` : "Click to rate"}
              </p>
            </CardContent>
          </Card>

          {/* Game info */}
          <Card>
            <CardHeader><CardTitle className="text-base">Game Info</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {game.releaseDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Release date</span>
                  <span className="font-medium">{formatDate(game.releaseDate)}</span>
                </div>
              )}
              {game.developer && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Developer</span>
                  <span className="font-medium">{game.developer}</span>
                </div>
              )}
              {game.publisher && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Publisher</span>
                  <span className="font-medium">{game.publisher}</span>
                </div>
              )}
              {game.price != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">{formatPrice(game.price)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">In libraries</span>
                <span className="font-medium">{game._count?.libraryEntries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wishlisted</span>
                <span className="font-medium">{game._count?.wishlists}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reviews</span>
                <span className="font-medium">{game._count?.reviews}</span>
              </div>
            </CardContent>
          </Card>

          {/* Platforms */}
          {game.platforms.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Platforms</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {game.platforms.map(({ platform }) => (
                    <Badge key={platform.id} variant="secondary">{platform.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {game.tags.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Tags</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {game.tags.map(({ tag }) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">{tag.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Similar games */}
      {similarGames.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Similar Games</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {similarGames.map((game) => (
              <GameCard key={game.id} game={game} variant="grid" />
            ))}
          </div>
        </div>
      )}

      {/* Screenshot lightbox */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[80vh] rounded-xl overflow-hidden">
            <Image src={selectedScreenshot} alt="Screenshot" fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
