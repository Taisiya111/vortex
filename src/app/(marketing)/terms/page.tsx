import React from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { LegalAnimated } from "@/components/marketing/legal-animated";

export const metadata = {
  title: "Terms of Service | Vortex",
  description:
    "The terms and conditions that govern your use of Vortex, the platform for tracking, reviewing, and discovering PC games.",
};

const LAST_UPDATED = "June 1, 2026";

export default function TermsPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-background to-violet-950/30" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <LegalAnimated>
            <Badge variant="default" className="mb-6 px-4 py-1.5 text-sm glass">
              <DocumentTextIcon className="h-3.5 w-3.5 mr-1.5" />
              The fine print, made readable
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Terms of <span className="gradient-text">Service</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              These terms outline the rules of the road for using Vortex. By creating an account or using
              the platform, you agree to them.
            </p>
            <p className="text-sm text-muted-foreground mt-4">Last updated: {LAST_UPDATED}</p>
          </LegalAnimated>
        </div>
      </section>

      <section className="pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <LegalAnimated>
            <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 space-y-10 text-muted-foreground leading-relaxed">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
                <p>
                  By accessing or using Vortex ("the Service," "we," "us," or "our"), you agree to be bound by
                  these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do
                  not use the Service. We may update these terms periodically, and continued use after changes
                  take effect constitutes your acceptance of the revised terms.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">2. Account Registration</h2>
                <p>
                  To access most features of Vortex, you'll need to create an account using your email address
                  or by signing in through Google or GitHub. You agree to provide accurate information, keep
                  your credentials secure, and notify us promptly of any unauthorized use of your account. You
                  must be at least 13 years old (or the minimum age of digital consent in your country) to
                  create an account. You are responsible for all activity that occurs under your account.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">3. User Conduct &amp; Acceptable Use</h2>
                <p>To keep Vortex a welcoming place for gamers everywhere, you agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Post content that is illegal, hateful, harassing, sexually explicit, or that infringes on others' rights</li>
                  <li>Impersonate another person, brand, or entity, or misrepresent your affiliation</li>
                  <li>Spam, manipulate ratings, or use bots and automated tools to interact with the Service</li>
                  <li>Attempt to gain unauthorized access to other accounts, our systems, or non-public areas of the Service</li>
                  <li>Reverse-engineer, scrape at scale, or interfere with the normal operation of the Service</li>
                  <li>Upload malware or any code intended to disrupt or damage the Service or its users</li>
                </ul>
                <p>Violating these rules may result in content removal, suspension, or permanent termination of your account.</p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">4. User-Generated Content &amp; Licensing</h2>
                <p>
                  You retain ownership of the reviews, ratings, lists, comments, collections, avatars, and any
                  other content you create or upload ("User Content"). By posting User Content on Vortex, you
                  grant us a worldwide, non-exclusive, royalty-free license to host, store, reproduce, display,
                  and distribute that content as necessary to operate and promote the Service — for example,
                  showing your review on a game's page or featuring a popular collection.
                </p>
                <p>
                  You're responsible for ensuring you have the rights to anything you post, and you agree not
                  to upload content that infringes on the intellectual property or other rights of any third
                  party.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">5. Intellectual Property</h2>
                <p>
                  The Vortex name, logo, branding, interface design, and underlying software are owned by us
                  or our licensors and are protected by intellectual property laws. Game titles, cover art,
                  screenshots, and related metadata displayed on Vortex belong to their respective publishers,
                  developers, and rights holders, and are used for identification and informational purposes.
                  You may not copy, modify, or redistribute our branding or platform without prior written
                  permission.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">6. Subscription &amp; Pricing</h2>
                <p>
                  Vortex's core experience — building your library, writing reviews, creating collections, and
                  participating in the community — is, and will remain, free to use. Should we introduce
                  optional premium plans or features in the future, they will be clearly marked, priced
                  transparently, and never required to access the core platform. We'll always give you advance
                  notice before any changes that affect what's free.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">7. Termination</h2>
                <p>
                  You may delete your account at any time from your account settings. We may suspend or
                  terminate your access to the Service if you violate these Terms, create risk or legal
                  exposure for us, or for any other reason at our discretion, with or without notice. Upon
                  termination, your right to use the Service ceases immediately, though certain provisions of
                  these Terms (such as licensing of User Content already shared and limitations of liability)
                  will survive.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">8. Disclaimers &amp; Limitation of Liability</h2>
                <p>
                  Vortex is provided "as is" and "as available," without warranties of any kind, whether
                  express or implied. We do not guarantee that the Service will be uninterrupted, error-free,
                  or completely secure. To the fullest extent permitted by law, Vortex and its team shall not
                  be liable for any indirect, incidental, special, consequential, or punitive damages, or any
                  loss of data, revenue, or goodwill arising from your use of — or inability to use — the
                  Service.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">9. Governing Law</h2>
                <p>
                  These Terms are governed by and construed in accordance with applicable laws, without regard
                  to conflict-of-law principles. Any disputes arising from these Terms or your use of Vortex
                  will be resolved through good-faith negotiation first, and where necessary, in the
                  competent courts of the jurisdiction in which Vortex operates.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">10. Changes to These Terms</h2>
                <p>
                  We may revise these Terms from time to time to reflect changes to the Service, legal
                  requirements, or our practices. When we make material changes, we'll update the "Last
                  updated" date above and, where appropriate, notify you directly. Your continued use of
                  Vortex after changes become effective means you accept the updated Terms.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">11. Contact Us</h2>
                <p>
                  Questions about these Terms? Reach out anytime through our{" "}
                  <a href="/contact" className="text-primary hover:underline">Contact page</a> and our team
                  will get back to you.
                </p>
              </div>
            </div>
          </LegalAnimated>
        </div>
      </section>
    </div>
  );
}
