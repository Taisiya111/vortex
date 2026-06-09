"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderPlusIcon,
  FolderOpenIcon,
  LockClosedIcon,
  GlobeAltIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeDate } from "@/lib/utils";

interface CollectionGame {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  developer: string | null;
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
    game: CollectionGame;
  }[];
  _count: { items: number };
}

interface CollectionsClientProps {
  collections: Collection[];
}

interface NewCollectionForm {
  name: string;
  description: string;
  isPublic: boolean;
}

export function CollectionsClient({ collections: initialCollections }: CollectionsClientProps) {
  const { toast } = useToast();
  const [collections, setCollections] = useState(initialCollections);
  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<NewCollectionForm>({
    name: "",
    description: "",
    isPublic: true,
  });

  const filtered = collections.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  async function handleCreate() {
    if (!form.name.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          public: form.isPublic,
        }),
      });
      if (!res.ok) throw new Error("Failed to create collection");
      const newCollection = await res.json();
      setCollections((prev) => [newCollection, ...prev]);
      setIsCreateOpen(false);
      setForm({ name: "", description: "", isPublic: true });
      toast({
        title: "Collection created",
        description: `"${form.name}" has been created.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to create collection.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setCollections((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Collection deleted", description: `"${name}" was deleted.` });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete collection.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-black">My Collections</h2>
          <p className="text-muted-foreground mt-1">
            {collections.length} collection{collections.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="gradient" onClick={() => setIsCreateOpen(true)}>
          <FolderPlusIcon className="h-4 w-4" />
          New Collection
        </Button>
      </motion.div>

      {/* Search */}
      {collections.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-xs"
        >
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search collections..."
            className="pl-9"
          />
        </motion.div>
      )}

      {/* Collections Grid */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 && !query ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <FolderOpenIcon className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No collections yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Create your first collection to organize your games
            </p>
            <Button variant="gradient" onClick={() => setIsCreateOpen(true)}>
              <PlusIcon className="h-4 w-4" />
              Create First Collection
            </Button>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <MagnifyingGlassIcon className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No collections match your search</p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((collection, i) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.06, 0.5) }}
              >
                <Card
                  hover
                  className={`overflow-hidden group relative ${
                    isDeleting === collection.id ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {/* Cover mosaic */}
                  <div className="grid grid-cols-2 h-36 relative">
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
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-violet-900 to-indigo-900" />
                        )}
                      </div>
                    ))}
                    {Array.from({
                      length: Math.max(0, 4 - collection.items.length),
                    }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="bg-secondary/40" />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Actions menu */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="glass" size="icon-sm">
                            <EllipsisHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/collections/${collection.id}`}>
                              <FolderOpenIcon className="h-4 w-4" />
                              Open
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/collections/${collection.id}/edit`}>
                              <PencilIcon className="h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(collection.id, collection.name)}
                          >
                            <TrashIcon className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/collections/${collection.id}`}
                          className="font-semibold line-clamp-1 hover:text-primary transition-colors block"
                        >
                          {collection.name}
                        </Link>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {collection.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`flex-shrink-0 text-xs gap-1 ${
                          collection.public
                            ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10"
                            : "text-slate-400 border-slate-400/20 bg-slate-400/10"
                        }`}
                      >
                        {collection.public ? (
                          <GlobeAltIcon className="h-3 w-3" />
                        ) : (
                          <LockClosedIcon className="h-3 w-3" />
                        )}
                        {collection.public ? "Public" : "Private"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                      <span className="font-medium">
                        {collection._count.items} game
                        {collection._count.items !== 1 ? "s" : ""}
                      </span>
                      <span>Updated {formatRelativeDate(collection.updatedAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Create new card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(filtered.length * 0.06 + 0.1, 0.6) }}
            >
              <button
                onClick={() => setIsCreateOpen(true)}
                className="w-full h-full min-h-[220px] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary group"
              >
                <div className="w-12 h-12 rounded-xl border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlusIcon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">New Collection</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Collection Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlusIcon className="h-5 w-5 text-violet-400" />
              Create New Collection
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="collection-name">Name *</Label>
              <Input
                id="collection-name"
                placeholder="e.g. My Favorite RPGs"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="collection-desc">Description</Label>
              <Textarea
                id="collection-desc"
                placeholder="What's this collection about?"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border">
              <div className="flex items-center gap-2">
                {form.isPublic ? (
                  <GlobeAltIcon className="h-4 w-4 text-emerald-400" />
                ) : (
                  <LockClosedIcon className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {form.isPublic ? "Public" : "Private"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {form.isPublic
                      ? "Anyone can see this collection"
                      : "Only you can see this collection"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.isPublic}
                onClick={() => setForm((f) => ({ ...f, isPublic: !f.isPublic }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                  form.isPublic ? "bg-primary" : "bg-secondary"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.isPublic ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleCreate}
              disabled={!form.name.trim() || isSubmitting}
              loading={isSubmitting}
            >
              Create Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
