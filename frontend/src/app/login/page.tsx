"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { LeftPanel, inputStyle, submitBtnStyle } from "@/components/AuthComponents";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleLogin = () => {
    if (!email || !password) { showToast("Please fill in all fields"); return; }
    showToast("Logging in…");
  };

  return (
    <div className="login-wrapper">
      <motion.div 
        initial={{ opacity: 0, filter: "blur(16px)", scale: 0.96, y: 15 }}
        animate={{ opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex w-full max-w-[860px] min-h-[480px] bg-white/60 backdrop-blur-2xl border border-white/40 rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(30,60,120,0.15)] flex-col md:flex-row m-4"
      >
        <LeftPanel />
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center bg-white/40">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-8">
            No account?{" "}
            <span onClick={() => router.push("/register")} className="text-blue-600 font-medium cursor-pointer hover:underline">Create one</span>
          </p>

          {/* Email */}
          <div className="mb-4 relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black" />
            <input className={`${inputStyle} pl-10 text-black/70`} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          {/* Password */}
          <div className="mb-8 relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black" />
            <input
              className={`${inputStyle} pl-10 pr-10 text-black/70`}
              type={showPwd ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer flex items-center">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button className={submitBtnStyle} onClick={handleLogin}>Log in</button>
        </div>
      </motion.div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium z-50 shadow-lg top-[auto]">
          {toast}
        </div>
      )}
    </div>
  );
}