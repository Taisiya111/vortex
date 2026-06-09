"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  SparklesIcon,
  BookOpenIcon,
  StarIcon,
  UserGroupIcon,
  ChartBarIcon,
  HeartIcon,
  FolderOpenIcon,
  BoltIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  PlayIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { value: "50K+", label: "Games Catalogued" },
  { value: "200K+", label: "Active Users" },
  { value: "1.2M+", label: "Reviews Written" },
  { value: "5M+", label: "Library Entries" },
];

const features = [
  {
    icon: BookOpenIcon,
    title: "Personal Game Library",
    description: "Track every game you've played, are playing, or plan to play. Log hours, write notes, and mark milestones.",
    color: "from-violet-500 to-indigo-500",
  },
  {
    icon: StarIcon,
    title: "Reviews & Ratings",
    description: "Write rich reviews with spoiler protection. Rate games on a 10-point scale. Like and comment on others' reviews.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: FolderOpenIcon,
    title: "Smart Collections",
    description: "Curate themed collections — RPGs, Horror, Co-op gems. Share with friends and discover others' curations.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: ChartBarIcon,
    title: "Detailed Analytics",
    description: "Visualize your gaming habits. See your most played genres, completion rates, and yearly statistics.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: HeartIcon,
    title: "Wishlist & Favorites",
    description: "Keep a prioritized wishlist. Mark your all-time favorites and revisit games that defined you.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: UserGroupIcon,
    title: "Social Community",
    description: "Follow friends, see what they're playing, share discoveries. Gaming is better together.",
    color: "from-purple-500 to-pink-500",
  },
];

const testimonials = [
  {
    quote: "Vortex completely replaced how I track games. It's like Letterboxd but built specifically for the depth of PC gaming culture.",
    author: "Alex M.",
    role: "Hardcore RPG Player",
    avatar: "A",
    rating: 5,
  },
  {
    quote: "The collection feature is insane. I've built my entire 'must-play indie horror' list and shared it with my Discord server.",
    author: "Sarah K.",
    role: "Horror Game Enthusiast",
    avatar: "S",
    rating: 5,
  },
  {
    quote: "Finally a platform that understands PC gaming. The filters, the data, the community — it's everything I wanted.",
    author: "Marcus T.",
    role: "Strategy & Sim Veteran",
    avatar: "M",
    rating: 5,
  },
];

const faqs = [
  {
    q: "Is Vortex free to use?",
    a: "Yes! Vortex is completely free for personal use. Create your account, build your library, and connect with the community at no cost.",
  },
  {
    q: "How do I add games to my library?",
    a: "Browse the games catalog and click 'Add to Library'. You can set your status (Playing, Completed, Dropped, etc.) and track hours played.",
  },
  {
    q: "Can I import my Steam library?",
    a: "We're working on Steam import! For now you can add games manually from our catalog of 50,000+ PC games.",
  },
  {
    q: "Are reviews public by default?",
    a: "Yes, reviews are public so the community can benefit from your insights. You can also mark them with spoiler warnings.",
  },
  {
    q: "How do collections work?",
    a: "Collections are themed lists of games you curate. Make them public to share, or keep them private. Drag-and-drop to reorder.",
  },
];

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-background to-indigo-950/40" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="default" className="mb-6 px-4 py-1.5 text-sm glass">
              <SparklesIcon className="h-3.5 w-3.5 mr-1.5" />
              The future of game tracking is here
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
          >
            Your Gaming
            <br />
            <span className="gradient-text">Journey, Tracked.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Discover new games, build your personal library, write reviews, create collections,
            and connect with a community that shares your passion for PC gaming.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button variant="gradient" size="xl" asChild className="group">
              <Link href="/register">
                Start for free
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link href="/games">
                <PlayIcon className="h-5 w-5" />
                Explore games
              </Link>
            </Button>
          </motion.div>

          {/* Hero stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map(({ value, label }) => (
              <div key={label} className="glass rounded-xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black gradient-text">{value}</div>
                <div className="text-xs text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Everything you need to
              <br />
              <span className="gradient-text">master your library</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Built by gamers, for gamers. Every feature is designed around how you actually play and think about games.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <AnimatedSection key={feature.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Get started in <span className="gradient-text">60 seconds</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create your account",
                description: "Sign up free with email, Google, or GitHub. No credit card required.",
                icon: UserGroupIcon,
              },
              {
                step: "02",
                title: "Build your library",
                description: "Add games from our catalog of 50K+ titles. Set your status and start tracking.",
                icon: BookOpenIcon,
              },
              {
                step: "03",
                title: "Share & discover",
                description: "Write reviews, build collections, and explore what others are playing.",
                icon: GlobeAltIcon,
              },
            ].map((step, i) => (
              <AnimatedSection key={step.step}>
                <div className="relative text-center">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                  )}
                  <div className="relative inline-flex w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-primary/20 items-center justify-center mb-6 mx-auto">
                    <step.icon className="h-10 w-10 text-primary" />
                    <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-primary text-xs font-bold text-white flex items-center justify-center">
                      {step.step.slice(-1)}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Loved by <span className="gradient-text">gamers worldwide</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.author}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarSolid key={j} className="h-4 w-4 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t.author}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 bg-card/30 border-y border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">FAQ</Badge>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
              Common <span className="gradient-text">questions</span>
            </h2>
          </AnimatedSection>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <AnimatedSection key={i}>
                <div className="p-6 rounded-xl border border-border bg-card">
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-2">{faq.q}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 to-indigo-950/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-muted-foreground">Join 200K+ gamers today</span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight mb-6">
              Start your gaming
              <br />
              <span className="gradient-text">legacy today</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Free forever. No credit card needed. Your entire gaming history, organized and beautiful.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gradient" size="xl" asChild className="group glow-primary">
                <Link href="/register">
                  Create free account
                  <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link href="/games">Browse games</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
