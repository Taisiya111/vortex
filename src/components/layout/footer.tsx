import React from "react";
import Link from "next/link";
import { SparklesIcon } from "@heroicons/react/24/outline";

const footerLinks = {
  Product: [
    { label: "Games Catalog", href: "/games" },
    { label: "Reviews", href: "/reviews" },
    { label: "Community", href: "/community" },
    { label: "Collections", href: "/collections" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Press Kit", href: "/press" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Status", href: "/status" },
    { label: "API Docs", href: "/docs/api" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "DMCA", href: "/dmca" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">Vortex</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              The ultimate platform for PC gamers to discover, track, and share their gaming journey.
            </p>
            <div className="flex gap-3">
              {["twitter", "discord", "github"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-lg border border-border bg-secondary hover:border-primary/50 hover:bg-secondary/80 flex items-center justify-center transition-all duration-200"
                  aria-label={social}
                >
                  <span className="text-xs font-bold text-muted-foreground capitalize">{social[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-foreground mb-3">{category}</h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Vortex. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Built with</span>
            <span className="text-red-400">♥</span>
            <span>for gamers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
