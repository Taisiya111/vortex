import React from "react";
import Link from "next/link";
import {
  RocketLaunchIcon,
  HeartIcon,
  GlobeAltIcon,
  LightBulbIcon,
  MapPinIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/marketing/animated-section";

export const metadata = {
  title: "Careers | Vortex",
  description:
    "Join the team building the home PC gaming deserves. See open roles at Vortex and learn what it's like to work here.",
};

const values = [
  {
    icon: HeartIcon,
    title: "Player-obsessed",
    description: "We use the product we build, every day. Decisions start with 'what would actually help a player?'",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: GlobeAltIcon,
    title: "Remote-friendly",
    description: "Our team is distributed across time zones. We hire great people wherever they are.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: LightBulbIcon,
    title: "Bias for shipping",
    description: "We'd rather learn from something real in the world than debate a perfect plan forever.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: RocketLaunchIcon,
    title: "Ownership, not oversight",
    description: "Small team, big trust. You'll own outcomes end-to-end, not just tasks on a board.",
    color: "from-violet-500 to-indigo-500",
  },
];

const openings = [
  {
    role: "Senior Full-Stack Engineer",
    location: "Remote (Worldwide)",
    type: "Full-time",
    team: "Engineering",
  },
  {
    role: "Product Designer",
    location: "Remote (EU/US overlap)",
    type: "Full-time",
    team: "Design",
  },
  {
    role: "Community Manager",
    location: "Remote (Worldwide)",
    type: "Part-time",
    team: "Community",
  },
];

export default function CareersPage() {
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
              <RocketLaunchIcon className="h-3.5 w-3.5 mr-1.5" />
              Join the team
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6">
              Build the future of <span className="gradient-text">game tracking</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're a small, remote-friendly team of gamers, engineers, and designers on a mission to give
              PC players the platform they deserve. If that sounds like your kind of challenge, we'd love
              to meet you.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Our Culture</Badge>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              How we <span className="gradient-text">work and grow</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              We're small by design — every hire meaningfully shapes what Vortex becomes.
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <AnimatedSection key={value.title} delay={i * 0.08}>
                <div className="group h-full p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Open Roles</Badge>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Current <span className="gradient-text">openings</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              We're a lean team, so we hire selectively — but we're always glad to hear from people who
              love what we're building.
            </p>
          </AnimatedSection>

          <div className="space-y-4 mb-12">
            {openings.map((job, i) => (
              <AnimatedSection key={job.role} delay={i * 0.08}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{job.role}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <MapPinIcon className="h-3 w-3" />
                        {job.location}
                      </Badge>
                      <Badge variant="info" className="gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {job.type}
                      </Badge>
                      <Badge variant="outline">{job.team}</Badge>
                    </div>
                  </div>
                  <Button variant="gradient" asChild className="group flex-shrink-0">
                    <Link href="/contact">
                      Apply
                      <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection>
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <h3 className="text-xl font-bold mb-2">Don't see your role?</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                We're always open to meeting talented people who care about gaming and great products.
                Reach out and tell us how you'd like to contribute — we read every message.
              </p>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Get in touch</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
