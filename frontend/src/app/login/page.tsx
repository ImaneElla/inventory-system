"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { LeftPanel, inputStyle } from "@/components/AuthComponents";
import { AuthLogo } from "@/components/logo/logo";
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
      let data: { userId?: string; userName?: string; role?: string; email?: string; message?: string; imageUrl?: string } = {};
      const text = await response.text();
      try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
      
      if (response.ok) {
        showToast("Login Successful ");
        localStorage.setItem("auth", "true");
        if (data.userId)   localStorage.setItem("userId",   data.userId);
        if (data.email)    localStorage.setItem("email",    data.email);
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
        className="flex w-full max-w-[900px] min-h-[550px] bg-white/20 border border-slate-200 rounded-[32px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] flex-col md:flex-row z-10"
      >
        <LeftPanel />
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white/60 text-slate-900 text-center relative overflow-hidden">
          {/* Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -ml-32 -mb-32" />

          <div className="relative z-10 max-w-[420px] mx-auto">
            <div className="flex justify-center mb-6">
              <AuthLogo className="w-16 h-16 drop-shadow-sm" />
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
              className="w-50 h-10 rounded-2xl text-base font-black shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all btn-gradient hover:bg-primary/90 text-white"
              onClick={handleLogin}
              isLoading={isLoading}
            >
              Sign In
            </Button>

            {/* Social Login */}
            <div className="mt-8 flex items-center justify-center space-x-4">
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-xs font-medium text-slate-400">Or continue with</span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button 
                type="button" 
                onClick={() => showToast("Google Login not yet implemented")}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button 
                type="button" 
                onClick={() => showToast("GitHub Login not yet implemented")}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-2xl bg-[#0f172a] text-white text-sm font-bold shadow-sm hover:bg-[#1e293b] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </button>
            </div>

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
        <div className="fixed top-6 left-1/2 -translate-x-1/2 btn-gradient  px-6 py-2 rounded-full text-sm font-medium z-50 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}