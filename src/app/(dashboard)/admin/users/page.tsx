"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  UsersIcon,
  ArrowLeftIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  EllipsisHorizontalIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatRelativeDate, getInitials } from "@/lib/utils";

interface User {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  banned?: boolean;
  _count: { library: number; reviews: number; collections: number };
}

interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-400 border-red-500/20",
  MODERATOR: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  USER: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const ROLES = ["USER", "MODERATOR", "ADMIN"];

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [data, setData] = useState<UsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("all");
  const [confirmRoleChange, setConfirmRoleChange] = useState<{
    user: User;
    newRole: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageSize = 20;

  async function fetchUsers(q?: string) {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (q ?? query) params.set("q", q ?? query);
      if (roleFilter !== "all") params.set("role", roleFilter);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      setData(await res.json());
    } catch {
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchUsers(query);
  }

  async function changeRole(userId: string, newRole: string) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      await fetchUsers();
      setConfirmRoleChange(null);
      toast({ title: "Role updated", description: `User role changed to ${newRole}.` });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update role.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const users = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/admin">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-black flex items-center gap-2">
            <UsersIcon className="h-7 w-7 text-violet-400" />
            Manage Users
          </h2>
          <p className="text-muted-foreground mt-0.5">
            {total.toLocaleString()} registered users
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
            <Select
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <FunnelIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { role: "USER", color: "from-slate-500 to-slate-600" },
          { role: "MODERATOR", color: "from-amber-500 to-orange-500" },
          { role: "ADMIN", color: "from-red-500 to-rose-600" },
        ].map(({ role, color }) => (
          <button
            key={role}
            onClick={() => {
              setRoleFilter(roleFilter === role ? "all" : role);
              setPage(1);
            }}
            className={`p-3 rounded-xl border text-center transition-all duration-200 ${
              roleFilter === role
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/30 hover:bg-secondary/50"
            }`}
          >
            <div className="text-sm font-bold mb-0.5 capitalize">
              {role.toLowerCase()}s
            </div>
            <div
              className={`text-xs bg-gradient-to-r ${color} bg-clip-text text-transparent font-medium`}
            >
              {role}
            </div>
          </button>
        ))}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base">
            {isLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              `${total.toLocaleString()} user${total !== 1 ? "s" : ""}`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <UsersIcon className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors"
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                    <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                      {getInitials(user.name ?? user.email)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm line-clamp-1">
                        {user.name ?? user.email}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${roleColors[user.role] ?? roleColors.USER}`}
                      >
                        {user.role}
                      </Badge>
                      {user.banned && (
                        <Badge
                          variant="outline"
                          className="text-xs text-red-400 border-red-400/20 bg-red-400/10"
                        >
                          Banned
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {user.email}
                      {user.username && ` · @${user.username}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatRelativeDate(user.createdAt)} · {user._count.library} games ·{" "}
                      {user._count.reviews} reviews · {user._count.collections} collections
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <EllipsisHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem disabled className="text-xs text-muted-foreground font-semibold uppercase">
                          Change Role
                        </DropdownMenuItem>
                        {ROLES.filter((r) => r !== user.role).map((role) => (
                          <DropdownMenuItem
                            key={role}
                            onClick={() =>
                              setConfirmRoleChange({ user, newRole: role })
                            }
                          >
                            <ShieldCheckIcon className="h-4 w-4" />
                            Make {role.charAt(0) + role.slice(1).toLowerCase()}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={
                            user.banned
                              ? "text-emerald-400 focus:text-emerald-400"
                              : "text-destructive focus:text-destructive"
                          }
                        >
                          {user.banned ? (
                            <>
                              <CheckCircleIcon className="h-4 w-4" />
                              Unban User
                            </>
                          ) : (
                            <>
                              <NoSymbolIcon className="h-4 w-4" />
                              Ban User
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Role change confirmation */}
      <Dialog
        open={confirmRoleChange !== null}
        onOpenChange={(open) => !open && setConfirmRoleChange(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-violet-400" />
              Change User Role
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Change{" "}
            <span className="font-semibold text-foreground">
              {confirmRoleChange?.user.name ?? confirmRoleChange?.user.email}
            </span>
            's role from{" "}
            <Badge
              variant="outline"
              className={`text-xs ${
                roleColors[confirmRoleChange?.user.role ?? "USER"]
              }`}
            >
              {confirmRoleChange?.user.role}
            </Badge>{" "}
            to{" "}
            <Badge
              variant="outline"
              className={`text-xs ${roleColors[confirmRoleChange?.newRole ?? "USER"]}`}
            >
              {confirmRoleChange?.newRole}
            </Badge>
            ?
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmRoleChange(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={() =>
                confirmRoleChange &&
                changeRole(confirmRoleChange.user.id, confirmRoleChange.newRole)
              }
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
