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
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const message = await response.text();
      
      if (response.ok) {
        showToast("Login Successful!");
        localStorage.setItem("auth", "true");
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }
        setTimeout(() => router.replace("/dashboard"), 1500);
      } else {
        showToast(message || "Invalid credentials");
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
        initial={{ opacity: 0, filter: "blur(16px)", scale: 0.96, y: 15 }}
        animate={{ opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex w-full max-w-[860px] min-h-[480px] bg-card/60 backdrop-blur-2xl border border-border/40 rounded-2xl overflow-hidden shadow-2xl flex-col md:flex-row m-4 z-10"
      >
        <LeftPanel />
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center bg-card/40 text-center">
          <div className="flex justify-center mb-4">
            <Logo className="w-16 h-16" />
          </div>
          <h1 className="text-3xl text-foreground mb-2 tracking-tight font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-8">
            No account?{" "}
            <span onClick={() => router.push("/register")} className="text-primary font-medium cursor-pointer hover:underline">Create one</span>
          </p>

          <div className="mb-4 relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/50" />
            <input className={`${inputStyle} pl-10 text-foreground`} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="mb-4 relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/50" />
            <input
              className={`${inputStyle} pl-10 pr-10 text-foreground`}
              type={showPwd ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button 
              onClick={() => setShowPwd(v => !v)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer flex items-center"
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="flex items-center justify-between mb-8 px-1">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
              />
              Remember me
            </label>
            <span className="text-sm text-primary font-medium cursor-pointer hover:underline">{` `}</span>
          </div>

          <Button 
            className="w-full md:w-60 mx-auto"
            size="lg"
            onClick={handleLogin}
            isLoading={isLoading}
          >
            Log in
          </Button>
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