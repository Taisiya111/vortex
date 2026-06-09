"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  RocketLaunchIcon,
  UserCircleIcon,
  BookOpenIcon,
  StarIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  LifebuoyIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedSection } from "@/components/marketing/animated-section";

const categories = [
  {
    icon: RocketLaunchIcon,
    title: "Getting Started",
    color: "from-violet-500 to-indigo-500",
    questions: [
      {
        q: "How do I create a Vortex account?",
        a: "Click 'Sign up' in the top navigation and register with your email, or use one-click sign-in with Google or GitHub. It takes less than a minute and it's completely free.",
      },
      {
        q: "How do I add my first game to my library?",
        a: "Head to the Games catalog, find a title, and click 'Add to Library'. From there you can set your status (Playing, Completed, Dropped, Wishlist) and start logging your progress.",
      },
      {
        q: "Can I import my Steam library?",
        a: "Steam import is on our roadmap! For now, you can add games manually from our catalog of 50,000+ PC titles — searching by name makes it quick.",
      },
    ],
  },
  {
    icon: UserCircleIcon,
    title: "Account & Profile",
    color: "from-blue-500 to-cyan-500",
    questions: [
      {
        q: "How do I change my username or display name?",
        a: "Go to Settings → Profile to update your display name, username, bio, avatar, and banner image at any time.",
      },
      {
        q: "How do I make my profile private?",
        a: "Visit Settings → Privacy to control who can see your library, activity, and reviews — choose between public, followers-only, or fully private.",
      },
      {
        q: "How do I delete my account?",
        a: "You can permanently delete your account and associated data from Settings → Account → Delete Account. This action can't be undone, so we'll ask you to confirm first.",
      },
    ],
  },
  {
    icon: BookOpenIcon,
    title: "Library & Collections",
    color: "from-emerald-500 to-teal-500",
    questions: [
      {
        q: "What's the difference between a library entry and a collection?",
        a: "Your library tracks every game you've played or want to play with a status and progress. Collections are themed, curated lists you build yourself — like 'Best Co-op Games' — that you can keep private or share publicly.",
      },
      {
        q: "Can I track hours played and completion dates?",
        a: "Yes — when you add or update a library entry, you can log hours played, start and finish dates, your personal notes, and milestone markers.",
      },
      {
        q: "How do I share a collection with friends?",
        a: "Set your collection's visibility to 'Public' and copy its share link from the collection page — anyone with the link (or who finds it via your profile) can view it.",
      },
    ],
  },
  {
    icon: StarIcon,
    title: "Reviews & Ratings",
    color: "from-amber-500 to-orange-500",
    questions: [
      {
        q: "How does the rating scale work?",
        a: "Vortex uses a 10-point rating scale so you can express nuance — from a rough '4' to a perfect '10'. Ratings power each game's aggregate score across the community.",
      },
      {
        q: "Can I mark a review as containing spoilers?",
        a: "Yes — toggle the spoiler warning when writing your review, and it will be blurred for other users until they choose to reveal it.",
      },
      {
        q: "Are my reviews public by default?",
        a: "Yes, reviews are public so the community can benefit from your perspective. You can edit or delete any review you've written at any time.",
      },
    ],
  },
  {
    icon: ShieldCheckIcon,
    title: "Privacy & Security",
    color: "from-pink-500 to-rose-500",
    questions: [
      {
        q: "How do I enable two-factor authentication?",
        a: "Go to Settings → Security to set up two-factor authentication using an authenticator app for an extra layer of account protection.",
      },
      {
        q: "What data does Vortex collect about me?",
        a: "We collect what's needed to run the platform — account info, your library and activity, and basic technical data. See our Privacy Policy for the full breakdown and your rights.",
      },
      {
        q: "How do I report abusive content or behavior?",
        a: "Use the 'Report' option available on profiles, reviews, and comments, or contact our support team directly — we review every report.",
      },
    ],
  },
  {
    icon: CreditCardIcon,
    title: "Billing",
    color: "from-purple-500 to-pink-500",
    questions: [
      {
        q: "Is Vortex free to use?",
        a: "Yes — Vortex's core experience is, and will always be, free. Build your library, write reviews, create collections, and join the community at no cost.",
      },
      {
        q: "Will Vortex ever introduce paid plans?",
        a: "If we ever introduce optional premium features, they'll be clearly marked, fairly priced, and never required to use the core platform. We'll always tell you well in advance.",
      },
      {
        q: "Who do I contact about a billing question?",
        a: "Reach out via our Contact page — even though we don't currently charge for anything, our support team is happy to help with any account questions.",
      },
    ],
  },
];

function QuestionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-secondary/20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-secondary/30 transition-colors duration-200"
      >
        <span className="text-sm font-medium text-foreground">{q}</span>
        <ChevronDownIcon className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HelpContent() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        questions: cat.questions.filter(
          (item) => item.q.toLowerCase().includes(term) || item.a.toLowerCase().includes(term)
        ),
      }))
      .filter((cat) => cat.questions.length > 0 || cat.title.toLowerCase().includes(term));
  }, [search]);

  return (
    <div className="overflow-hidden">
      <section className="relative pt-32 pb-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-background to-indigo-950/40" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/10 rounded-full blur-3xl animate-float" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <Badge variant="default" className="mb-6 px-4 py-1.5 text-sm glass">
              <LifebuoyIcon className="h-3.5 w-3.5 mr-1.5" />
              Help Center
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6">
              How can we <span className="gradient-text">help?</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Search our help topics or browse by category — and if you can't find what you need, our
              team is just a message away.
            </p>
            <div className="relative max-w-lg mx-auto">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for help topics, e.g. 'reviews' or 'privacy'"
                leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
                className="h-12"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="pb-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {filtered.length === 0 && (
            <AnimatedSection>
              <div className="text-center py-16 rounded-2xl border border-border bg-card">
                <p className="text-muted-foreground mb-4">
                  No help topics matched "{search}". Try a different search, or get in touch directly.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/contact">Contact support</Link>
                </Button>
              </div>
            </AnimatedSection>
          )}

          {filtered.map((cat, i) => (
            <AnimatedSection key={cat.title} delay={i * 0.05}>
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center flex-shrink-0`}>
                    <cat.icon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">{cat.title}</h2>
                </div>
                {cat.questions.length > 0 ? (
                  <div className="space-y-3">
                    {cat.questions.map((item) => (
                      <QuestionItem key={item.q} q={item.q} a={item.a} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No matching questions in this category — try{" "}
                    <Link href="/contact" className="text-primary hover:underline">contacting us</Link> directly.
                  </p>
                )}
              </div>
            </AnimatedSection>
          ))}

          <AnimatedSection>
            <div className="glass rounded-2xl p-8 sm:p-10 text-center">
              <h3 className="text-xl font-bold mb-2">Still need help?</h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Can't find the answer you're looking for? Our support team is happy to dig in with you.
              </p>
              <Button variant="gradient" size="lg" asChild className="group">
                <Link href="/contact">
                  Contact support
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
