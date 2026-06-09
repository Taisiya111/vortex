"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/library": "My Library",
  "/wishlist": "Wishlist",
  "/collections": "Collections",
  "/reviews": "Reviews",
  "/screenshots": "Screenshots",
  "/profile": "Profile",
  "/settings": "Settings",
  "/admin": "Admin",
  "/admin/games": "Manage Games",
  "/admin/users": "Manage Users",
  "/admin/reviews": "Moderate Reviews",
  "/admin/analytics": "Analytics",
};

interface TopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function DashboardTopbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const title = breadcrumbMap[pathname] || "Vortex";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b border-border bg-background/80 backdrop-blur-xl">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <MagnifyingGlassIcon className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link href="/notifications">
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-none rounded-full">
              <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(user.name ?? user.email ?? "U")}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
