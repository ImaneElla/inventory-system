"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { LeftPanel, inputStyle } from "@/components/AuthComponents";
import { AuthLogo } from "@/components/logo/logo";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (localStorage.getItem("auth") === "true") {
      router.replace("/dashboard");
    }
    const stored = sessionStorage.getItem("registerState");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.userName) setUserName(parsed.userName);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.role) setRole(parsed.role);
        if (parsed.password) setPassword(parsed.password);
      } catch (e) {
        console.error("Failed to parse cached register state:", e);
      }
    }
  }, [router]);

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
    
    setIsLoading(true);
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

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData
      });
      
      let data: any = {};
      try { data = await response.json(); } catch { data = { message: await response.text() }; }
      
      if (response.ok) {
        showToast(data.message || "Registration successful!"); 
        localStorage.setItem("auth", "true");
        if (data.userId)   localStorage.setItem("userId",   data.userId);
        if (data.email)    localStorage.setItem("email",    email);
        if (data.userName) localStorage.setItem("userName", data.userName);
        if (data.role)     localStorage.setItem("role",     data.role);
        if (data.imageUrl) localStorage.setItem("userImage", data.imageUrl);
        else               localStorage.removeItem("userImage");
        sessionStorage.removeItem("registerState");
        setTimeout(() => router.replace("/dashboard"), 1500);
      } else {
        showToast(data.message || "Failed to create account");
      }
    } catch (error) {
      console.error("Registration error:", error);
      showToast("Failed to connect to the server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <motion.div 
        initial={{ opacity: 0, filter: "blur(16px)", scale: 0.96, y: 15 }}
        animate={{ opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex w-full min-h-[320px] min-w-[60px] md:max-w-[900px] md:min-h-[450px] bg-white/20 border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex-col md:flex-row m-10"
      >
        <LeftPanel showBack onBack={() => router.push("/login")} />
        
        <div className="flex-1 flex flex-col bg-white/60 text-slate-900 relative">
          <div className="flex justify-center mt-6 mb-2">
            <AuthLogo className="w-14 h-14" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight text-center">
            Join Inventory System
          </h1>

          <div className="flex-1 overflow-y-auto register-panel px-4 sm:px-8">
            <div className="flex flex-col h-full max-w-[500px] mx-auto py-3">
              {/* Progress Bar */}
              <div className="flex items-center justify-center gap-1.5 mb-5 shrink-0">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-700 ease-out",
                      step >= s ? "w-10 bg-primary" : "w-5 bg-primary/10"
                    )}
                  />
                ))}
              </div>

              <div className="flex-1 flex flex-col justify-center min-h-0">
                {step === 1 && (
                  <StepRole role={role} setRole={setRole} onNext={() => setStep(2)} onLogin={() => router.push("/login")} />
                )}
                {step === 2 && (
                  <StepInfo 
                    userName={userName} setUserName={setUserName} 
                    email={email} setEmail={setEmail} 
                    password={password} setPassword={setPassword} 
                    showPwd={showPwd} setShowPwd={setShowPwd} 
                    onBack={() => setStep(1)} 
                    onNext={() => {
                      if (!email || !password || !userName) { showToast("Please fill in all required fields"); return; }
                      if (password.length < 8) { showToast("Password is too short"); return; }
                      setStep(3);
                    }} 
                    onLogin={() => router.push("/login")} 
                  />
                )}
                {step === 3 && (
                  <StepProfile 
                    userName={userName} avatarUrl={avatarUrl} fileRef={fileRef} handleAvatar={handleAvatar} 
                    terms={terms} setTerms={setTerms} onBack={() => setStep(2)} 
                    onRegister={handleRegister} isLoading={isLoading} 
                    onLogin={() => router.push("/login")} 
                    setShowTermsModal={setShowTermsModal}
                  />
                )}
              </div>
            </div>
          </div>
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

function StepRole({ role, setRole, onNext, onLogin }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col w-full text-center"
    >
      <h2 className="text-2xl font-extrabold text-foreground mb-1 tracking-tight">Choose your role</h2>
      <p className="text-sm text-muted-foreground mb-10">Select the access level for your professional account</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
        {(["MANAGER", "ADMIN"] as const).map(r => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              "flex flex-col items-center gap-5 p-8 rounded-[32px] border-2 transition-all duration-500 cursor-pointer group relative overflow-hidden",
              role === r 
                ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10 scale-[1.05]" 
                : "border-slate-200 bg-slate-50/50 hover:border-primary/40 hover:bg-primary/5 hover:scale-[1.02]"
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-700 group-hover:rotate-12 group-hover:scale-110",
              r === "ADMIN" ? "bg-linear-to-br from-blue-500 to-indigo-700 shadow-blue-500/30" : "bg-linear-to-br from-violet-500 to-purple-700 shadow-violet-500/30"
            )}>
              {r === "ADMIN" ? <Lock size={28} /> : <User size={28} />}
            </div>
            <div className="flex flex-col items-center">
              <span className="font-black text-slate-900 text-sm uppercase tracking-widest">{r}</span>
              <span className="text-[10px] text-slate-500 mt-2 leading-relaxed font-semibold max-w-[120px]">
                {r === "ADMIN" ? "Full system access & management" : "Inventory control & sales tracking"}
              </span>
            </div>
          </button>
        ))}
      </div>

      <Button className="w-60 mx-auto h-10 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 btn-gradient text-white hover:bg-primary/90" onClick={onNext}>
        Continue to Details
      </Button>
      
      <p className="text-xs text-muted-foreground mt-3 font-medium">
        Already have an account?{" "}
        <button onClick={onLogin} className="text-primary font-bold bg-transparent border-none p-0 cursor-pointer hover:underline">Sign in</button>
      </p>
    </motion.div>
  );
}

