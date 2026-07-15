"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  User, Shield, Bell, Camera, ChevronRight,
  Check, HelpCircle, Globe, Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { updateUserProfile, resolveImageUrl } from "@/lib/api";
import Link from "next/link";
import {
  useAppPrefs,
  type Lang,
} from "@/lib/appPrefs";

type NotificationKey = "push" | "lowStock" | "emailReports";

const DEFAULT_NOTIFICATIONS: Record<NotificationKey, boolean> = {
  push: true,
  lowStock: true,
  emailReports: false,
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useAppPrefs();
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
    setUserName(sessionStorage.getItem("userName") || "");
    setRole(sessionStorage.getItem("role") || "");
    const id = sessionStorage.getItem("userId");
    if (id) setUserId(Number(id));
    const img = sessionStorage.getItem("userImage");
    if (img) setUserImage(resolveImageUrl(img) ?? "");
    const stored = localStorage.getItem("notificationSettings");
    if (stored) {
      try { setNotifications({ ...DEFAULT_NOTIFICATIONS, ...JSON.parse(stored) }); }
      catch { /* ignore */ }
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
    showToast(t("settings.notifications.title") + " — saved");
  };

  const handleSaveProfile = async () => {
    if (!userId) { showToast("Please log in again"); return; }
    setIsLoading(true);
    try {
      const data = await updateUserProfile(userId, {
        userName: userName.trim(),
        image: avatarFile ?? undefined,
      });
      sessionStorage.setItem("userName", data.userName);
      if (data.imageUrl) {
        sessionStorage.setItem("userImage", data.imageUrl);
        setUserImage(resolveImageUrl(data.imageUrl) ?? "");
      }
      if (sessionStorage.getItem("rememberMe") === "true") {
        localStorage.setItem("userName", data.userName);
        if (data.imageUrl) localStorage.setItem("userImage", data.imageUrl);
      }
      setAvatarFile(null);
      window.dispatchEvent(new Event("storage"));
      showToast(lang === "fr" ? "Profil mis à jour" : "Profile updated successfully");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const notificationItems: { key: NotificationKey; titleKey: string; descKey: string }[] = [
    { key: "push",         titleKey: "settings.notifications.push",         descKey: "settings.notifications.pushDesc" },
    { key: "lowStock",     titleKey: "settings.notifications.lowStock",     descKey: "settings.notifications.lowStockDesc" },
    { key: "emailReports", titleKey: "settings.notifications.emailReports", descKey: "settings.notifications.emailReportsDesc" },
  ];

  const languages: { code: Lang; label: string; }[] = [
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
  ];
  return (
    <div className="flex flex-col min-h-full p-4 sm:p-6 md:p-10 max-w-5xl mx-auto gap-8 w-full">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
          {t("settings.title")}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground font-medium">
          {t("settings.subtitle")}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-8">

          {/* Profile */}
          <SectionCard title={t("settings.profile.title")} subtitle={t("settings.profile.subtitle")} icon={<User size={20} />}>
            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start p-2">
              <div className="flex flex-col items-center gap-4">
                <button type="button" onClick={() => fileRef.current?.click()} className="relative group">
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
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline transition-all">
                  {t("settings.profile.changePhoto")}
                </button>
              </div>

              <div className="flex-1 w-full space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    {t("settings.profile.fullName")}
                  </label>
                  <input
                    type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl border border-border/40 bg-background/50 text-foreground font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                    placeholder={t("settings.profile.fullName")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    {t("settings.profile.systemRole")}
                  </label>
                  <div className="relative group">
                    <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                    <input type="text" value={role} readOnly
                      className="w-full h-12 px-4 pl-12 rounded-2xl border border-border/40 bg-muted/30 text-muted-foreground font-bold text-sm cursor-not-allowed" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end sm:justify-start">
                  <Button onClick={handleSaveProfile} disabled={isLoading}
                    className="rounded-2xl px-8 h-12 font-black shadow-xl shadow-primary/20">
                    {isLoading ? t("settings.profile.saving") : t("settings.profile.save")}
                  </Button>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Notifications */}
          <SectionCard title={t("settings.notifications.title")} subtitle={t("settings.notifications.subtitle")} icon={<Bell size={20} />}>
            <div className="space-y-1 divide-y divide-border/20">
              {notificationItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between py-4 px-2 rounded-xl hover:bg-primary/5 transition-colors">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-foreground text-sm">{t(item.titleKey)}</h3>
                    <p className="text-[11px] text-muted-foreground font-medium">{t(item.descKey)}</p>
                  </div>
                  <IOSToggle active={notifications[item.key]} onToggle={() => toggleNotification(item.key)} />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 space-y-8">

          {/* Appearance */}
          <SectionCard title={t("settings.appearance.title")} subtitle={t("settings.appearance.subtitle")} icon={<Moon size={20} />}>
            <div className="space-y-6 pt-2">
              
              {/* Dark / Light / System */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {t("settings.appearance.displayTheme")}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full capitalize">
                    {mounted ? theme || "system" : "..."}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 bg-muted/20 p-2 rounded-2xl border border-border/40">
                  {(["light", "dark", "system"] as const).map((t_) => (
                    <button key={t_} onClick={() => setTheme(t_)}
                      className={cn(
                        "py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                        mounted && theme === t_ ? "bg-card shadow-lg text-primary" : "text-muted-foreground hover:bg-card/40"
                      )}>
                      {t_}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Globe size={14} className="text-muted-foreground" />
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {t("settings.appearance.language")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 bg-muted/20 p-2 rounded-2xl border border-border/40">
                  {languages.map((l) => (
                    <motion.button
                      key={l.code}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setLang(l.code); showToast(l.label); }}
                      className={cn(
                        "py-3 px-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2",
                        lang === l.code ? "bg-card shadow-lg text-primary" : "text-muted-foreground hover:bg-card/40"
                      )}>
                      <span className="text-base">{l.flag}</span>
                      {l.label}
                    </motion.button>
                  ))}
                </div>
              </div>

            </div>
          </SectionCard>

          {/* Help & Support */}
          <SectionCard title={t("settings.help.title")} subtitle={t("settings.help.subtitle")} icon={<HelpCircle size={20} />}>
            <div className="space-y-3">
              <Link href="/dashboard/help"
                className="flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:bg-primary/5 hover:border-primary/30 transition-all group">
                <div>
                  <p className="font-bold text-sm group-hover:text-primary transition-colors">{t("settings.help.docs")}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{t("settings.help.docsDesc")}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary" />
              </Link>
              <button type="button" onClick={() => router.push("/dashboard/products")}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:bg-muted/30 transition-all text-left">
                <div>
                  <p className="font-bold text-sm">{t("settings.help.faq")}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{t("settings.help.faqDesc")}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
              <a href="mailto:support@imn-inventory.local"
                className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all">
                <div>
                  <p className="font-bold text-sm text-primary">{t("settings.help.contact")}</p>
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
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-8 py-3 rounded-full text-sm font-black shadow-xl flex items-center gap-3">
          <Check size={14} />
          {toast}
        </motion.div>
      )}
    </div>
  );
}

function SectionCard({ title, subtitle, icon, children }: {
  title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-card/60 backdrop-blur-2xl rounded-[32px] border border-border/40 shadow-2xl shadow-black/5 overflow-hidden">
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
    <button type="button" onClick={onToggle}
      className={cn(
        "relative w-11 h-6 rounded-full transition-all duration-300",
        active ? "bg-green-500" : "bg-muted-foreground/20"
      )}>
      <span className={cn(
        "absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-all shadow-md",
        active ? "translate-x-5" : "translate-x-0"
      )} />
    </button>
  );
}
