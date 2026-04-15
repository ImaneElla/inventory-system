"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { LeftPanel, inputStyle, submitBtnStyle } from "@/components/AuthComponents";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [role, setRole] = useState<"MANAGER" | "ADMIN">("MANAGER");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [terms, setTerms] = useState(true);
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reverse auth guard logic: prevent logged in users from viewing register form
    if (localStorage.getItem("auth") === "true") {
      router.replace("/dashboard");
    }

    // Attempt to pull user data safely out of sessionStorage if they navigated away
    const stored = sessionStorage.getItem("registerState");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.userName) setUserName(parsed.userName);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.role) setRole(parsed.role);
        if (parsed.password) setPassword(parsed.password);
      } catch (e) {
        console.error("Failed to parse cached register state.");
      }
    }
  }, [router]);

  // Hook to instantly mirror user typing to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("registerState", JSON.stringify({ userName, email, role, password }));
  }, [userName, email, role, password]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
      setAvatarFile(file);
    }
  };

  const handleRegister = async () => {
    if (!terms) { showToast("Please accept the Terms & Conditions"); return; }
    if (!email || !password || !userName) { showToast("Please fill in all required fields"); return; }
    showToast("Creating account...");
    
    try {
      const formData = new FormData();
      formData.append("userName", userName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      if (avatarFile) {
        formData.append("image", avatarFile);
      }

      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        body: formData
      });
      
      const message = await response.text();
      
      if (response.ok) {
        showToast(message); 
        localStorage.setItem("auth", "true");
        sessionStorage.removeItem("registerState"); // Cleanup
        setTimeout(() => router.replace("/dashboard"), 1500);
      } else {
        showToast(message || "Failed to create account");
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
        className="flex w-full max-w-[860px] min-h-[540px] bg-white/60 backdrop-blur-2xl border border-white/40 rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(30,60,120,0.15)] flex-col md:flex-row m-4 "
      >
        <LeftPanel showBack onBack={() => router.push("/login")} />
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center bg-white/40 overflow-y-auto register-panel">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">Create an account</h1>
          <p className="text-sm text-gray-500 mb-6">
            Already have an account?{" "}
            <span onClick={() => router.push("/login")} className="text-blue-600 font-medium cursor-pointer hover:underline">Log in</span>
          </p>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-14 h-14 rounded-full bg-blue-50/50 border-2 border-dashed border-blue-200 flex items-center justify-center text-blue-600 text-xl font-bold overflow-hidden cursor-pointer shrink-0 relative hover:bg-blue-100/50 transition-colors"
            >
              {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : (userName ? userName.charAt(0).toUpperCase() : "?")}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            <div className="text-xs text-gray-400 leading-snug">
              <strong className="block text-gray-600 text-[13px]">Profile Picture</strong>
              Optional — click to upload
            </div>
          </div>

          {/* Role toggle */}
          <div className="flex bg-blue-50/50 border border-blue-100 rounded-xl overflow-hidden mb-4 p-1 duration-500">
            {(["MANAGER", "ADMIN"] as const).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-[13px] font-medium rounded-lg transition-all border-none cursor-pointer duration-500 ${role === r ? "bg-blue-600 text-white shadow-sm" : "bg-transparent text-gray-400 hover:text-gray-600"}`}
              >
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Name row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="relative flex-1 ">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black" />
              <input className={`${inputStyle} pl-10 text-black/70`} type="text" placeholder="Full name" value={userName} onChange={e => setUserName(e.target.value)} />
            </div>
           
          </div>

          {/* Email */}
          <div className="mb-3 relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black" />
            <input className={`${inputStyle} pl-10 text-black/70`} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          {/* Password */}
          <div className="mb-4 relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black" />
            <input
              className={`${inputStyle} pl-10 pr-10 text-black/70`}
              type={showPwd ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer flex items-center">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Terms */}
          <div className="flex items-center gap-2 mb-6">
            <input 
              type="checkbox" 
              id="terms" 
              checked={terms} 
              onChange={e => setTerms(e.target.checked)} 
              className="w-4 h-4 accent-blue-600 cursor-pointer rounded border-gray-300" 
            />
            <label htmlFor="terms" className="text-[13px] text-gray-500 cursor-pointer">
              I agree to the <Link href="/terms" className="text-blue-600 no-underline hover:underline">Terms &amp; Conditions</Link>
            </label>
          </div>

          <button className={submitBtnStyle} onClick={handleRegister}>Create account</button>
        </div>
      </motion.div>

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium z-50 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}