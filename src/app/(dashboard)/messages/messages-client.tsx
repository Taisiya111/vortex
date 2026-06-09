"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn, formatRelativeDate, getInitials } from "@/lib/utils";

interface ConversationUser {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface Conversation {
  user: ConversationUser;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string | Date;
    senderId: string;
    read: boolean;
  };
  unreadCount: number;
}

interface MessagesClientProps {
  initialConversations: Conversation[];
}

export function MessagesClient({ initialConversations }: MessagesClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [conversations] = useState<Conversation[]>(initialConversations);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ConversationUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isNewMessageOpen) {
      setSearchQuery("");
      setSearchResults([]);
      return;
    }
  }, [isNewMessageOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setSearchResults(data.users ?? []);
      } catch {
        toast({
          title: "Error",
          description: "Failed to search users.",
          variant: "destructive",
        });
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [searchQuery, toast]);

  function handleSelectUser(userId: string) {
    setIsNewMessageOpen(false);
    router.push(`/messages/${userId}`);
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-black">Messages</h2>
          <p className="text-muted-foreground mt-1">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="gradient" onClick={() => setIsNewMessageOpen(true)}>
          <PencilSquareIcon className="h-4 w-4" />
          New Message
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        {conversations.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <ChatBubbleLeftRightIcon className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No conversations yet — start one!</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Send a message to another Vortex user to get the conversation going.
            </p>
            <Button variant="gradient" onClick={() => setIsNewMessageOpen(true)}>
              <PencilSquareIcon className="h-4 w-4" />
              New Message
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {conversations.map((conversation, i) => (
              <motion.div
                key={conversation.user.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
              >
                <Link href={`/messages/${conversation.user.id}`}>
                  <Card hover className="overflow-hidden">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={conversation.user.image ?? undefined} />
                        <AvatarFallback>
                          {getInitials(conversation.user.name ?? conversation.user.username ?? "U")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold truncate">
                            {conversation.user.name ?? conversation.user.username ?? "Unknown user"}
                          </p>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatRelativeDate(conversation.lastMessage.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p
                            className={cn(
                              "text-sm truncate",
                              conversation.unreadCount > 0
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                            )}
                          >
                            {conversation.lastMessage.content}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="flex-shrink-0">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, username, or email..."
                className="pl-9"
                autoFocus
              />
            </div>

            <div className="space-y-1 max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() && searchResults.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No users found matching &quot;{searchQuery}&quot;
                </p>
              ) : (
                searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={user.image ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name ?? user.username ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{user.name ?? user.username ?? "Unknown user"}</p>
                      {user.username && (
                        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
