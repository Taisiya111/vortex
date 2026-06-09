import React from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { LegalAnimated } from "@/components/marketing/legal-animated";

export const metadata = {
  title: "Privacy Policy | Vortex",
  description:
    "Learn how Vortex collects, uses, and protects your personal information across our PC game tracking platform.",
};

const LAST_UPDATED = "June 1, 2026";

export default function PrivacyPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-background to-indigo-950/30" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <LegalAnimated>
            <Badge variant="default" className="mb-6 px-4 py-1.5 text-sm glass">
              <ShieldCheckIcon className="h-3.5 w-3.5 mr-1.5" />
              Your privacy matters
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We believe transparency builds trust. Here's exactly what data we collect, why we collect it,
              and how you stay in control.
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
                <h2 className="text-2xl font-bold text-foreground">1. Information We Collect</h2>
                <p>
                  When you create a Vortex account, we collect basic information such as your email address,
                  display name, username, and password (securely hashed — we never store plaintext passwords).
                  If you sign in with Google or GitHub, we receive your name, email, and profile picture from
                  that provider.
                </p>
                <p>
                  As you use Vortex, we collect information you choose to share: games you add to your library,
                  ratings and reviews you write, collections you build, profile bios, avatars and banners you
                  upload, and your activity within the community (likes, comments, follows).
                </p>
                <p>
                  We also automatically collect certain technical data, including your IP address, browser
                  type, device information, pages visited, and timestamps of your interactions, to help us
                  operate and improve the platform.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve the Vortex platform and its features</li>
                  <li>Personalize your experience, including recommendations and your activity feed</li>
                  <li>Enable social features such as following other users and commenting on reviews</li>
                  <li>Send important account notifications, security alerts, and (if you opt in) product updates</li>
                  <li>Monitor for abuse, fraud, and violations of our Terms of Service</li>
                  <li>Analyze aggregate usage trends to guide our roadmap</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">3. Cookies &amp; Tracking Technologies</h2>
                <p>
                  Vortex uses cookies and similar technologies to keep you signed in, remember your
                  preferences (such as theme and layout settings), and understand how the platform is used so
                  we can improve it. Some cookies are essential for the site to function; others are optional
                  and help us with analytics. You can manage your preferences at any time — see our{" "}
                  <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a> for full
                  details on the types of cookies we use and how to control them.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">4. Third-Party Services</h2>
                <p>
                  We rely on a small set of trusted third-party services to operate Vortex, each of which
                  processes a limited subset of your data on our behalf:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-foreground">Google &amp; GitHub OAuth</strong> — used to offer
                    one-click sign-in. These providers share your basic profile information with us when you
                    choose to authenticate through them.
                  </li>
                  <li>
                    <strong className="text-foreground">Cloudinary</strong> — our image hosting and processing
                    provider, used to store and optimize avatars, banners, and other media you upload.
                  </li>
                  <li>
                    <strong className="text-foreground">Resend</strong> — our transactional email provider,
                    used to deliver account verification, password reset, and notification emails.
                  </li>
                </ul>
                <p>
                  We do not sell your personal information to advertisers or data brokers — full stop.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">5. Data Retention</h2>
                <p>
                  We retain your account information for as long as your account remains active. If you
                  delete your account, we remove your personal information and content from our active systems
                  within 30 days, except where we are required to retain certain data to comply with legal
                  obligations, resolve disputes, or enforce our agreements.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">6. Your Rights (Including GDPR)</h2>
                <p>
                  Depending on where you live, you may have rights regarding your personal data, including the
                  right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access the personal data we hold about you</li>
                  <li>Request correction of inaccurate or incomplete data</li>
                  <li>Request deletion of your data ("right to be forgotten")</li>
                  <li>Export your data in a portable format</li>
                  <li>Object to or restrict certain types of processing</li>
                  <li>Withdraw consent at any time where processing is based on consent</li>
                </ul>
                <p>
                  If you are located in the European Economic Area, you have these rights under the General
                  Data Protection Regulation (GDPR). To exercise any of these rights, reach out via our{" "}
                  <a href="/contact" className="text-primary hover:underline">Contact page</a> or your account
                  privacy settings, and we'll respond within the timeframes required by applicable law.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">7. Children's Privacy</h2>
                <p>
                  Vortex is not directed at children under the age of 13 (or the minimum age required by your
                  country's laws), and we do not knowingly collect personal information from children. If you
                  believe a child has provided us with personal data, please contact us so we can promptly
                  remove it.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">8. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or
                  for legal, operational, or regulatory reasons. We'll notify you of material changes by
                  posting the updated policy here and revising the "Last updated" date above. Continued use of
                  Vortex after changes take effect constitutes acceptance of the revised policy.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">9. Contact Us</h2>
                <p>
                  If you have any questions, concerns, or requests regarding this Privacy Policy or your
                  personal data, please reach out through our{" "}
                  <a href="/contact" className="text-primary hover:underline">Contact page</a> — we're happy
                  to help.
                </p>
              </div>
            </div>
          </LegalAnimated>
        </div>
      </section>
    </div>
  );
}
