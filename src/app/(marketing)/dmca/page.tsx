import React from "react";
import { ScaleIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { LegalAnimated } from "@/components/marketing/legal-animated";

export const metadata = {
  title: "DMCA Policy | Vortex",
  description:
    "Vortex's policy and process for submitting copyright infringement notifications and counter-notifications under the DMCA.",
};

const LAST_UPDATED = "June 1, 2026";

export default function DmcaPage() {
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
              <ScaleIcon className="h-3.5 w-3.5 mr-1.5" />
              Respecting creators' rights
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              DMCA <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Vortex respects the intellectual property rights of others and expects our community to do
              the same. Here's how we handle copyright concerns.
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
                <h2 className="text-2xl font-bold text-foreground">1. Overview</h2>
                <p>
                  Vortex complies with the Digital Millennium Copyright Act (DMCA) and responds to clear
                  notices of alleged copyright infringement. If you believe content hosted on Vortex infringes
                  your copyright, you may submit a notification asking us to remove or disable access to it.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">2. Filing a Copyright Infringement Notification</h2>
                <p>To file a valid notification, please send a written communication that includes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf</li>
                  <li>Identification of the copyrighted work claimed to have been infringed</li>
                  <li>Identification of the material that is claimed to be infringing, with enough detail (e.g. a URL) for us to locate it</li>
                  <li>Your contact information, including address, telephone number, and email address</li>
                  <li>A statement that you have a good-faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law</li>
                  <li>A statement, made under penalty of perjury, that the information in the notification is accurate and that you are the copyright owner or authorized to act on their behalf</li>
                </ul>
                <p>
                  Send notifications to our Designated Agent using the contact information in section 5 below.
                  Incomplete notices may delay our ability to process your request.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">3. Counter-Notification Process</h2>
                <p>
                  If you believe content you posted was removed or disabled as a result of mistake or
                  misidentification, you may submit a counter-notification to our Designated Agent that
                  includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your physical or electronic signature</li>
                  <li>Identification of the material that was removed and its location before removal</li>
                  <li>A statement, under penalty of perjury, that you have a good-faith belief the material was removed as a result of mistake or misidentification</li>
                  <li>Your name, address, telephone number, and a statement consenting to the jurisdiction of the federal court in your district (or, if outside the relevant jurisdiction, an appropriate judicial body)</li>
                </ul>
                <p>
                  Upon receiving a valid counter-notification, we may reinstate the removed content within the
                  timeframes required by law, unless the original complainant files a court action seeking to
                  restrain the user from engaging in infringing activity.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">4. Repeat Infringer Policy</h2>
                <p>
                  Vortex maintains a policy of terminating, in appropriate circumstances, the accounts of
                  users who are determined to be repeat infringers of others' intellectual property rights.
                  We track valid takedown notices against accounts and may suspend or permanently disable
                  access for users with a pattern of infringing activity.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">5. Designated Agent &amp; Contact Information</h2>
                <p>Copyright notifications and counter-notifications should be directed to our Designated Agent:</p>
                <div className="rounded-xl border border-border bg-secondary/30 p-5 not-prose space-y-1">
                  <p className="text-foreground font-semibold">Vortex Copyright Agent</p>
                  <p className="text-sm">Vortex, Legal &amp; Trust Department</p>
                  <p className="text-sm">
                    Email: <a href="mailto:dmca@vortex.gg" className="text-primary hover:underline">dmca@vortex.gg</a>
                  </p>
                  <p className="text-sm">
                    Or reach us via our{" "}
                    <a href="/contact" className="text-primary hover:underline">Contact page</a> with the
                    subject line "DMCA Notice"
                  </p>
                </div>
                <p className="text-sm">
                  Please note that under Section 512(f) of the DMCA, any person who knowingly materially
                  misrepresents that material is infringing may be liable for damages.
                </p>
              </div>
            </div>
          </LegalAnimated>
        </div>
      </section>
    </div>
  );
}
