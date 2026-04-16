"use client";
import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect } from "react"; 
import { useRouter } from "next/navigation";

export function SplashSuccess() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    const redirect = setTimeout(() => router.push("/dashboard"), 5000);
    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center backdrop-blur-[50px] bg-white/20">
      <div className="text-center animate-in fade-in zoom-in duration-700">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-primary rounded-[28%] flex items-center justify-center shadow-2xl shadow-primary/20 animate-pulse">
             <span className="text-white font-extrabold text-4xl tracking-tighter">IMN</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
          IMN Inventory Management
        </h1>
        <p className="text-slate-600 text-lg mb-8 font-light italic">
          For a easy and simple life
        </p>
        <div className="w-64 h-1 bg-slate-200/50 rounded-full overflow-hidden mx-auto backdrop-blur-md">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-linear"
            style={{ width: `${(5 - countdown) * 20}%` }}
          />
        </div>
        <p className="mt-4 text-[10px] text-slate-500 uppercase tracking-[0.3em] font-medium">
          Entering Dashboard in {countdown}s
        </p>
      </div>
    </div>
  );
}

export function LeftPanel({ showBack, onBack }: { showBack?: boolean; onBack?: () => void }) {
  const router = useRouter();
  
  return (
    <div className="relative hidden md:flex flex-col shrink-0 overflow-hidden w-[40%] bg-blue-900">
      <div className="absolute inset-0 w-full h-full">
        <img src="/login-bg.jpg" alt="Login Background" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/60" />

      <div className="relative z-10 flex items-center justify-between px-6 pt-6">
        <span 
          className="text-white text-2xl font-bold tracking-tighter cursor-pointer font-[Montserrat]" 
          onClick={() => router.push("/login")}
        >
          IMN
        </span>
        {showBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-white bg-white/10 backdrop-blur-xl border border-white/20 rounded-full hover:bg-white/20 transition-all hover:scale-105"
          >
            <ArrowLeft size={11} /> Back to login
          </button>
        )}
      </div>

      <div className="absolute bottom-10 left-8 right-8 z-10">
        <p className="text-white text-2xl font-semibold leading-tight mb-5 drop-shadow-xl">
          Secure, manage,<br />and scale your inventory
        </p>
        <div className="flex gap-2">
          {[18, 18, 40].map((w, i) => (
            <div key={i} className={`h-1 rounded-full ${i === 2 ? "bg-white" : "bg-white/30"}`} style={{ width: w }} />
          ))}
        </div>
      </div>
    </div>
  );
}


export function OAuthModal({ provider, onClose }: { provider: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white/80 backdrop-blur-2xl border border-white/20 rounded-[32px] p-10 w-full max-w-sm text-center shadow-2xl">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Connecting</h3>
        <p className="text-sm text-slate-500 mb-8">Redirecting to {provider} securely...</p>
        <button onClick={onClose} className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

export const inputStyle = "w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all backdrop-blur-sm placeholder:text-slate-400";
export const submitBtnStyle = "w-full bg-primary text-white rounded-xl h-12 font-semibold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 mb-4";