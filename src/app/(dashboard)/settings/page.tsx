"use client";

import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  UserCircleIcon,
  KeyIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";

interface ProfileForm {
  name: string;
  username: string;
  bio: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotifPrefs {
  reviewLikes: boolean;
  reviewComments: boolean;
  achievements: boolean;
  follows: boolean;
  systemNotifs: boolean;
  emailDigest: boolean;
}

const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  reviewLikes: true,
  reviewComments: true,
  achievements: true,
  follows: true,
  systemNotifs: true,
  emailDigest: false,
};

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const { toast } = useToast();

  const user = session?.user;
  const displayName = user?.name ?? user?.email ?? "";

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: user?.name ?? "",
    username: (user as { username?: string })?.username ?? "",
    bio: (user as { bio?: string })?.bio ?? "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifPrefs, setNotifPrefs] =
    useState<NotifPrefs>(DEFAULT_NOTIF_PREFS);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);

  async function handleProfileSave() {
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update profile");
      }
      await updateSession({
        user: { ...user, name: profileForm.name },
      });
      toast({ title: "Profile updated", description: "Your profile has been saved." });
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSave() {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update password");
      }
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Password updated", description: "Your password has been changed." });
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar must be under 5MB.",
        variant: "destructive",
      });
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });
      await updateSession({ user: { ...user, image: url } });
      toast({ title: "Avatar updated", description: "Your profile picture has been updated." });
    } catch {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  async function handleNotifSave() {
    setIsSavingNotifs(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsSavingNotifs(false);
    toast({ title: "Preferences saved", description: "Notification settings updated." });
  }

  function ToggleSwitch({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
  }) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
          checked ? "bg-primary" : "bg-secondary"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-black">Settings</h2>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="profile">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="profile" className="gap-1.5">
              <UserCircleIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-1.5">
              <KeyIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5">
              <BellIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="danger" className="gap-1.5">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Danger</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-5">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-border">
                    <AvatarImage src={user?.image ?? ""} alt={displayName} />
                    <AvatarFallback className="text-xl font-black bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    <CameraIcon className="h-4 w-4" />
                    {isUploadingAvatar ? "Uploading..." : "Change Photo"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max 5MB.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Your name"
                      maxLength={60}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profileForm.username}
                      onChange={(e) =>
                        setProfileForm((f) => ({
                          ...f,
                          username: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_]/g, ""),
                        }))
                      }
                      placeholder="your_username"
                      maxLength={30}
                    />
                    <p className="text-xs text-muted-foreground">
                      Letters, numbers, and underscores only.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, bio: e.target.value }))
                    }
                    placeholder="Tell the community about yourself..."
                    rows={4}
                    maxLength={300}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {profileForm.bio.length}/300
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="gradient"
                    onClick={handleProfileSave}
                    loading={isSavingProfile}
                    disabled={isSavingProfile}
                  >
                    <CheckIcon className="h-4 w-4" />
                    Save Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Email Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex-1">
                    <p className="font-medium">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Your email address is used for sign-in and notifications.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 bg-emerald-400/10">
                    Verified
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-pw">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-pw"
                      type={showCurrentPw ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((f) => ({
                          ...f,
                          currentPassword: e.target.value,
                        }))
                      }
                      placeholder="Enter current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showCurrentPw ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-pw">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-pw"
                      type={showNewPw ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((f) => ({
                          ...f,
                          newPassword: e.target.value,
                        }))
                      }
                      placeholder="Min. 8 characters"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNewPw ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordForm.newPassword && (
                    <div className="flex gap-1 mt-1">
                      {[
                        passwordForm.newPassword.length >= 8,
                        /[A-Z]/.test(passwordForm.newPassword),
                        /[0-9]/.test(passwordForm.newPassword),
                        /[^A-Za-z0-9]/.test(passwordForm.newPassword),
                      ].map((met, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            met ? "bg-emerald-500" : "bg-secondary"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-pw">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-pw"
                      type={showConfirmPw ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((f) => ({
                          ...f,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Repeat new password"
                      className={`pr-10 ${
                        passwordForm.confirmPassword &&
                        passwordForm.newPassword !== passwordForm.confirmPassword
                          ? "border-destructive"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPw ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordForm.confirmPassword &&
                    passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-xs text-destructive">
                        Passwords do not match
                      </p>
                    )}
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="gradient"
                    onClick={handlePasswordSave}
                    loading={isSavingPassword}
                    disabled={
                      isSavingPassword ||
                      !passwordForm.currentPassword ||
                      !passwordForm.newPassword ||
                      passwordForm.newPassword !== passwordForm.confirmPassword
                    }
                  >
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Connected Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Social login connections are managed through your account provider.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">In-App Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    key: "reviewLikes" as keyof NotifPrefs,
                    label: "Review Likes",
                    desc: "When someone likes your review",
                  },
                  {
                    key: "reviewComments" as keyof NotifPrefs,
                    label: "Review Comments",
                    desc: "When someone comments on your review",
                  },
                  {
                    key: "achievements" as keyof NotifPrefs,
                    label: "Achievements",
                    desc: "When you unlock a new achievement",
                  },
                  {
                    key: "follows" as keyof NotifPrefs,
                    label: "New Followers",
                    desc: "When someone follows you",
                  },
                  {
                    key: "systemNotifs" as keyof NotifPrefs,
                    label: "System Notifications",
                    desc: "Important updates from Vortex",
                  },
                ].map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <ToggleSwitch
                      checked={notifPrefs[key] as boolean}
                      onChange={(v) =>
                        setNotifPrefs((prev) => ({ ...prev, [key]: v }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Email Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Weekly Digest</p>
                    <p className="text-xs text-muted-foreground">
                      A weekly summary of your activity and recommendations
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={notifPrefs.emailDigest}
                    onChange={(v) =>
                      setNotifPrefs((prev) => ({ ...prev, emailDigest: v }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                variant="gradient"
                onClick={handleNotifSave}
                loading={isSavingNotifs}
                disabled={isSavingNotifs}
              >
                <CheckIcon className="h-4 w-4" />
                Save Preferences
              </Button>
            </div>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-5">
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base text-destructive flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  These actions are irreversible. Please proceed with caution.
                </p>
                <Separator />

                <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                  <div>
                    <p className="font-medium text-sm">Export Your Data</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Download a copy of all your data
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Export Data
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                  <div>
                    <p className="font-medium text-sm text-destructive">
                      Delete Account
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteConfirmOpen(true)}
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Delete account confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5" />
              Delete Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete your
              account and all associated data including your library, reviews,
              and collections.
            </p>
            <div className="space-y-2">
              <Label>
                Type <span className="font-mono text-destructive">DELETE</span> to confirm
              </Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeleteConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== "DELETE"}
            >
              Permanently Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
