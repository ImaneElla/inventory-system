"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "./logo/logo";

export default function SplashSuccess() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 700);

    const redirect = setTimeout(() => {
      router.push("/dashboard");
    }, 3500);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center backdrop-blur-3xl bg-white/40">
      <div className="text-center p-10 rounded-[40px] border border-white/20 bg-white/10 shadow-2xl">
       
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center justify-center">
             <Logo className="w-16 h-16 animate-pulse" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-800 mb-2">
          IMN - Inventory Management
        </h1>
        <p className="text-slate-500 text-lg mb-8">
          For a easy and simple life ...
        </p>

        {/* Loading bar Apple Style */}
        <div className="w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden mx-auto">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-linear"
            style={{ width: `${(5 - countdown) * 20}%` }}
          />
        </div>
        
        <p className="mt-4 text-xs text-slate-400 uppercase tracking-widest">
          Entering in {countdown}s...
        </p>
      </div>
    </div>
  );
}