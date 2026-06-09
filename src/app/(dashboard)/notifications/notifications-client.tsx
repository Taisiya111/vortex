"use client";

import React, { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BellIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  TrophyIcon,
  PuzzlePieceIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  TrashIcon,
  CheckIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeDate } from "@/lib/utils";
import type { NotificationType } from "@/types";

interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationsClientProps {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

const TYPE_ICONS: Record<string, { icon: typeof BellIcon; color: string }> = {
  REVIEW_LIKE: { icon: HeartIcon, color: "from-rose-500 to-pink-500" },
  REVIEW_COMMENT: { icon: ChatBubbleLeftIcon, color: "from-blue-500 to-cyan-500" },
  ACHIEVEMENT_UNLOCKED: { icon: TrophyIcon, color: "from-amber-500 to-orange-500" },
  GAME_ADDED: { icon: PuzzlePieceIcon, color: "from-violet-500 to-indigo-500" },
  FOLLOW: { icon: UserPlusIcon, color: "from-emerald-500 to-teal-500" },
  SYSTEM: { icon: Cog6ToothIcon, color: "from-slate-500 to-slate-600" },
};

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
];

export function NotificationsClient({
  initialNotifications,
  initialUnreadCount,
}: NotificationsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [filter, setFilter] = useState("all");
  const [isMarkingAll, startMarkAllTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, filter]);

  async function markAsRead(ids: string[]) {
    if (ids.length === 0) return;
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - ids.filter((id) => {
        const n = notifications.find((x) => x.id === id);
        return n && !n.read;
      }).length));
    } catch {
      toast({ title: "Error", description: "Failed to mark notification as read.", variant: "destructive" });
    }
  }

  function handleMarkAllRead() {
    startMarkAllTransition(async () => {
      try {
        const res = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ all: true }),
        });
        if (!res.ok) throw new Error("Failed to update");
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        toast({ title: "All caught up", description: "All notifications marked as read." });
        router.refresh();
      } catch {
        toast({ title: "Error", description: "Failed to mark all as read.", variant: "destructive" });
      }
    });
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.read) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast({ title: "Error", description: "Failed to delete notification.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleClick(notification: Notification) {
    if (!notification.read) {
      await markAsRead([notification.id]);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
            <BellIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black">Notifications</h2>
            <p className="text-muted-foreground mt-0.5">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "You're all caught up"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleMarkAllRead}
          loading={isMarkingAll}
          disabled={isMarkingAll || unreadCount === 0}
        >
          <CheckIcon className="h-4 w-4" />
          Mark all as read
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            {FILTER_TABS.map(({ value, label }) => (
              <TabsTrigger key={value} value={value}>
                {label}
                {value === "unread" && unreadCount > 0 && (
                  <Badge variant="default" className="ml-2 px-1.5 py-0 text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <CardContent className="py-16 text-center">
              <InboxIcon className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                We&apos;ll let you know when something happens.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.map((notification, i) => {
              const meta = TYPE_ICONS[notification.type] ?? TYPE_ICONS.SYSTEM;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    hover
                    className={`relative overflow-hidden ${
                      !notification.read ? "border-primary/30 bg-primary/[0.03]" : ""
                    }`}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      {!notification.read && (
                        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
                      )}
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <button
                        onClick={() => handleClick(notification)}
                        className="flex-1 min-w-0 text-left cursor-pointer"
                      >
                        <p className={`text-sm ${!notification.read ? "font-semibold" : "font-medium"} line-clamp-1 pr-6`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1.5">
                          {formatRelativeDate(notification.createdAt)}
                        </p>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(notification.id)}
                        disabled={deletingId === notification.id}
                        title="Delete notification"
                      >
                        <TrashIcon className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
