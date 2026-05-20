"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { User, Shield, Moon, Bell, Camera, ChevronRight, Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { updateUserProfile } from "@/lib/api";
import Link from "next/link";

type NotificationKey = "push" | "lowStock" | "emailReports";

const DEFAULT_NOTIFICATIONS: Record<NotificationKey, boolean> = {
  push: true,
  lowStock: true,
  emailReports: false,
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [userImage, setUserImage] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);

  useEffect(() => {
    setMounted(true);
    setUserName(localStorage.getItem("userName") || "");
    setRole(localStorage.getItem("role") || "");
    const id = localStorage.getItem("userId");
    if (id) setUserId(Number(id));
    const img = localStorage.getItem("userImage");
    if (img) {
      setUserImage(img.startsWith("http") ? img : `http://127.0.0.1:8080${img}`);
    }
    const stored = localStorage.getItem("notificationSettings");
    if (stored) {
      try {
        setNotifications({ ...DEFAULT_NOTIFICATIONS, ...JSON.parse(stored) });
      } catch {
        /* ignore */
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handlePhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setUserImage(URL.createObjectURL(file));
  };

  const toggleNotification = (key: NotificationKey) => {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    localStorage.setItem("notificationSettings", JSON.stringify(next));
    window.dispatchEvent(new Event("storage"));
    showToast("Notification preferences saved");
  };

  const handleSaveProfile = async () => {
    if (!userId) {
      showToast("Please log in again to update your profile");
      return;
    }
    setIsLoading(true);
    try {
      const data = await updateUserProfile(userId, {
        userName: userName.trim(),
        image: avatarFile ?? undefined,
      });
      localStorage.setItem("userName", data.userName);
      if (data.imageUrl) {
        localStorage.setItem("userImage", data.imageUrl);
        setUserImage(`http://127.0.0.1:8080${data.imageUrl}`);
      }
      setAvatarFile(null);
      window.dispatchEvent(new Event("storage"));
      showToast("Profile updated successfully");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const notificationItems: { key: NotificationKey; title: string; desc: string }[] = [
    { key: "push", title: "Push Notifications", desc: "Real-time browser alerts in the header" },
    { key: "lowStock", title: "Low Stock Warnings", desc: "Alerts when items hit threshold" },
    { key: "emailReports", title: "Email Reports", desc: "Daily summary of operations (coming soon)" },
  ];

  return (
    <div className="flex flex-col min-h-full p-4 sm:p-6 md:p-10 max-w-5xl mx-auto gap-8 w-full">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Settings</h1>
        <p className="text-sm md:text-base text-muted-foreground font-medium">
          Manage your profile, notifications, and workspace preferences.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <SectionCard title="Account Profile" subtitle="Update your public identity" icon={<User size={20} />}>
              <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start p-2">
                <div className="flex flex-col items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="relative group"
                  >
                    <div className="h-28 w-28 rounded-[38%] overflow-hidden border-4 border-background shadow-2xl bg-primary/5 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                      {userImage ? (
                        <img src={userImage} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-3xl font-black text-primary/40">
                          {userName ? userName.charAt(0).toUpperCase() : "?"}
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                        <Camera className="text-white" size={24} />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-primary text-white p-2 rounded-xl shadow-lg border-2 border-background">
                      <Camera size={14} />
                    </div>
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoPick} />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline transition-all"
                  >
                    Change Photo
                  </button>
                </div>

                <div className="flex-1 w-full space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full h-12 px-4 rounded-2xl border border-border/40 bg-background/50 text-foreground font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">System Role</label>
                      <div className="relative group">
                        <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                        <input type="text" value={role} readOnly className="w-full h-12 px-4 pl-12 rounded-2xl border border-border/40 bg-muted/30 text-muted-foreground font-bold text-sm cursor-not-allowed" />
                      </div>
                    </div>
                  <div className="pt-4 flex justify-end sm:justify-start">
                    <Button onClick={handleSaveProfile} disabled={isLoading} className="rounded-2xl px-8 h-12 font-black shadow-xl shadow-primary/20">
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Notifications" subtitle="Control alerts shown in your dashboard" icon={<Bell size={20} />}>
              <div className="space-y-1 divide-y divide-border/20">
                {notificationItems.map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-4 px-2 rounded-xl hover:bg-primary/5 transition-colors">
                    <div className="flex flex-col">
                      <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
                      <p className="text-[11px] text-muted-foreground font-medium">{item.desc}</p>
                    </div>
                    <IOSToggle
                      active={notifications[item.key]}
                      onToggle={() => toggleNotification(item.key)}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <SectionCard title="Appearance" subtitle="Personalize your view" icon={<Moon size={20} />}>
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Display Theme</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full capitalize">
                    {mounted ? theme || "system" : "..."}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 bg-muted/20 p-2 rounded-2xl border border-border/40">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        "py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                        mounted && theme === t ? "bg-card shadow-lg text-primary" : "text-muted-foreground hover:bg-card/40"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Help & Support" subtitle="Guides and quick answers" icon={<HelpCircle size={20} />}>
              <div className="space-y-3">
                <Link
                  href="/dashboard/help"
                  className="flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:bg-primary/5 hover:border-primary/30 transition-all group"
                >
                  <div>
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">Documentation</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Step-by-step guides for every feature</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary" />
                </Link>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/products")}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:bg-muted/30 transition-all text-left"
                >
                  <div>
                    <p className="font-bold text-sm">Inventory FAQ</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Managing products, stock & sales</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
                <a
                  href="mailto:support@imn-inventory.local"
                  className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all"
                >
                  <div>
                    <p className="font-bold text-sm text-primary">Contact Support</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">support@imn-inventory.local</p>
                  </div>
                  <ChevronRight size={16} className="text-primary" />
                </a>
              </div>
            </SectionCard>
          </div>
        </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-8 py-3 rounded-full text-sm font-black shadow-xl flex items-center gap-3"
        >
          <Check size={14} />
          {toast}
        </motion.div>
      )}
    </div>
  );
}

function SectionCard({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-card/60 backdrop-blur-2xl rounded-[32px] border border-border/40 shadow-2xl shadow-black/5 overflow-hidden"
    >
      <div className="p-6 md:p-8 border-b border-border/20 bg-muted/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-foreground">{title}</h2>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-6 md:p-8">{children}</div>
    </motion.section>
  );
}

function IOSToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative w-11 h-6 rounded-full transition-all duration-300",
        active ? "bg-green-500" : "bg-muted-foreground/20"
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-all shadow-md",
          active ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}
