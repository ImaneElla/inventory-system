"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { User, Shield, Moon, Bell, Camera, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");
  const [userImage, setUserImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUserName(localStorage.getItem("userName") || "");
    setRole(localStorage.getItem("role") || "");
    const img = localStorage.getItem("userImage");
    if (img) {
      setUserImage(img.startsWith("http") ? img : "http://localhost:8080" + img);
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSaveProfile = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("userName", userName);
      showToast("Profile updated successfully");
      setIsLoading(false);
      window.dispatchEvent(new Event("storage"));
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-full p-4 sm:p-6 md:p-10 max-w-5xl mx-auto gap-8 w-full">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Settings</h1>
        <p className="text-sm md:text-base text-muted-foreground font-medium">Manage your professional workspace and account preferences.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Profile */}
        <div className="lg:col-span-7 space-y-8">
          <SectionCard 
            title="Account Profile" 
            subtitle="Update your public identity" 
            icon={<User size={20} />}
          >
            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start p-2">
              {/* Avatar Picker */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="h-28 w-28 rounded-[38%] overflow-hidden border-4 border-background shadow-2xl bg-primary/5 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                    {userImage ? (
                      <img src={userImage} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-primary/40">
                        {userName ? userName.charAt(0).toUpperCase() : "?"}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-[2px]">
                      <Camera className="text-white" size={24} />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white p-2 rounded-xl shadow-lg border-2 border-background">
                    <Camera size={14} />
                  </div>
                </div>
                <button className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline transition-all">Change Photo</button>
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
                    <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary transition-transform group-hover:scale-110" />
                    <input 
                      type="text" 
                      value={role}
                      readOnly
                      className="w-full h-12 px-4 pl-12 rounded-2xl border border-border/40 bg-muted/30 text-muted-foreground font-bold text-sm cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium italic px-1">Role privileges are managed by the system administrator.</p>
                </div>
                <div className="pt-4 flex justify-end sm:justify-start">
                  <Button onClick={handleSaveProfile} disabled={isLoading} className="rounded-2xl px-8 h-12 font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all">
                    {isLoading ? "Synchronizing..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard 
            title="Notifications" 
            subtitle="Stay updated with your stock and sales" 
            icon={<Bell size={20} />}
          >
            <div className="space-y-1 divide-y divide-border/20">
              {[
                { title: "Push Notifications", desc: "Real-time browser alerts", active: true },
                { title: "Low Stock Warnings", desc: "Alerts when items hit threshold", active: true },
                { title: "Email Reports", desc: "Daily summary of operations", active: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-4 group cursor-pointer px-2 rounded-xl hover:bg-primary/5 transition-colors">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-[11px] text-muted-foreground font-medium">{item.desc}</p>
                  </div>
                  <IOSToggle active={item.active} />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Right Column - Preferences & Security */}
        <div className="lg:col-span-5 space-y-8">
          <SectionCard 
            title="Appearance" 
            subtitle="Personalize your view" 
            icon={<Moon size={20} />}
          >
            <div className="space-y-6 pt-2">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Display Theme</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full capitalize">{mounted ? (theme || 'System') : '...'}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 bg-muted/20 p-2 rounded-2xl border border-border/40 shadow-inner">
                  {['light', 'dark', 'system'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        "flex flex-col items-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300",
                        mounted && (theme === t || (t === 'system' && !theme))
                          ? "bg-card shadow-lg text-primary scale-100" 
                          : "text-muted-foreground hover:bg-card/40 hover:text-foreground"
                      )}
                    >
                      {t === 'light' ? <div className="w-4 h-4 rounded-full border-2 border-orange-400 bg-orange-100" /> : 
                       t === 'dark' ? <div className="w-4 h-4 rounded-full border-2 border-indigo-400 bg-indigo-900" /> :
                       <div className="w-4 h-4 rounded-full border-2 border-primary/40 bg-linear-to-br from-orange-100 to-indigo-900" />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard 
            title="System Security" 
            subtitle="Manage your session & security" 
            icon={<Shield size={20} />}
          >
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex gap-4 items-center">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <Shield size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-0.5">Two-Factor Auth</h4>
                  <p className="text-[10px] text-orange-600/70 font-medium leading-relaxed">Enhance your account security by enabling 2FA. Recommended for Admin roles.</p>
                </div>
                <ChevronRight size={16} className="text-orange-500/50" />
              </div>
              <button className="w-full py-4 px-4 rounded-2xl border border-border/40 text-foreground text-sm font-bold flex items-center justify-between hover:bg-muted/30 transition-all">
                <span>Change Password</span>
                <ChevronRight size={16} className="text-muted-foreground/50" />
              </button>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-8 py-3 rounded-full text-sm font-black shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl flex items-center gap-3"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Check size={12} />
          </div>
          {toast}
        </motion.div>
      )}
    </div>
  );
}

function SectionCard({ title, subtitle, icon, children }: any) {
  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-card/60 backdrop-blur-2xl rounded-[32px] border border-border/40 shadow-2xl shadow-black/5 overflow-hidden flex flex-col"
    >
      <div className="p-6 md:p-8 border-b border-border/20 bg-muted/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-foreground">{title}</h2>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-6 md:p-8">
        {children}
      </div>
    </motion.section>
  );
}

function IOSToggle({ active }: { active: boolean }) {
  return (
    <button 
      className={cn(
        "relative w-11 h-6 rounded-full transition-all duration-500 ease-in-out shadow-inner",
        active ? 'bg-green-500 shadow-green-500/20' : 'bg-muted-foreground/20'
      )}
    >
      <span className={cn(
        "absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-all duration-500 shadow-xl flex items-center justify-center overflow-hidden",
        active ? 'translate-x-5' : 'translate-x-0'
      )}>
        {active && <div className="w-1 h-1 rounded-full bg-green-500/30" />}
      </span>
    </button>
  );
}