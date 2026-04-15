"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { LeftPanel, inputStyle} from "@/components/AuthComponents";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
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
    showToast("Logging in…");
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const message = await response.text();
      
      if (response.ok) {
        showToast(message);
        localStorage.setItem("auth", "true"); // Issue token
        setTimeout(() => router.replace("/dashboard"), 1500); // Use replace safely
      } else {
        showToast(message || "Invalid credentials");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
       showToast("Failed to connect to the server");
    }
  };

  return (
    <div className="login-wrapper">
      <motion.div 
        initial={{ opacity: 0, filter: "blur(16px)", scale: 0.96, y: 15 }}
        animate={{ opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex w-full max-w-[860px] min-h-[480px] bg-card/60 backdrop-blur-2xl border border-border/40 rounded-2xl overflow-hidden shadow-2xl flex-col  md:flex-row m-4"
      >
        <LeftPanel />
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center bg-card/40 text-center">
        <svg 
            viewBox="-51.2 -51.2 614.4 614.4" 
            className="w-16 h-16 text-blue-600 mx-auto mb-4" 
            fill="currentColor"
          >
            <path d="M509.202,179.961l-89.051-133.57c-3.146-4.718-8.433-7.434-13.891-7.434H105.738c-5.561,0-10.802,2.801-13.891,7.434 L2.795,179.961c-4.204,6.3-3.624,14.732,1.456,20.403l239.312,267.139c6.605,7.374,18.242,7.401,24.872,0l239.312-267.139 C512.74,194.789,513.481,186.373,509.202,179.961z M382.168,72.348l-30.925,82.469l-61.852-82.469H382.168z M322.784,172.525 h-133.57l66.785-89.046L322.784,172.525z M222.605,72.348l-61.851,82.469l-30.926-82.469H222.605z M101.548,92.034l30.183,80.492 H47.884L101.548,92.034z M54.059,205.918h90.194l64.937,173.17L54.059,205.918z M255.998,408.809l-76.081-202.891H332.08 L255.998,408.809z M302.806,379.087l64.937-173.17h90.194L302.806,379.087z M380.264,172.526l30.185-80.492l53.664,80.492H380.264 z" />
          </svg>
          <h1 className="text-3xl text-foreground mb-2 tracking-tight font-bold ">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-8">
            No account?{" "}
            <span onClick={() => router.push("/register")} className="text-primary font-medium cursor-pointer hover:underline">Create one</span>
          </p>

          {/* Email */}
          <div className="mb-4 relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/50" />
            <input className={`${inputStyle} pl-10 text-foreground`} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          {/* Password */}
          <div className="mb-8 relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/50" />
            <input
              className={`${inputStyle} pl-10 pr-10 text-foreground`}
              type={showPwd ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button 
            onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer flex items-center">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button 
          className="w-60 mx-auto bg-primary text-primary-foreground py-3 rounded-full font-medium hover:bg-primary/90 transition-colors duration-200 shadow-lg hover:shadow-primary/30"
          type="button"
          onClick={handleLogin}>Log in</button>
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