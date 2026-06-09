import React from "react";
import { CakeIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { LegalAnimated } from "@/components/marketing/legal-animated";

export const metadata = {
  title: "Cookie Policy | Vortex",
  description:
    "Understand what cookies Vortex uses, why we use them, and how you can manage your cookie preferences.",
};

const LAST_UPDATED = "June 1, 2026";

const cookieTypes = [
  {
    name: "Essential",
    badge: "Always active",
    description:
      "Required for core functionality like staying signed in, remembering security tokens, and protecting against fraud. The Service can't function properly without these.",
  },
  {
    name: "Analytics",
    badge: "Optional",
    description:
      "Help us understand how people use Vortex — which pages are popular, how features are discovered, and where users run into friction — so we can prioritize improvements.",
  },
  {
    name: "Preferences",
    badge: "Optional",
    description:
      "Remember choices you've made, such as your theme, layout density, default library view, and language, so Vortex feels like home every time you return.",
  },
];

export default function CookiesPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-background to-violet-950/30" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <LegalAnimated>
            <Badge variant="default" className="mb-6 px-4 py-1.5 text-sm glass">
              <CakeIcon className="h-3.5 w-3.5 mr-1.5" />
              Small files, full transparency
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Cookie <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Here's a plain-language breakdown of the cookies Vortex uses, why we use them, and how
              you can manage your preferences.
            </p>
            <p className="text-sm text-muted-foreground mt-4">Last updated: {LAST_UPDATED}</p>
          </LegalAnimated>
        </div>
      </section>

      <section className="pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <LegalAnimated>
            <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 space-y-10 text-muted-foreground leading-relaxed">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">1. What Are Cookies?</h2>
                <p>
                  Cookies are small text files stored on your device when you visit a website. They allow the
                  site to recognize your browser, remember information about your visit, and provide a
                  smoother, more personalized experience the next time you return. We also use similar
                  technologies, like local storage, that work in much the same way.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">2. How We Use Cookies</h2>
                <p>
                  Vortex uses cookies to keep you signed in between sessions, remember your interface
                  preferences, protect your account from fraud and abuse, and understand — in aggregate — how
                  people use the platform so we can make it better. We do not use cookies to build advertising
                  profiles or sell your data to third parties.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">3. Types of Cookies We Use</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose">
                  {cookieTypes.map((c) => (
                    <div key={c.name} className="rounded-xl border border-border bg-secondary/30 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">{c.name}</h3>
                        <Badge variant={c.badge === "Always active" ? "success" : "secondary"} className="text-[10px]">
                          {c.badge}
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">4. Managing Your Cookie Preferences</h2>
                <p>
                  You can control non-essential cookies at any time. Most browsers let you block or delete
                  cookies through their settings menu, and you can adjust your analytics and preference cookie
                  choices from your Vortex account's privacy settings. Keep in mind that disabling essential
                  cookies may prevent core features — like staying signed in — from working correctly.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">5. Third-Party Cookies</h2>
                <p>
                  Some of the trusted services we rely on — such as our authentication providers (Google and
                  GitHub OAuth), our image hosting provider (Cloudinary), and analytics tooling — may set
                  their own cookies when you interact with features that depend on them. These third parties
                  have their own privacy and cookie practices, which we encourage you to review.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">6. Contact Us</h2>
                <p>
                  Have questions about how we use cookies? Get in touch through our{" "}
                  <a href="/contact" className="text-primary hover:underline">Contact page</a> — we're glad to
                  walk you through it.
                </p>
              </div>
            </div>
          </LegalAnimated>
        </div>
      </section>
    </div>
  );
}
