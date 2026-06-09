import React from "react";
import Link from "next/link";
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  HashtagIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/marketing/animated-section";

export const metadata = {
  title: "Community | Vortex",
  description:
    "Join the Vortex community on Discord, X, GitHub, and Reddit — connect with gamers, share collections, and shape the platform's future.",
};

const stats = [
  { value: "200K+", label: "Active members" },
  { value: "45K+", label: "Discussions started" },
  { value: "1.2M+", label: "Reviews shared" },
  { value: "12K+", label: "Collections published" },
];

const platforms = [
  {
    icon: ChatBubbleLeftRightIcon,
    name: "Discord",
    description: "Chat in real time, get help, share your library, and join community game nights.",
    members: "85K+ members",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: HashtagIcon,
    name: "X (Twitter)",
    description: "Follow for product updates, community highlights, and the occasional gaming hot take.",
    members: "60K+ followers",
    color: "from-slate-500 to-slate-700",
  },
  {
    icon: CodeBracketIcon,
    name: "GitHub",
    description: "Track our public roadmap, report bugs, and contribute to open-source tools we maintain.",
    members: "3K+ stars",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: UserGroupIcon,
    name: "Reddit",
    description: "Join r/Vortex for deep discussions, collection showcases, and community polls.",
    members: "28K+ members",
    color: "from-orange-500 to-red-500",
  },
];

const guidelines = [
  "Be respectful — disagree with opinions, not people.",
  "No harassment, hate speech, or discrimination of any kind.",
  "Keep spoilers tagged so everyone gets to enjoy games at their own pace.",
  "No spam, self-promotion floods, or rating manipulation.",
  "Report problems instead of escalating — our mods (and team) are here to help.",
];

export default function CommunityPage() {
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
              <UserGroupIcon className="h-3.5 w-3.5 mr-1.5" />
              200K+ gamers and counting
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6">
              Join the <span className="gradient-text">Vortex community</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gaming is better together. Beyond the platform, our community lives across Discord, X,
              GitHub, and Reddit — come talk games, share your library, and help shape what we build next.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              {stats.map(({ value, label }) => (
                <div key={label} className="glass rounded-xl p-5 text-center">
                  <div className="text-2xl sm:text-3xl font-black gradient-text">{value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Find Us</Badge>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Where to <span className="gradient-text">join the conversation</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-20">
            {platforms.map((platform, i) => (
              <AnimatedSection key={platform.name} delay={i * 0.06}>
                <a
                  href="#"
                  className="group flex items-start gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <platform.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{platform.name}</h3>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">{platform.description}</p>
                    <Badge variant="secondary" className="text-[10px]">{platform.members}</Badge>
                  </div>
                </a>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection>
            <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 mb-20 max-w-3xl mx-auto">
              <Badge variant="secondary" className="mb-4">Community Guidelines</Badge>
              <h2 className="text-2xl font-bold mb-4">How we look out for each other</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our community is at its best when everyone feels welcome to share their honest take on the
                games they love (and the ones they don't). A few ground rules keep it that way:
              </p>
              <ul className="space-y-3">
                {guidelines.map((rule) => (
                  <li key={rule} className="flex items-start gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 to-indigo-950/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">
              Ready to <span className="gradient-text">join the conversation?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Create your free Vortex account, build your library, and dive into a community that loves
              PC gaming as much as you do.
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
