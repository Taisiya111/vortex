"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Squares2X2Icon,
  BookOpenIcon,
  HeartIcon,
  FolderOpenIcon,
  StarIcon,
  BookmarkIcon,
  CameraIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, getInitials } from "@/lib/utils";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: Squares2X2Icon, exact: true },
  { href: "/library", label: "My Library", icon: BookOpenIcon },
  { href: "/wishlist", label: "Wishlist", icon: BookmarkIcon },
  { href: "/collections", label: "Collections", icon: FolderOpenIcon },
  { href: "/messages", label: "Messages", icon: ChatBubbleLeftRightIcon },
  { href: "/reviews", label: "Reviews", icon: StarIcon },
  { href: "/screenshots", label: "Screenshots", icon: CameraIcon },
];

const accountNav = [
  { href: "/profile", label: "Profile", icon: UserIcon },
  { href: "/settings", label: "Settings", icon: Cog6ToothIcon },
];

const adminNav = [
  { href: "/admin", label: "Admin Dashboard", icon: ChartBarIcon },
  { href: "/admin/games", label: "Manage Games", icon: SparklesIcon },
  { href: "/admin/users", label: "Manage Users", icon: UserIcon },
  { href: "/admin/reviews", label: "Moderate Reviews", icon: StarIcon },
  { href: "/admin/analytics", label: "Analytics", icon: ChartBarIcon },
];

interface SidebarProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const NavItem = ({ href, label, icon: Icon, exact }: { href: string; label: string; icon: React.FC<{ className?: string }>; exact?: boolean }) => (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
        isActive(href, exact)
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
    >
      {isActive(href, exact) && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 bg-primary/10 rounded-lg"
          transition={{ duration: 0.2 }}
        />
      )}
      <Icon className={cn("h-5 w-5 flex-shrink-0 relative z-10", isActive(href, exact) ? "text-primary" : "")} />
      {!collapsed && <span className="relative z-10">{label}</span>}
    </Link>
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.2 }}
      className="fixed left-0 top-0 h-screen z-40 hidden lg:flex flex-col border-r border-border bg-card/50 backdrop-blur-xl overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border flex-shrink-0">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-black gradient-text text-lg">Vortex</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-md border border-border bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
        >
          {collapsed
            ? <ChevronRightIcon className="h-3.5 w-3.5" />
            : <ChevronLeftIcon className="h-3.5 w-3.5" />
          }
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {!collapsed && <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Library</p>}
        {mainNav.map((item) => <NavItem key={item.href} {...item} />)}

        <div className="my-3 border-t border-border" />

        {!collapsed && <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Account</p>}
        {accountNav.map((item) => <NavItem key={item.href} {...item} />)}

        {user.role === "ADMIN" && (
          <>
            <div className="my-3 border-t border-border" />
            {!collapsed && (
              <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-primary" />
                Admin
              </p>
            )}
            {adminNav.map((item) => <NavItem key={item.href} {...item} />)}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-border flex-shrink-0">
        <div className={cn("flex items-center gap-3 p-2 rounded-lg", !collapsed && "hover:bg-secondary transition-colors")}>
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(user.name ?? user.email ?? "U")}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          {!collapsed && user.role === "ADMIN" && (
            <Badge variant="default" className="text-xs py-0 flex-shrink-0">Admin</Badge>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
