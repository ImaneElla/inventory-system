"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Copy,
  Check,
  MessageCircle,
  Link2,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

// =========================
// TYPES
// =========================

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
}

// =========================
// HELPERS
// =========================

function generateInviteToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: 32 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// =========================
// COMPONENT
// =========================

export function InviteUserModal({ open, onClose }: InviteUserModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailOpened, setEmailOpened] = useState(false);

  const appBaseUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  // -------------------------
  // GENERATE LINK
  // -------------------------

  const handleGenerate = async () => {
    setGenerating(true);

    // TODO: Replace this mock with a real API call, e.g.:
    // const res = await fetch("/api/admin/invites", {
    //   method: "POST",
    //   body: JSON.stringify({ email, role }),
    //   headers: { "Content-Type": "application/json" },
    // });
    // const { token } = await res.json();
    // For security, the token should come from the server, not be client-generated.

    await new Promise((r) => setTimeout(r, 900));
    const token = generateInviteToken();
    const link = `${appBaseUrl}/register?invite=${token}&role=${role}${
      email ? `&email=${encodeURIComponent(email)}` : ""
    }`;
    setInviteLink(link);
    setGenerating(false);
  };

  // -------------------------
  // COPY
  // -------------------------

  const handleCopy = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // -------------------------
  // EMAIL
  // -------------------------

  const handleEmail = () => {
    if (!inviteLink) return;
    const subject = encodeURIComponent(
      "You've been invited to join the dashboard"
    );
    const body = encodeURIComponent(
      `Hi,\n\nYou've been invited to join our admin dashboard as a ${role}.\n\nClick the link below to set up your account:\n\n${inviteLink}\n\nThis link expires in 48 hours.\n\nIf you didn't expect this, you can safely ignore this email.`
    );
    const recipient = email ? encodeURIComponent(email) : "";
    window.open(`mailto:${recipient}?subject=${subject}&body=${body}`, "_blank");
    setEmailOpened(true);
    setTimeout(() => setEmailOpened(false), 2000);
  };

  // -------------------------
  // WHATSAPP
  // -------------------------

  const handleWhatsApp = () => {
    if (!inviteLink) return;
    const message = encodeURIComponent(
      `You've been invited to join the dashboard as a ${role}. Set up your account here: ${inviteLink}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  // -------------------------
  // RESET / CLOSE
  // -------------------------

  const handleReset = () => {
    setInviteLink(null);
    setEmail("");
    setRole("USER");
    setCopied(false);
    setEmailOpened(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // =========================
  // RENDER
  // =========================

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          {/* MODAL */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">

              {/* ========================= */}
              {/* MODAL HEADER */}
              {/* ========================= */}

              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    Invite Someone
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Generate a link and share it however you like
                  </p>
                </div>

                <button
                  onClick={handleClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 pb-6 space-y-4">

                <AnimatePresence mode="wait">

                  {/* ========================= */}
                  {/* STEP 1 — CONFIGURE */}
                  {/* ========================= */}

                  {!inviteLink ? (
                    <motion.div
                      key="configure"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-4"
                    >

                      {/* EMAIL */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-foreground">
                          Email address{" "}
                          <span className="font-normal text-muted-foreground">
                            (optional)
                          </span>
                        </label>
                        <div className="flex items-center gap-3 bg-background border border-border rounded-2xl px-4 h-12 focus-within:border-primary/50 transition-colors">
                          <Mail size={15} className="text-muted-foreground shrink-0" />
                          <input
                            type="email"
                            placeholder="colleague@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm"
                          />
                        </div>
                      </div>

                      {/* ROLE */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-foreground">
                          Role
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {(["USER", "ADMIN"] as const).map((r) => (
                            <button
                              key={r}
                              onClick={() => setRole(r)}
                              className={`h-11 rounded-2xl text-sm font-bold transition-all border ${
                                role === r
                                  ? "btn-gradient text-white border-transparent shadow-lg shadow-primary/20"
                                  : "bg-muted/40 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                              }`}
                            >
                              {r === "ADMIN" ? " Admin" : " User"}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {role === "ADMIN"
                            ? "Full access — can manage users, projects, and settings."
                            : "Standard access — can view and interact with content."}
                        </p>
                      </div>

                      {/* GENERATE */}
                      <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full h-12 rounded-2xl btn-gradient text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-70"
                      >
                        {generating ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            Generating link…
                          </>
                        ) : (
                          <>
                            <Link2 size={15} />
                            Generate Invite Link
                          </>
                        )}
                      </button>

                    </motion.div>

                  ) : (

                    /* ========================= */
                    /* STEP 2 — SHARE */
                    /* ========================= */

                    <motion.div
                      key="share"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-4"
                    >

                      {/* LINK DISPLAY */}
                      <div className="bg-muted/40 border border-border rounded-2xl p-4">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-2">
                          Invite Link · expires in 48h
                        </p>
                        <p className="text-xs text-foreground font-mono break-all leading-relaxed select-all cursor-text">
                          {inviteLink}
                        </p>
                      </div>

                      {/* SHARE OPTIONS */}
                      <div className="grid grid-cols-3 gap-3">

                        {/* EMAIL */}
                        <button
                          onClick={handleEmail}
                          className="flex flex-col items-center justify-center cursor-pointer gap-2 h-20 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 transition-all border border-blue-500/20 hover:border-blue-500/40"
                        >
                          <motion.div
                            key={emailOpened ? "check" : "mail"}
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.15 }}
                          >
                            {emailOpened ? <Check size={20} /> : <Mail size={20} />}
                          </motion.div>
                          <span className="text-xs font-bold">
                            {emailOpened ? "Opened!" : "Email"}
                          </span>
                        </button>

                        {/* WHATSAPP */}
                        <button
                          onClick={handleWhatsApp}
                          className="flex flex-col items-center justify-center cursor-pointer gap-2 h-20 rounded-2xl bg-green-500/10 hover:bg-green-500/20 text-green-600 transition-all border border-green-500/20 hover:border-green-500/40"
                        >
                          <MessageCircle size={20} />
                          <span className="text-xs font-bold">WhatsApp</span>
                        </button>

                        {/* COPY */}
                        <button
                          onClick={handleCopy}
                          className="flex flex-col items-center justify-center cursor-pointer gap-2 h-20 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 transition-all border border-purple-500/20 hover:border-purple-500/40"
                        >
                          <motion.div
                            key={copied ? "check" : "copy"}
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.15 }}
                          >
                            {copied ? <Check size={20} /> : <Copy size={20} />}
                          </motion.div>
                          <span className="text-xs font-bold">
                            {copied ? "Copied!" : "Copy Link"}
                          </span>
                        </button>

                      </div>

                      {/* GENERATE ANOTHER */}
                      <button
                        onClick={handleReset}
                        className="w-full h-10 rounded-2xl btn-gradient sm font-bold transition-all border border-border cursor-pointer"
                      >
                        <span className="flex items-center justify-center gap-2 ">
                          <ArrowLeft size={16} />
                          Generate a new link
                        </span>
                      </button>

                    </motion.div>

                  )}

                </AnimatePresence>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}