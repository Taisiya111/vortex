import React from "react";
import {
  NewspaperIcon,
  PhotoIcon,
  SwatchIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/marketing/animated-section";

export const metadata = {
  title: "Press Kit | Vortex",
  description:
    "Brand assets, boilerplate copy, and media contact information for journalists and partners covering Vortex.",
};

const assets = [
  {
    icon: SwatchIcon,
    title: "Logo Pack",
    description: "Vortex wordmark and icon in light, dark, and monochrome variants. SVG and PNG formats.",
    color: "from-violet-500 to-indigo-500",
  },
  {
    icon: PhotoIcon,
    title: "Product Screenshots",
    description: "High-resolution screenshots of the Vortex interface — library, reviews, collections, and profiles.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: DocumentArrowDownIcon,
    title: "Brand Guidelines",
    description: "Our color palette, typography, voice and tone guide, and usage do's and don'ts.",
    color: "from-amber-500 to-orange-500",
  },
];

export default function PressPage() {
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
              <NewspaperIcon className="h-3.5 w-3.5 mr-1.5" />
              Press &amp; Media
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6">
              Vortex <span className="gradient-text">Press Kit</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything journalists, content creators, and partners need to cover Vortex accurately —
              brand assets, boilerplate copy, and a direct line to our team.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 mb-16">
              <Badge variant="secondary" className="mb-4">Boilerplate</Badge>
              <h2 className="text-2xl font-bold mb-4">About Vortex</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Vortex is a social platform for PC gamers to discover, track, and share their gaming
                journey. With a catalog of 50,000+ titles, members build personal libraries, write reviews,
                curate themed collections, and connect with a community of over 200,000 players who care
                deeply about the games they play. Think of it as the definitive home for PC gaming
                culture — part library, part diary, part community.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Vortex is free to use and built by a small, remote-first team of gamers and engineers who
                believe the games that shape us deserve a platform as thoughtful as they are.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection className="mb-16">
            <div className="text-center mb-10">
              <Badge variant="secondary" className="mb-4">Brand Assets</Badge>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
                Downloadable <span className="gradient-text">resources</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Use these assets when writing about Vortex. Please don't modify our logo or misrepresent
                our brand — see the guidelines pack for full usage rules.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {assets.map((asset, i) => (
                <AnimatedSection key={asset.title} delay={i * 0.08}>
                  <div className="group h-full p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${asset.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <asset.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{asset.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{asset.description}</p>
                    <Button variant="outline" className="gap-2">
                      <DocumentArrowDownIcon className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="glass rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <EnvelopeIcon className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-lg mb-1">Media Inquiries</h3>
                <p className="text-sm text-muted-foreground">
                  For interviews, quotes, partnership inquiries, or anything else press-related, reach our
                  team at{" "}
                  <a href="mailto:press@vortex.gg" className="text-primary hover:underline">press@vortex.gg</a>
                  {" "}— we typically respond within two business days.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
