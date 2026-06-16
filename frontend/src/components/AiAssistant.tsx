"use client";

import React from "react";
import { Sparkles, Brain, Cpu, Database, CheckCircle2, ChevronRight, Activity, Bot } from "lucide-react";
import { motion } from "framer-motion";

export default function AiAssistant() {
  const coreCapabilities = [
{
  icon: Database,
  title: "Real-Time Transaction Tracking",
  desc: "Tracks all inventory transactions in real time. It shows updates about stock changes, sales, and supply movement.",
  metric: "Live data updates"
},
{
  icon: Brain,
  title: "Demand Prediction",
  desc: "Looks at past sales data to predict future product demand and help plan stock needs.",
  metric: "30-day forecast"
},
{
  icon: Cpu,
  title: "Automatic Alerts",
  desc: "Sends alerts when stock is low or when there are important changes in inventory.",
  metric: "Instant notifications"
}
  ];
  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto text-foreground">
      {/* Header Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 mb-8 border-b border-border/40">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20">
            <Bot size={28} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight">Emexa Intelligent Core</h3>
            <p className="text-xs text-muted-foreground font-medium">Virtual Automation Engine & Forecasting Documentation</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-black uppercase tracking-wider self-start md:self-auto">
          <Activity size={12} className="animate-pulse" /> Local Cluster Active
        </div>
      </div>

      {/* Core Profile Summary */}
      <div className="p-6 rounded-3xl bg-background/40 border border-border/40 mb-8">
        <h4 className="text-sm font-black uppercase tracking-wider text-primary mb-2">Who is Emexa?</h4>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed">
          Emexa is the custom-built operational intelligence core driving the high-performance layer of the IMN Inventory platform. Deployed directly within the host runtime, she coordinates backend telemetry verification, extracts automated demand vectors, and monitors system infrastructure health to guarantee real-time data execution.
        </p>
      </div>

      {/* Deep-Dive Grid */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Engine Architecture & Subsystems</h4>
        
        {coreCapabilities.map((cap, i) => {
          const Icon = cap.icon;
          return (
            <div 
              key={i} 
              className="group p-6 rounded-[24px] bg-background/80 border border-border/40 hover:border-primary/30 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-xl bg-muted/40 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <Icon size={20} />
                </div>
                <div>
                  <h5 className="font-black text-sm text-foreground mb-1 group-hover:translate-x-0.5 transition-transform flex items-center gap-2">
                    {cap.title}
                  </h5>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium max-w-2xl">
                    {cap.desc}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end gap-4 border-t border-border/20 md:border-none pt-4 md:pt-0 shrink-0">
                <div className="text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-0.5">Telemetry Flag</span>
                  <span className="text-xs font-mono font-bold text-foreground bg-muted/30 px-2.5 py-1 rounded-md border border-border/10">
                    {cap.metric}
                  </span>
                </div>
                <ChevronRight size={16} className="text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-0.5 transition-all hidden md:block" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Status Footer */}
      <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-3">
        <CheckCircle2 size={16} className="text-primary shrink-0" />
        <span className="text-xs font-medium text-muted-foreground">
          System structural status: <strong className="text-foreground">Optimal.</strong> All baseline variables map perfectly to the master environment layout guidelines.
        </span>
      </div>
    </div>
  );
}