function StepInfo({ userName, setUserName, email, setEmail, password, setPassword, showPwd, setShowPwd, onBack, onNext, onLogin }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
      className="flex flex-col w-full"
    >
      <h2 className="text-2xl font-extrabold text-foreground mb-1 text-center tracking-tight">Account Details</h2>
      <p className="text-sm text-muted-foreground mb-6 text-center font-medium">Let's set up your login credentials</p>

      <div className="space-y-5 mb-6">
        <div className="relative group">
          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input className={`${inputStyle} pl-12 h-10 rounded-2xl text-slate-900 font-medium bg-slate-50 border-slate-200 focus:bg-white`} type="text" placeholder="Full Name" value={userName} onChange={e => setUserName(e.target.value)} />
        </div>
        <div className="relative group">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input className={`${inputStyle} pl-12 h-10 rounded-2xl text-slate-900 font-medium bg-slate-50 border-slate-200 focus:bg-white`} type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="relative group">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            className={`${inputStyle} pl-12 pr-12 h-10 rounded-2xl text-slate-900 font-medium bg-slate-50 border-slate-200 focus:bg-white`}
            type={showPwd ? "text" : "password"}
            placeholder="Create Secure Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button 
            type="button" onClick={() => setShowPwd(!showPwd)} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer flex items-center p-1"
            aria-label={showPwd ? "Hide password" : "Show password"}
          >
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="flex items-center gap-2 px-1">
           <div className={cn("h-1 flex-1 rounded-full bg-slate-200", password.length >= 8  && "from-red-500 via-yellow-500 to-green-500 bg-linear-to-r")} />
        </div>
        <p className="text-[10px] text-slate-400 ml-1 font-semibold italic">
          * Must contain at least 8 characters
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Button variant="outline" className="flex-1 h-10 rounded-2xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50" onClick={onBack}>Back</Button>
        <Button className="flex-2 h-10 rounded-2xl font-bold shadow-lg shadow-primary/20 btn-gradient text-white hover:bg-primary/90" onClick={onNext}>Next Step</Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-3 mb-2 text-center font-medium">
        Already have an account?{" "}
        <button onClick={onLogin} className="text-primary font-bold bg-transparent border-none p-0 cursor-pointer hover:underline">Log in</button>
      </p>
    </motion.div>
  );
}

function StepProfile({ userName, avatarUrl, fileRef, handleAvatar, terms, setTerms, onBack, onRegister, isLoading, onLogin, setShowTermsModal }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col w-full"
    >
      <h2 className="text-2xl font-extrabold text-foreground mb-1 text-center tracking-tight">Final Setup</h2>
      <p className="text-sm text-muted-foreground mb-10 text-center font-medium">Add a personal touch to your profile</p>

      <div className="flex flex-col items-center gap-5 mb-6 mx-auto">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-32 h-32 rounded-[38%] bg-primary/5 border-2 border-dashed border-primary/20 flex items-center justify-center text-primary text-5xl font-black overflow-hidden cursor-pointer shrink-0 relative hover:bg-primary/10 transition-all duration-700 hover:scale-105 hover:rounded group shadow-2xl"
          aria-label="Upload profile photo"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : (userName ? userName.charAt(0).toUpperCase() : "?")}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
            <User className="text-white rounded-2xl animate-bounce" size={28} />
          </div>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        <div className="text-center">
          <strong className="block text-foreground text-sm font-bold uppercase tracking-widest mb-1">Profile Photo</strong>
          <p className="text-[10px] text-muted-foreground italic font-medium">Optional — tap to select image</p>
        </div>
      </div>

        <div className="flex items-center justify-center gap-2 mb-6">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={terms} 
                  onChange={e => setTerms(e.target.checked)} 
                  className="w-4 h-4 accent-primary cursor-pointer rounded border-border" 
                />
                <label htmlFor="terms" className="text-[13px] roundedtext-muted-foreground cursor-pointer">
                  I agree to the <span onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} className="text-primary no-underline hover:underline">Terms &amp; Conditions</span>
                </label>
              </div>  

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Button variant="outline" className="flex-1 h-10 rounded-2xl font-bold" onClick={onBack} disabled={isLoading}>Back</Button>
        <Button className="flex-2 h-10 rounded-2xl btn-gradient font-black shadow-2xl shadow-primary/30 text-base" disabled={!terms} onClick={onRegister} isLoading={isLoading}>Finish Account</Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-4 mb-3 text-center font-medium">
        Want to go back?{" "}
        <button onClick={onLogin} className="text-primary font-bold bg-transparent border-none p-0 cursor-pointer hover:underline">Log in</button>
      </p>
    </motion.div>
  );
}