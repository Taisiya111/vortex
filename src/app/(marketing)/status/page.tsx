import React from "react";
import {
  CheckCircleIcon,
  BellAlertIcon,
  GlobeAltIcon,
  ServerStackIcon,
  CircleStackIcon,
  KeyIcon,
  PhotoIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/marketing/animated-section";
import { NewsletterForm } from "@/components/marketing/newsletter-form";

export const metadata = {
  title: "System Status | Vortex",
  description:
    "Live status and uptime for Vortex's core services — web app, API, database, authentication, image CDN, and email.",
};

const services = [
  { icon: GlobeAltIcon, name: "Web App", description: "Marketing site & dashboard", uptime: "99.99%" },
  { icon: ServerStackIcon, name: "API", description: "Core platform API", uptime: "99.98%" },
  { icon: CircleStackIcon, name: "Database", description: "Primary data store", uptime: "99.99%" },
  { icon: KeyIcon, name: "Authentication", description: "Sign-in & OAuth providers", uptime: "100%" },
  { icon: PhotoIcon, name: "Image CDN", description: "Avatars, banners & screenshots", uptime: "99.97%" },
  { icon: EnvelopeIcon, name: "Email Service", description: "Notifications & verification emails", uptime: "99.96%" },
];

const stats = [
  { value: "99.98%", label: "30-day uptime" },
  { value: "212ms", label: "Avg. API response" },
  { value: "0", label: "Active incidents" },
  { value: "24/7", label: "Monitoring" },
];

export default function StatusPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-background to-violet-950/30" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-600/10 rounded-full blur-3xl animate-float" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <Badge variant="success" className="mb-6 px-4 py-1.5 text-sm">
              <BellAlertIcon className="h-3.5 w-3.5 mr-1.5" />
              Live status
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6">
              System <span className="gradient-text">Status</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Real-time status and historical uptime for every core Vortex service. Bookmark this page,
              or subscribe below to get notified the moment anything changes.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8 flex items-center gap-4 mb-12">
              <div className="relative flex-shrink-0">
                <div className="w-4 h-4 rounded-full bg-emerald-400" />
                <div className="absolute inset-0 w-4 h-4 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-400">All Systems Operational</h2>
                <p className="text-sm text-muted-foreground">
                  Every Vortex service is running normally. No incidents reported in the last 90 days.
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.05}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {stats.map(({ value, label }) => (
                <div key={label} className="glass rounded-xl p-5 text-center">
                  <div className="text-2xl sm:text-3xl font-black gradient-text">{value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <h2 className="text-xl font-bold mb-4">Service Components</h2>
            <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden mb-12">
              {services.map((service) => (
                <div key={service.name} className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <service.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-xs text-muted-foreground">{service.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden sm:inline text-xs text-muted-foreground">{service.uptime} uptime</span>
                    <Badge variant="success" className="gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Operational
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <BellAlertIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-lg mb-1">Subscribe to updates</h3>
                <p className="text-sm text-muted-foreground">
                  Get notified by email the moment we report an incident or scheduled maintenance.
                </p>
              </div>
              <NewsletterForm />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-10">
              <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
              Status checks run automatically every 60 seconds from multiple global regions.
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
