"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  PuzzlePieceIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";
import { ImageUpload } from "@/components/shared/image-upload";

interface OptionItem {
  id: string;
  name: string;
  slug: string;
}

interface NewGameClientProps {
  genres: OptionItem[];
  platforms: OptionItem[];
  categories: OptionItem[];
}

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1, "Slug is required").max(220),
  description: z.string().min(1, "Description is required"),
  shortDesc: z.string().max(300).optional().or(z.literal("")),
  releaseDate: z.string().optional().or(z.literal("")),
  developer: z.string().max(150).optional().or(z.literal("")),
  publisher: z.string().max(150).optional().or(z.literal("")),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  metacriticScore: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || (/^\d+$/.test(v) && Number(v) >= 0 && Number(v) <= 100), {
      message: "Must be a number between 0 and 100",
    }),
});

type FormData = z.infer<typeof schema>;

function ToggleChips({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: OptionItem[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {label.toLowerCase()} available.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const active = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onToggle(opt.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30 hover:bg-secondary/50"
                }`}
              >
                {active && <CheckIcon className="h-3 w-3 inline mr-1 -mt-0.5" />}
                {opt.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function NewGameClient({ genres, platforms, categories }: NewGameClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [genreIds, setGenreIds] = useState<string[]>([]);
  const [platformIds, setPlatformIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { slug: "" },
  });

  const title = watch("title", "");

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    register("title").onChange(e);
    if (!slugTouched) {
      setValue("slug", slugify(e.target.value));
    }
  }

  function toggle(setFn: React.Dispatch<React.SetStateAction<string[]>>, id: string) {
    setFn((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const payload = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        shortDesc: data.shortDesc || null,
        coverImage: coverImageUrl || null,
        bannerImage: bannerImageUrl || null,
        releaseDate: data.releaseDate || null,
        developer: data.developer || null,
        publisher: data.publisher || null,
        website: data.website || null,
        metacriticScore:
          data.metacriticScore === "" || data.metacriticScore === undefined
            ? null
            : Number(data.metacriticScore),
        featured,
        published,
        genreIds,
        platformIds,
        categoryIds,
      };

      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        toast({
          title: "Failed to create game",
          description: err.error ?? "Please check the form and try again.",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Game created", description: `"${data.title}" was added successfully.` });
      router.push("/admin/games");
      router.refresh();
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/admin/games">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-black flex items-center gap-2">
            <PuzzlePieceIcon className="h-7 w-7 text-violet-400" />
            Add Game
          </h2>
          <p className="text-muted-foreground mt-0.5">Create a new entry in the game library</p>
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Elden Ring"
                error={errors.title?.message}
                {...register("title")}
                onChange={handleTitleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="elden-ring"
                error={errors.slug?.message}
                {...register("slug")}
                onChange={(e) => {
                  setSlugTouched(true);
                  register("slug").onChange(e);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from title. Edit to customize the URL: /games/{watch("slug") || "..."}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDesc">Short Description</Label>
              <Input
                id="shortDesc"
                placeholder="A brief one-liner shown in lists"
                error={errors.shortDesc?.message}
                {...register("shortDesc")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Full game description..."
                rows={6}
                error={errors.description?.message}
                {...register("description")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ImageUpload
                label="Cover Image"
                value={coverImageUrl}
                onChange={setCoverImageUrl}
                uploadType="cover"
                aspectRatio="portrait"
              />
              <ImageUpload
                label="Banner Image"
                value={bannerImageUrl}
                onChange={setBannerImageUrl}
                uploadType="banner"
                aspectRatio="landscape"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="developer">Developer</Label>
                <Input id="developer" placeholder="FromSoftware" error={errors.developer?.message} {...register("developer")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input id="publisher" placeholder="Bandai Namco" error={errors.publisher?.message} {...register("publisher")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="releaseDate">Release Date</Label>
                <Input id="releaseDate" type="date" error={errors.releaseDate?.message} {...register("releaseDate")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metacriticScore">Metacritic Score</Label>
                <Input
                  id="metacriticScore"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0-100"
                  error={errors.metacriticScore?.message}
                  {...register("metacriticScore")}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://..." error={errors.website?.message} {...register("website")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Classification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ToggleChips label="Genres" options={genres} selected={genreIds} onToggle={(id) => toggle(setGenreIds, id)} />
            <ToggleChips label="Platforms" options={platforms} selected={platformIds} onToggle={(id) => toggle(setPlatformIds, id)} />
            <ToggleChips label="Categories" options={categories} selected={categoryIds} onToggle={(id) => toggle(setCategoryIds, id)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visibility</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setPublished((v) => !v)}
              className={`flex-1 flex items-center justify-between gap-3 p-4 rounded-xl border transition-all duration-200 ${
                published ? "border-emerald-500/30 bg-emerald-500/10" : "border-border hover:border-primary/30 hover:bg-secondary/50"
              }`}
            >
              <div className="text-left">
                <p className="text-sm font-semibold">Published</p>
                <p className="text-xs text-muted-foreground">Visible to all users</p>
              </div>
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${published ? "border-emerald-400 bg-emerald-400 text-white" : "border-border"}`}>
                {published && <CheckIcon className="h-3.5 w-3.5" />}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFeatured((v) => !v)}
              className={`flex-1 flex items-center justify-between gap-3 p-4 rounded-xl border transition-all duration-200 ${
                featured ? "border-amber-500/30 bg-amber-500/10" : "border-border hover:border-primary/30 hover:bg-secondary/50"
              }`}
            >
              <div className="text-left">
                <p className="text-sm font-semibold">Featured</p>
                <p className="text-xs text-muted-foreground">Show in featured spots</p>
              </div>
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${featured ? "border-amber-400 bg-amber-400 text-white" : "border-border"}`}>
                {featured && <CheckIcon className="h-3.5 w-3.5" />}
              </div>
            </button>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" asChild>
            <Link href="/admin/games">Cancel</Link>
          </Button>
          <Button type="submit" variant="gradient" loading={loading} disabled={loading || !title}>
            <PuzzlePieceIcon className="h-4 w-4" />
            Create Game
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
