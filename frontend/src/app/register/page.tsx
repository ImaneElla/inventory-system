"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { LeftPanel, inputStyle } from "@/components/AuthComponents";
import { Logo } from "@/components/logo/logo";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
  const [step, setStep] = useState(1);
  const [showTermsModal, setShowTermsModal] = useState(false);
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.userName) setUserName(parsed.userName);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.role) setRole(parsed.role);
        if (parsed.password) setPassword(parsed.password);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        className="flex w-full min-h-[320px] min-w-[60px] md:max-w-[860px] md:min-h-[480px] bg-card/60 backdrop-blur-2xl border border-border/40 rounded-2xl overflow-hidden shadow-2xl flex-col md:flex-row m-4 "
      >
        <LeftPanel showBack onBack={() => router.push("/login")} />
        <div className="flex-1 p-8 md:p-4 flex flex-col justify-center bg-card/40 overflow-y-auto register-panel">
          <Logo className="w-14 h-14" />
          <h1 className="text-3xl font-semibold text-foreground mb-6 tracking-tight text-center">Create an account</h1>

          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex flex-col w-full"
            >
              {/* Role toggle */}
              <div className="flex bg-primary/5 border border-primary/10 rounded-full overflow-hidden mb-4 p-1 w-80 mx-auto duration-500">
                {(["MANAGER", "ADMIN"] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2 text-[13px] font-medium rounded-full transition-all border-none cursor-pointer duration-500 ${role === r ? "bg-primary text-primary-foreground shadow-sm" : "bg-transparent text-muted-foreground hover:text-foreground"}`}
                  >
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Name row */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1 ">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/50" />
                  <input className={`${inputStyle} pl-10 text-foreground`} type="text" placeholder="Full name" value={userName} onChange={e => setUserName(e.target.value)} />
                </div>
              </div>

              {/* Email */}
              <div className="mb-4 relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/50" />
                <input className={`${inputStyle} pl-10 text-foreground`} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              {/* Password */}
              <div className="mb-6 relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/50" />
                <input
                  className={`${inputStyle} pl-10 pr-10 text-foreground`}
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer flex items-center">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <Button 
                className="w-60 mx-auto cursor-pointer" 
                size="lg"
                onClick={() => {
                  if (!email || !password || !userName) { showToast("Please fill in all required fields"); return; }
                  setStep(2);
                }}
              >
                Next
              </Button>
              
              <p className="text-sm text-muted-foreground mt-6 text-center">
                Already have an account?{" "}
                <span onClick={() => router.push("/login")} className="text-primary font-medium cursor-pointer hover:underline">Log in</span>
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="flex flex-col w-full"
            >
              {/* Avatar */}
              <div className="flex flex-col items-center gap-4 mb-8 mx-auto mt-2">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-primary/5 border-2 border-dashed border-primary/20 flex items-center justify-center text-primary text-3xl font-bold overflow-hidden cursor-pointer shrink-0 relative hover:bg-primary/10 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : (userName ? userName.charAt(0).toUpperCase() : "?")}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                <div className="text-center text-sm text-muted-foreground leading-snug">
                  <strong className="block text-foreground text-base mb-1">Profile Picture</strong>
                  Optional — click to upload or skip this
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={terms} 
                  onChange={e => setTerms(e.target.checked)} 
                  className="w-4 h-4 accent-primary cursor-pointer rounded border-border" 
                />
                <label htmlFor="terms" className="text-[13px] text-muted-foreground cursor-pointer">
                  I agree to the <span onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} className="text-primary no-underline hover:underline">Terms &amp; Conditions</span>
                </label>
              </div>

              <div className="flex gap-3 w-full max-w-xs mx-auto mb-6 cursor-pointer">
                <Button 
                  variant="outline"
                  className="flex-1" 
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button 
                  className="flex-2"
                  disabled={!terms}
                  onClick={handleRegister}
                >
                  Create account
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <span onClick={() => router.push("/login")} className="text-primary font-medium cursor-pointer hover:underline">Log in</span>
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-medium z-50 shadow-lg">
          {toast}
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-6 overflow-y-auto flex-1">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Terms &amp; Conditions</h2>
              <div className="text-sm text-muted-foreground space-y-4">
                <p>Welcome to our application. By registering, you agree to the following terms:</p>
                <div>
                  <strong className="text-foreground block mb-1">1. Account Responsibilities</strong>
                  You are responsible for maintaining the confidentiality of your login credentials and for any activities that occur under your account.
                </div>
                <div>
                  <strong className="text-foreground block mb-1">2. Acceptable Use</strong>
                  You agree not to use the service for any unlawful activities or in a way that could damage, disable, or impair our systems.
                </div>
                <div>
                  <strong className="text-foreground block mb-1">3. Data Privacy</strong>
                  We respect your privacy and will handle your data in accordance with our Privacy Policy.
                </div>
                <div>
                  <strong className="text-foreground block mb-1">4. Termination</strong>
                  We reserve the right to suspend or terminate accounts that violate these terms without prior notice.
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end bg-card/50">
              <Button 
                onClick={() => setShowTermsModal(false)}
                className="px-8"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}