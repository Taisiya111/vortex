"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  SparklesIcon,
  RocketLaunchIcon,
  HeartIcon,
  LightBulbIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stats = [
  { value: "50K+", label: "Games Catalogued" },
  { value: "200K+", label: "Active Users" },
  { value: "1.2M+", label: "Reviews Written" },
  { value: "5M+", label: "Library Entries" },
];

const values = [
  {
    icon: HeartIcon,
    title: "Built by gamers",
    description: "Every feature starts with a question: 'would I actually want this in my own library?' We obsess over the details that matter to players.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: ShieldCheckIcon,
    title: "Respect your data",
    description: "Your library, your reviews, your history — it's yours. We're transparent about what we collect and we'll never sell your data to advertisers.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: UserGroupIcon,
    title: "Community first",
    description: "Gaming is better shared. We design for connection — following friends, discovering collections, and celebrating great taste together.",
    color: "from-violet-500 to-indigo-500",
  },
  {
    icon: LightBulbIcon,
    title: "Always shipping",
    description: "We move fast, listen closely, and iterate in the open. Vortex today is better than yesterday, and tomorrow's will be better still.",
    color: "from-amber-500 to-orange-500",
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

export function AboutContent() {
  return (
    <div className="overflow-hidden">
      <section className="relative pt-32 pb-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-background to-indigo-950/40" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="default" className="mb-6 px-4 py-1.5 text-sm glass">
              <SparklesIcon className="h-3.5 w-3.5 mr-1.5" />
              Our story
            </Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6"
          >
            We're building the home
            <br />
            <span className="gradient-text">PC gaming deserves.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Vortex started as a question: why doesn't PC gaming have a Letterboxd? A place to track,
            rate, and talk about the games that shape us — built specifically for the depth, breadth,
            and culture of PC gaming.
          </motion.p>
        </div>
      </section>

      <section className="py-24 border-y border-border bg-card/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">Our Mission</Badge>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                Help every player <span className="gradient-text">remember, reflect, and discover</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We believe the games you play are part of your story — the late nights with friends, the
                runs that broke your heart, the worlds you keep coming back to. Vortex exists to help you
                hold onto that story: log every game you've played, rate and review the ones that mattered,
                and build collections that reflect who you are as a player.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                And because gaming has always been social, Vortex is also a place to find your people —
                follow friends, see what they're playing, and discover your next favorite game through the
                taste of someone you trust.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map(({ value, label }) => (
                <div key={label} className="glass rounded-2xl p-6 text-center">
                  <div className="text-3xl font-black gradient-text mb-1">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-video rounded-2xl glass border border-white/10 flex items-center justify-center overflow-hidden">
                <RocketLaunchIcon className="h-20 w-20 text-primary/40" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Badge variant="secondary" className="mb-4">Where We Started</Badge>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                A side project that wouldn't <span className="gradient-text">leave us alone</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Vortex began as a spreadsheet — a messy, color-coded list of every PC game one of our
                founders had ever finished, abandoned, or fallen in love with. When friends started asking
                to see it, and then asking to add their own games to it, the idea clicked: PC gamers didn't
                have a real home for this.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                So we built one. Today Vortex catalogs over 50,000 PC games and is home to a growing
                community of players who track their libraries, write thoughtful reviews, and curate
                collections worth sharing — and we're just getting started.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-24 bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">What We Stand For</Badge>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              The values behind <span className="gradient-text">every decision</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              These aren't slogans on a wall — they're how our small team actually decides what to build next.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <AnimatedSection key={value.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">The Team</Badge>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              A small crew with a <span className="gradient-text">big love for games</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Vortex is built by a distributed team of designers, engineers, and lifelong players who
              believe games deserve a platform as thoughtful as the experiences they create.
            </p>
          </AnimatedSection>
          <AnimatedSection>
            <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 text-center">
              <div className="flex justify-center -space-x-3 mb-6">
                {["V", "O", "R", "T", "X"].map((letter, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 border-2 border-card flex items-center justify-center text-white text-sm font-bold"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                We're hands-on with the product we ship — every member of the Vortex team has a library on
                Vortex, writes reviews, and hangs out in the community. If you ever spot feedback from us in
                the wild, that's not a coincidence — it's how we stay close to the players we build for.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-32 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 to-indigo-950/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">
              Ready to start your <span className="gradient-text">gaming legacy?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Join 200K+ gamers already tracking their journey. Free forever, no credit card required.
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
