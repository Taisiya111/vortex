"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn, formatRelativeDate, getInitials } from "@/lib/utils";

interface ThreadUser {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface ThreadMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  read: boolean;
  createdAt: string | Date;
}

interface ThreadClientProps {
  currentUserId: string;
  otherUser: ThreadUser;
  initialMessages: ThreadMessage[];
  initialTotal: number;
}

function formatDateSeparator(date: Date): string {
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }).format(date);
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function ThreadClient({ currentUserId, otherUser, initialMessages }: ThreadClientProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ThreadMessage[]>(initialMessages);
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "auto" });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function handleSend() {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: ThreadMessage = {
      id: optimisticId,
      senderId: currentUserId,
      recipientId: otherUser.id,
      content: trimmed,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setContent("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: otherUser.id, content: trimmed }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      const sent = await res.json();

      setMessages((prev) => prev.map((m) => (m.id === optimisticId ? sent : m)));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setContent(trimmed);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const groups: { key: string; label: string; messages: ThreadMessage[] }[] = [];
  for (const message of messages) {
    const date = new Date(message.createdAt);
    const key = dateKey(date);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.key === key) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ key, label: formatDateSeparator(date), messages: [message] });
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 pb-4 flex-shrink-0"
      >
        <Button variant="ghost" size="icon" asChild>
          <Link href="/messages">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser.image ?? undefined} />
          <AvatarFallback>
            {getInitials(otherUser.name ?? otherUser.username ?? "U")}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold truncate">{otherUser.name ?? otherUser.username ?? "Unknown user"}</p>
          {otherUser.username && (
            <p className="text-xs text-muted-foreground truncate">@{otherUser.username}</p>
          )}
        </div>
      </motion.div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-sm">
                No messages yet. Say hello to {otherUser.name ?? otherUser.username ?? "this user"}!
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.key} className="space-y-3">
                <div className="flex items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                    {group.label}
                  </span>
                </div>
                {group.messages.map((message) => {
                  const isMine = message.senderId === currentUserId;
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className={cn("flex", isMine ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2.5 text-sm",
                          isMine
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-secondary text-secondary-foreground rounded-bl-sm"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        <p
                          className={cn(
                            "text-[10px] mt-1",
                            isMine ? "text-primary-foreground/60" : "text-muted-foreground"
                          )}
                        >
                          {formatRelativeDate(message.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border p-3 flex-shrink-0">
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="min-h-[44px] max-h-32"
              rows={1}
            />
            <Button
              variant="gradient"
              size="icon"
              onClick={handleSend}
              disabled={!content.trim() || isSending}
              className="flex-shrink-0"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Press Enter to send, Shift+Enter for a new line
          </p>
        </div>
      </Card>
    </div>
  );
}
