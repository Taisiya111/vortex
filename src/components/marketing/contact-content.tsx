"use client";

import React, { useState } from "react";
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AnimatedSection } from "@/components/marketing/animated-section";

const infoCards = [
  {
    icon: EnvelopeIcon,
    title: "Email us",
    description: "support@vortex.gg",
    color: "from-violet-500 to-indigo-500",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "Social",
    description: "@vortexgg on X, Discord, and Reddit",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: ClockIcon,
    title: "Response time",
    description: "We typically reply within 1–2 business days",
    color: "from-amber-500 to-orange-500",
  },
];

export function ContactContent() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // This is a UI demo only — there's no backend wired up yet, so we simulate
    // a network request and show a success toast instead of actually sending anything.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSubmitting(false);
    toast({
      title: "Message sent",
      description: "Thanks for reaching out! This is a demo form, but in production we'd get back to you within 1–2 business days.",
    });
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <div className="overflow-hidden">
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-background to-indigo-950/40" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/10 rounded-full blur-3xl animate-float" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <Badge variant="default" className="mb-6 px-4 py-1.5 text-sm glass">
              <EnvelopeIcon className="h-3.5 w-3.5 mr-1.5" />
              Get in touch
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6">
              Contact <span className="gradient-text">Us</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Questions, feedback, partnership ideas, or just want to say hi? Drop us a message — a real
              human reads every one.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <AnimatedSection className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="name" className="mb-2 block">Name</Label>
                  <Input
                    id="name"
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="mb-2 block">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="subject" className="mb-2 block">Subject</Label>
                <Input
                  id="subject"
                  required
                  placeholder="What's this about?"
                  value={form.subject}
                  onChange={(e) => update("subject", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="message" className="mb-2 block">Message</Label>
                <Textarea
                  id="message"
                  required
                  placeholder="Tell us more..."
                  className="min-h-[160px]"
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This form is a UI demo — submitting it won't send a real email yet, but it shows you
                exactly how it'll work once our messaging backend is wired up.
              </p>
              <Button type="submit" variant="gradient" size="lg" loading={submitting} className="w-full sm:w-auto group">
                {!submitting && <PaperAirplaneIcon className="h-4 w-4" />}
                {submitting ? "Sending..." : "Send message"}
              </Button>
            </form>
          </AnimatedSection>

          <AnimatedSection className="lg:col-span-2 space-y-4" delay={0.1}>
            {infoCards.map((card) => (
              <div key={card.title} className="p-6 rounded-2xl border border-border bg-card flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </div>
              </div>
            ))}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-2">Looking for help instead?</h3>
              <p className="text-sm text-muted-foreground">
                Check out our{" "}
                <a href="/help" className="text-primary hover:underline">Help Center</a> for answers to
                common questions about your account, library, reviews, and more.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
