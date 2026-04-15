"use client";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

export function LeftPanel({ showBack, onBack }: { showBack?: boolean; onBack?: () => void }) {
  const router = useRouter();
  return (
    <div className="relative hidden md:flex flex-col shrink-0 overflow-hidden w-[40%] bg-blue-900">
      {/* Image background */}
      <div className="absolute inset-0 w-full h-full">
        <img src="/login-bg.jpg" alt="Login Background" className="w-full h-full object-cover cursor-default" />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-[#0a1e50]/60" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6">
        <span 
          className="text-white text-2xl font-bold tracking-tighter cursor-default font-[Montserrat]" 
          onClick={() => router.push("/login")}
        >
          IMN
        </span>
        {showBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-2 py-1 text-[11px] text-white bg-white/20 backdrop-blur-md border border-white/30 rounded-full hover:bg-white/30 transition cursor-pointer hover:scale-105 duration-400"
          >
            <ArrowLeft size={11} /> Back to login
          </button>
        )}
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-8 left-6 right-6 z-10 cursor-default">
        <p className="text-white text-xl font-medium leading-tight mb-4 drop-shadow-md">
          Secure, manage,<br />and scale your inventory
        </p>
        <div className="flex gap-1.5">
          {[18, 18, 30].map((w, i) => (
            <div 
              key={i} 
              className={`h-1 !rounded-full ${i === 2 ? "bg-white" : "bg-white/40"}`} 
              style={{ width: w }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function OAuthModal({ provider, onClose }: { provider: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white/80 backdrop-blur-2xl border border-white/50 rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Connecting to {provider}</h3>
        <p className="text-sm text-gray-500 mb-6">
          You'll be redirected to {provider} to sign in securely
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 text-sm text-gray-600 bg-transparent border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export const inputStyle = "w-full bg-white/50 border border-slate-200 rounded-md px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all backdrop-blur-sm";

export const submitBtnStyle = "inline-flex w-full items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-600/90 h-10 px-4 py-2 mb-4 shadow-sm";
