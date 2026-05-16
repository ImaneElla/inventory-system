"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { LeftPanel, inputStyle } from "@/components/AuthComponents";
import { Logo } from "@/components/logo/logo";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (localStorage.getItem("auth") === "true") {
      router.replace("/dashboard");
    }
  }, [router]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleLogin = async () => {
    if (!email || !password) { showToast("Please fill in all fields"); return; }
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      let data: { userName?: string; role?: string; message?: string; imageUrl?: string } = {};
      try { data = await response.json(); } catch { data = { message: await response.text() }; }
      
      if (response.ok) {
        showToast("Login Successful ");
        localStorage.setItem("auth", "true");
        if (data.userName) localStorage.setItem("userName", data.userName);
        if (data.role)     localStorage.setItem("role",     data.role);
        if (data.imageUrl) localStorage.setItem("userImage", data.imageUrl);
        else               localStorage.removeItem("userImage");
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }
        setTimeout(() => router.replace("/dashboard"), 1500);
      } else {
        showToast(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("Failed to connect to the server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper relative min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, filter: "blur(20px)", scale: 0.95, y: 20 }}
        animate={{ opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full max-w-[900px] min-h-[550px] bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] flex-col md:flex-row z-10"
      >
        <LeftPanel />
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white text-slate-900 text-center relative overflow-hidden">
          {/* Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -ml-32 -mb-32" />

          <div className="relative z-10 max-w-[420px] mx-auto">
            <div className="flex justify-center mb-6">
              <Logo className="w-16 h-16 drop-shadow-sm" />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-sm text-slate-500 mb-6 font-medium">Please enter your credentials to access your workspace</p>

            <div className="space-y-5 mb-4">
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  className={`${inputStyle} pl-12 h-10 rounded-2xl text-slate-900 font-medium shadow-sm bg-slate-50 border-slate-200 focus:bg-white`} 
                  type="email" 
                  placeholder="Email Address" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                />
              </div>

              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  className={`${inputStyle} pl-12 pr-12 h-10 rounded-2xl text-slate-900 font-medium shadow-sm bg-slate-50 border-slate-200 focus:bg-white`}
                  type={showPwd ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPwd(v => !v)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer flex items-center p-1"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-10 px-1">
              <label className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer select-none font-medium hover:text-slate-900 transition-colors">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-slate-200 accent-primary cursor-pointer transition-all"
                />
                Remember me
              </label>
              <button type="button" className="text-sm text-primary font-bold hover:underline bg-transparent border-none cursor-pointer">
                Forgot password?
              </button>
            </div>

            <Button 
              className="w-50 h-10 rounded-2xl text-base font-black shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 text-white"
              onClick={handleLogin}
              isLoading={isLoading}
            >
              Sign In
            </Button>

            <p className="text-sm text-slate-500 mt-6 font-medium">
              New here?{" "}
              <button 
                type="button"
                onClick={() => router.push("/register")} 
                className="text-primary font-black cursor-pointer hover:underline bg-transparent border-none"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </motion.div>

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-medium z-50 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}