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
            viewBox="0 0 70 70" 
            className="w-14 h-14 text-primary mx-auto mb-4" 
            fill="currentColor"
          >
            <g>
              <path d="M67.142,23.641L55.405,10.456c-0.379-0.423-0.92-0.873-1.488-0.873h-37.98c-0.568,0-1.109,0.45-1.489,0.874L2.711,23.752 c-0.691,0.771-0.68,1.94,0.025,2.697L33.462,59.46c0.378,0.407,0.909,0.638,1.464,0.638s1.086-0.257,1.464-0.664l30.728-33.042 C67.822,25.634,67.833,24.411,67.142,23.641z M46.555,25.583L34.902,53.414L22.608,25.583H46.555z M21.725,23.583l-4.417-10h34.272 l-4.188,10H21.725z M32.231,52.152L7.586,25.583h12.879L32.231,52.152z M48.702,25.583H62c0.094,0,0.179-0.029,0.265-0.054 L37.462,52.318L48.702,25.583z M61.871,23.583H49.543l3.971-9.447L61.871,23.583z M15.714,14.851l3.867,8.732H8.027L15.714,14.851z " />
            </g>
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