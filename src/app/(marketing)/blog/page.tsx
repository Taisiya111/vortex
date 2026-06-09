import React from "react";
import {
  SparklesIcon,
  EnvelopeIcon,
  ClockIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/marketing/animated-section";
import { NewsletterForm } from "@/components/marketing/newsletter-form";

export const metadata = {
  title: "Blog | Vortex",
  description:
    "Updates, deep dives, and stories from the Vortex team — coming soon. Subscribe to be the first to know when we publish.",
};

const posts = [
  {
    title: "How we catalog 50,000+ PC games (and counting)",
    excerpt: "A behind-the-scenes look at the data pipeline that keeps Vortex's game catalog accurate, deduplicated, and constantly growing.",
    category: "Engineering",
    date: "Coming soon",
    readTime: "6 min read",
  },
  {
    title: "The case for a Letterboxd for games",
    excerpt: "Why we think tracking and reflecting on what you play deserves the same care that film lovers get from Letterboxd — and how Vortex fits in.",
    category: "Product",
    date: "Coming soon",
    readTime: "5 min read",
  },
  {
    title: "Inside our design system: building a dark-first glassmorphism UI",
    excerpt: "From color tokens to glow effects — the design decisions behind Vortex's interface, and what we learned building it for gamers.",
    category: "Design",
    date: "Coming soon",
    readTime: "8 min read",
  },
  {
    title: "Community spotlight: the collections worth following",
    excerpt: "Every month we'll highlight standout collections from the community — themed lists that helped players find their next favorite game.",
    category: "Community",
    date: "Coming soon",
    readTime: "4 min read",
  },
  {
    title: "What we learned shipping social features to 200K+ gamers",
    excerpt: "Lessons from building follows, activity feeds, and comments for a community that cares deeply about how they're represented online.",
    category: "Product",
    date: "Coming soon",
    readTime: "7 min read",
  },
  {
    title: "A roadmap preview: what's next for Vortex",
    excerpt: "Steam library imports, deeper analytics, mobile apps — a look at what we're exploring next and how you can help shape it.",
    category: "Announcements",
    date: "Coming soon",
    readTime: "5 min read",
  },
];

const categoryColors: Record<string, "default" | "secondary" | "success" | "info" | "accent"> = {
  Engineering: "info",
  Product: "default",
  Design: "accent",
  Community: "success",
  Announcements: "secondary",
};

export default function BlogPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-background to-indigo-950/40" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/10 rounded-full blur-3xl animate-float" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <Badge variant="default" className="mb-6 px-4 py-1.5 text-sm glass">
              <SparklesIcon className="h-3.5 w-3.5 mr-1.5" />
              Coming soon
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6">
              The Vortex <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're cooking up stories about the games we love, the platform we're building, and the
              community that makes it all worthwhile. First posts are landing soon — subscribe so you
              don't miss them.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-16">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <EnvelopeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-lg mb-1">Subscribe for updates</h3>
                <p className="text-sm text-muted-foreground">
                  Get an email when we publish new posts. No spam — just the occasional good read.
                </p>
              </div>
              <NewsletterForm />
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <AnimatedSection key={post.title} delay={i * 0.05}>
                <div className="group h-full p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant={categoryColors[post.category] ?? "secondary"}>{post.category}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {post.readTime}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-200">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{post.excerpt}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {post.date}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
