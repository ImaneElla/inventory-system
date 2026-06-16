"use client";

import React, { useState } from "react";
import { BookOpen, Server, Shield, Bell, LayoutDashboard, Search, User, Code, ChevronRight, Zap, Mail, MessageCircle, Settings, Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import AiAssistant from "@/components/AiAssistant";

export default function HelpPage() {
  const [faqSearch, setFaqSearch] = useState("");

  const faqs = [
    { q: "Why can't I delete my own account?", a: "For security, your own account is protected. You can delete other team members (including other admins) from the Users page." },
    { q: "How do low-stock alerts work?", a: "Enable Low Stock Warnings in Settings → Notifications. Alerts appear in the header bell when product quantity hits the minimum threshold." },
    { q: "Where does dashboard data come from?", a: "All charts use live sales and inventory data from your database — revenue trends, busiest days, and top sellers update automatically." },
    { q: "How do I change my profile picture?", a: "Go to Settings → Account Profile → Change Photo, then click Save Changes to upload to the server." },
  ];

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
    f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col min-h-full p-4 sm:p-6 md:p-10 max-w-5xl mx-auto gap-8 w-full">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-3xl mx-auto mb-4"
      >
        <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-indigo-600 text-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30 transform hover:rotate-6 transition-transform duration-500">
          <BookOpen size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-4">
          Mastering <span className="text-primary">IMN</span>
        </h1>
        <p className="text-sm md:text-lg text-muted-foreground font-medium leading-relaxed">
          Welcome to your high-performance inventory hub. Meet Emexa, our custom-built intelligent core agent engineered to run predictive forecasting across your active database tracks.
        </p>
      </motion.div>

      {/* Navigation Bar */}
      <nav className="bg-card/50 backdrop-blur-3xl border border-border/80 rounded-3xl w-xl mx-auto p-4 flex flex-row justify-between items-center gap-4 mb-4 transition-all">
        {[
          { label: "Technical", id: "technical" },
          { label: "Support", id: "support" },
          { label: "Guide", id: "guide" },
          { label: "FAQ", id: "faq" },
          { label: "Meet Emexa", id: "emexa-assistant" }
        ].map((navItem) => (
          <a
            key={navItem.id}
            href={`#${navItem.id}`}
            className="text-sm font-bold uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors duration-300"
          >
            {navItem.label}
          </a>
        ))}
      </nav>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-8"
      >
        {/* Technical Section */}
        <motion.section 
          id="technical"
          variants={item}
          className="bg-card/60 backdrop-blur-3xl rounded-[38px] border border-border/40 shadow-2xl p-8 md:p-12 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                <Code size={24} />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-foreground">Technical Milestones</h2>
            </div>
            
            <p className="text-sm md:text-base text-muted-foreground mb-12 font-medium max-w-2xl">
              We've engineered a state-of-the-art ecosystem focusing on speed, security, and a premium user experience. Here's a summary of our core achievements:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard 
                icon={Server} 
                color="text-orange-500" 
                bgColor="bg-orange-500/10"
                title="Hybrid Infrastructure" 
                desc="Transitioned from Docker to a high-speed native localhost PostgreSQL setup for zero-latency data access."
              />
              <FeatureCard 
                icon={Shield} 
                color="text-blue-500" 
                bgColor="bg-blue-500/10"
                title="Enterprise Auth" 
                desc="Secure multi-step registration with role-based access control and persistent session management."
              />
              <FeatureCard 
                icon={User} 
                color="text-pink-500" 
                bgColor="bg-pink-500/10"
                title="Visual Identity" 
                desc="Dynamic avatar system with fallback rendering and high-end iOS dashboard aesthetics."
              />
              <FeatureCard 
                icon={Bell} 
                color="text-yellow-500" 
                bgColor="bg-yellow-500/10"
                title="Event Engine" 
                desc="Interactive notification system for low stock alerts, sales milestones, and system updates."
              />
              <FeatureCard 
                icon={LayoutDashboard} 
                color="text-indigo-500" 
                bgColor="bg-indigo-500/10"
                title="Modern Workspace" 
                desc="Sleek, collapsible navigation and real-time analytics powered by Chart.js integration."
              />
              <FeatureCard 
                icon={Zap} 
                color="text-teal-500" 
                bgColor="bg-teal-500/10"
                title="Global Search" 
                desc="Platform-aware Ctrl+F search engine and seamless system-synchronized theme engine."
              />
            </div>
          </div>
        </motion.section>

        {/* Support shortcuts */}
        <motion.section variants={item} id="support" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/settings" className="p-6 rounded-3xl bg-card border border-border/40 hover:border-primary/40 hover:shadow-lg transition-all group">
            <Settings className="text-primary mb-4 group-hover:scale-110 transition-transform" size={28} />
            <h3 className="font-black text-sm mb-1">Account Settings</h3>
            <p className="text-[11px] text-muted-foreground">Profile photo, notifications & theme</p>
          </Link>
          <Link href="/dashboard/users" className="p-6 rounded-3xl bg-card border border-border/40 hover:border-primary/40 hover:shadow-lg transition-all group">
            <Users className="text-indigo-500 mb-4 group-hover:scale-110 transition-transform" size={28} />
            <h3 className="font-black text-sm mb-1">Team Management</h3>
            <p className="text-[11px] text-muted-foreground">Invite, manage roles & permissions</p>
          </Link>
          <a href="mailto:support@imn-inventory.local" className="p-6 rounded-3xl bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:shadow-lg transition-all group">
            <Mail className="text-primary mb-4 group-hover:scale-110 transition-transform" size={28} />
            <h3 className="font-black text-sm mb-1 text-primary">Email Support</h3>
            <p className="text-[11px] text-muted-foreground">support@imn-inventory.local</p>
          </a>
        </motion.section>

        {/* FAQ */}
        <motion.section variants={item} id="faq" className="bg-card/60 backdrop-blur-2xl rounded-[32px] border border-border/40 p-8 md:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <MessageCircle className="text-primary" size={24} />
              <h2 className="text-2xl font-black tracking-tight">Frequently Asked Questions</h2>
            </div>
            
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border/40 text-sm outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No FAQs match your search.</p>
              </div>
            ) : (
              filteredFaqs.map((faq, i) => (
                <details key={i} className="group rounded-2xl border border-border/40 bg-background/50 open:bg-primary/5 open:border-primary/20 transition-all">
                  <summary className="cursor-pointer p-5 font-bold text-sm list-none flex items-center justify-between">
                    {faq.q}
                    <ChevronRight size={16} className="text-muted-foreground group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </details>
              ))
            )}
          </div>
        </motion.section>

        {/* Quick Guide */}
        <motion.section variants={item} id="guide" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 p-4">
            <h2 className="text-3xl font-black tracking-tighter text-foreground mb-4">Quick Guide</h2>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              New to the platform? Follow these simple steps to get your inventory under control in minutes.
            </p>
          </div>
          
          <div className="lg:col-span-8 space-y-4">
            {[
              { num: "01", title: "Inventory Management", desc: "Access the 'Products' tab to manage your stock. Items hitting low levels will automatically appear in your notifications.", icon: LayoutDashboard },
              { num: "02", title: "Real-time Analytics", desc: "The 'Dashboard' provides deep insights into sales trends and profit margins with interactive visualizations.", icon: Zap },
              { num: "03", title: "System Preferences", desc: "Customize your environment in 'Settings'. Switch themes, update your profile, and manage notifications.", icon: Search },
              { num: "04", title: "Emexa Core Assistant", desc: "Use our intelligent interface down below for predictive data modeling and structural analysis queries.", icon: Code },
            ].map((step, idx) => (
              <div key={idx} className="group p-6 rounded-[28px] bg-card/40 border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all duration-500 shadow-sm flex gap-6 items-center">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-muted/20 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary font-black flex items-center justify-center text-xl transition-all duration-500">
                  {step.num}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-foreground mb-1 group-hover:translate-x-1 transition-transform">{step.title}</h4>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">{step.desc}</p>
                </div>
                <ChevronRight size={20} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </motion.section>
      </motion.div>

      {/* Emexa Integration Section */}
      <motion.section
        variants={item}
        id="emexa-assistant"
        className="bg-card/60 backdrop-blur-3xl rounded-[38px] border border-border/40 shadow-2xl p-8 md:p-12 overflow-hidden relative"
      >
        <AiAssistant />
      </motion.section>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-12 pb-12"
      >
        IMN SYSTEM • VERSION 2.0 • BUILT WITH PRECISION
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color, bgColor }: any) {
  return (
    <div className="group p-6 rounded-3xl bg-background/50 border border-border/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110", bgColor, color)}>
        <Icon size={28} />
      </div>
      <h3 className="font-black text-foreground text-sm uppercase tracking-wider mb-2">{title}</h3>
      <p className="text-[12px] text-muted-foreground leading-relaxed font-medium">{desc}</p>
    </div>
  );
}