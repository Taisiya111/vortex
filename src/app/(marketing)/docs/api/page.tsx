import React from "react";
import {
  CodeBracketIcon,
  KeyIcon,
  BoltIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/marketing/animated-section";

export const metadata = {
  title: "API Docs | Vortex",
  description:
    "A first look at the upcoming Vortex public API — authentication, example endpoints, request/response formats, and rate limits.",
};

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  POST: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  PATCH: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  DELETE: "bg-red-500/10 text-red-400 border border-red-500/20",
};

function MethodBadge({ method }: { method: string }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-mono font-bold ${methodColors[method] ?? "bg-secondary text-secondary-foreground"}`}>
      {method}
    </span>
  );
}

const endpoints = [
  {
    method: "GET",
    path: "/v1/games/{id}",
    description: "Retrieve detailed metadata for a single game, including platforms, genres, and aggregate rating.",
    request: `curl https://api.vortex.gg/v1/games/half-life-2 \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "id": "half-life-2",
  "title": "Half-Life 2",
  "releaseDate": "2004-11-16",
  "platforms": ["PC", "Mac", "Linux"],
  "genres": ["FPS", "Sci-Fi"],
  "averageRating": 9.4,
  "ratingCount": 84213
}`,
  },
  {
    method: "GET",
    path: "/v1/users/{username}/library",
    description: "List the games in a user's library, including status, rating, and hours played.",
    request: `curl https://api.vortex.gg/v1/users/alexm/library?status=playing \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "data": [
    {
      "gameId": "baldurs-gate-3",
      "status": "playing",
      "rating": null,
      "hoursPlayed": 42,
      "addedAt": "2026-05-12T18:32:00Z"
    }
  ],
  "page": 1,
  "totalPages": 3
}`,
  },
  {
    method: "POST",
    path: "/v1/library",
    description: "Add a game to the authenticated user's library with an initial status.",
    request: `curl -X POST https://api.vortex.gg/v1/library \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "gameId": "elden-ring", "status": "wishlist" }'`,
    response: `{
  "gameId": "elden-ring",
  "status": "wishlist",
  "addedAt": "2026-06-08T09:14:21Z"
}`,
  },
];

export default function ApiDocsPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-background to-indigo-950/40" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/10 rounded-full blur-3xl animate-float" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <Badge variant="info" className="mb-6 px-4 py-1.5 text-sm">
              <CodeBracketIcon className="h-3.5 w-3.5 mr-1.5" />
              Coming soon — public preview
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6">
              Vortex <span className="gradient-text">API</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're building a public API so developers can pull game data, sync libraries, and build
              tools on top of Vortex. The shape below previews what's coming — endpoints, auth, and
              formats are subject to change before general availability.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <AnimatedSection>
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <KeyIcon className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold">Authentication</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Vortex API will be authenticated via personal API keys, passed as Bearer tokens in the
                <code className="mx-1 px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-sm">Authorization</code>
                header. You'll be able to generate and revoke keys from your account settings once the API
                is publicly available.
              </p>
              <pre className="rounded-lg bg-secondary/50 border border-border p-4 overflow-x-auto">
                <code className="font-mono text-sm text-foreground">Authorization: Bearer YOUR_API_KEY</code>
              </pre>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.05}>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <CodeBracketIcon className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold">Example Endpoints</h2>
              </div>
              <div className="space-y-6">
                {endpoints.map((ep) => (
                  <div key={ep.path} className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="p-6 border-b border-border">
                      <div className="flex items-center gap-3 mb-2">
                        <MethodBadge method={ep.method} />
                        <code className="font-mono text-sm text-foreground">{ep.path}</code>
                      </div>
                      <p className="text-sm text-muted-foreground">{ep.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                      <div className="p-6">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Request</div>
                        <pre className="rounded-lg bg-secondary/50 border border-border p-4 overflow-x-auto">
                          <code className="font-mono text-xs leading-relaxed text-foreground whitespace-pre">{ep.request}</code>
                        </pre>
                      </div>
                      <div className="p-6">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Response</div>
                        <pre className="rounded-lg bg-secondary/50 border border-border p-4 overflow-x-auto">
                          <code className="font-mono text-xs leading-relaxed text-foreground whitespace-pre">{ep.response}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <BoltIcon className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold">Rate Limiting</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To keep the API fast and fair for everyone, requests will be rate-limited per API key.
                Planned limits are <strong className="text-foreground">100 requests per minute</strong> for
                standard keys, with generous burst allowances for read-heavy endpoints like game lookups.
                Every response will include rate-limit headers so you can build accordingly:
              </p>
              <pre className="rounded-lg bg-secondary/50 border border-border p-4 overflow-x-auto">
                <code className="font-mono text-xs leading-relaxed text-foreground whitespace-pre">{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1717843200`}</code>
              </pre>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <div className="glass rounded-2xl p-6 sm:p-8 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <ClockIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Want early access?</h3>
                <p className="text-sm text-muted-foreground">
                  We're prioritizing API access for developers building tools the community will love.
                  Reach out via our{" "}
                  <a href="/contact" className="text-primary hover:underline">Contact page</a> to tell us
                  what you'd like to build, and we'll let you know when the preview opens up.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
