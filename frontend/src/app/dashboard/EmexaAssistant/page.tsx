"use client";

import {
  Activity,
  AlertTriangle,
  BarChart2,
  Plus,
  Send,
  Lock,
  History,
  X,
  MessageSquare,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/logo/logo";
import {
  createConversation,
  fetchConversations,
  fetchConversationMessages,
  sendChatMessage,
} from "@/lib/api";


interface Message {
  id: string;
  sender: "user" | "Emexa";
  text: string;
  timestamp: Date;
}

interface ConversationMeta {
  id: string;
  title: string;
  createdAt: string;
  messageCount: number;
}


function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
}

function formatRelativeDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function parseMessages(raw: { id: string; sender: string; text: string; timestamp: string }[]): Message[] {
  return raw.map((m) => ({
    id: m.id,
    sender: m.sender === "user" ? "user" : "Emexa",
    text: m.text,
    timestamp: new Date(m.timestamp),
  }));
}


export default function EmexaAssistant() {
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [userName, setUserName] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();
  const queryProcessed = useRef(false);

  const suggestions = [
    { text: "What products are low on stock?", icon: <AlertTriangle size={14} className="text-amber-400" /> },
    { text: "Give me a sales summary.", icon: <BarChart2 size={14} className="text-blue-400" /> },
    { text: "How is overall inventory health?", icon: <Activity size={14} className="text-emerald-400" /> },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserName(
        sessionStorage.getItem("userName") ||
        sessionStorage.getItem("username") ||
        "there"
      );
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    (async () => {
      try {
        const convs = await fetchConversations();
        setConversations(convs);
        if (convs.length > 0) {
          await loadConversation(convs[0].id);
        }
      } catch (e) {
        console.error("Failed to load conversations", e);
      } finally {
        setIsLoadingConversations(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const incomingQuery = searchParams.get("query");
    if (incomingQuery && !queryProcessed.current) {
      queryProcessed.current = true;
      handleSendMessage(decodeURIComponent(incomingQuery));
      const params = new URLSearchParams(searchParams.toString());
      params.delete("query");
      const newqs = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (newqs ? `?${newqs}` : "")
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadConversation = useCallback(async (id: string) => {
    setActiveId(id);
    setIsSidebarOpen(false);
    setIsLoadingMessages(true);
    try {
      const raw = await fetchConversationMessages(id);
      setMessages(parseMessages(raw));
    } catch (e) {
      console.error("Failed to load messages", e);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const handleNewChat = async () => {
    try {
      const conv = await createConversation();
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      setMessages([]);
      setIsSidebarOpen(false);
      inputRef.current?.focus();
    } catch (e) {
      console.error("Failed to create conversation", e);
    }
  };

  const handleSendMessage = useCallback(
    async (textToSend: string) => {
      if (!textToSend.trim()) return;

      let currentId = activeId;

      // If no active conversation, create one first
      if (!currentId) {
        try {
          const conv = await createConversation();
          setConversations((prev) => [conv, ...prev]);
          setActiveId(conv.id);
          currentId = conv.id;
        } catch (e) {
          console.error("Could not create conversation", e);
          return;
        }
      }

      // Optimistically add user message
      const tempUserMsg: Message = {
        id: `tmp-${Date.now()}`,
        sender: "user",
        text: textToSend,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);
      setInputText("");
      setIsTyping(true);

      try {
        const reply = await sendChatMessage(currentId, textToSend);
        const emexaMsg: Message = {
          id: reply.id,
          sender: "Emexa",
          text: reply.text,
          timestamp: new Date(reply.timestamp),
        };
        setMessages((prev) => [...prev, emexaMsg]);

        // Update conversation title in sidebar if it changed
        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentId
              ? { ...c, messageCount: c.messageCount + 2 }
              : c
          )
        );

        // Refresh titles in sidebar
        fetchConversations()
          .then((convs) => setConversations(convs))
          .catch(() => {});
      } catch (e) {
        console.error("Send message error:", e);
        const errMsg: Message = {
          id: `err-${Date.now()}`,
          sender: "Emexa",
          text: "Sorry, I couldn't reach my backend right now. Please check the server is running.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [activeId]
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col justify-between items-center px-4 py-6 overflow-hidden relative">
      {/* Background gradient */}
      <div className="bg-linear-to-b from-blue-900/50 to-background opacity-40 absolute inset-0 pointer-events-none" />

      {/* History toggle button */}
      <button
        id="emexa-sidebar-toggle"
        onClick={() => setIsSidebarOpen(true)}
        className="absolute top-6 right-6 z-20 p-2.5 cursor-pointer rounded-full bg-background/50 backdrop-blur-md border border-white/10 shadow-sm hover:bg-background/80 transition-all text-foreground"
        title="Conversation history"
      >
        <History size={20} />
      </button>

      <div className="w-full flex-1 flex flex-col justify-center items-center z-10 max-w-2xl overflow-hidden my-auto">
        <AnimatePresence mode="wait">
          {isLoadingMessages ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 text-slate-400"
            >
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <span className="text-sm font-medium">Loading conversation...</span>
            </motion.div>
          ) : messages.length === 0 ? (
            /* Welcome screen */
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col cursor-default items-center text-center space-y-3"
            >
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-blue-600/10 border border-blue-500/30 shadow-[0_0_40px_rgba(37,99,235,0.25)] animate-pulse hover:animate-none transition-all hover:scale-105">
                <Logo className="text-blue-500 h-10 w-10 mx-auto my-auto opacity-20 transition-opacity" />
                <div className="absolute inset-0 rounded-full border border-blue-500/10 blur-sm" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground mt-6">
                Hey {userName}, I'm Emexa
              </h1>
              <p className="text-slate-400 max-w-sm font-medium tracking-wide">
                Your AI inventory assistant. Ask me anything about your stock, products, or sales.
              </p>
            </motion.div>
          ) : (
            /* Chat feed */
            <motion.div
              key="chat-feed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex-1 flex flex-col overflow-y-auto px-2 py-2 scrollbar-none"
            >
              {/* Date header */}
              <div className="w-full flex flex-col items-center justify-center my-4 gap-1 pb-2">
                <Logo className="text-blue-500 h-8 w-8 mx-auto opacity-60" />
                <span className="text-xs font-semibold tracking-wider text-slate-500">
                  {messages.length > 0 ? formatRelativeDate(messages[0].timestamp.toISOString()) : "Today"}
                </span>
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500/80 uppercase tracking-wider font-semibold">
                  <Lock size={9} />
                  <span>End-to-end encrypted</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    className={`flex flex-col w-full ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    {msg.sender === "Emexa" && (
                      <div className="flex items-center gap-1.5 mb-1 ml-1">
                        <div className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                          <Sparkles size={10} className="text-blue-400" />
                        </div>
                        <span className="text-[11px] font-semibold text-blue-400">Emexa</span>
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                        msg.sender === "user"
                          ? "bg-[#007AFF] text-white rounded-2xl rounded-br-[4px] shadow-blue-900/20"
                          : "dark:bg-[#2C2C2E] bg-white text-foreground rounded-2xl rounded-bl-[4px] border border-black/5 dark:border-white/[0.06] whitespace-pre-wrap"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium">
                      {formatTime(msg.timestamp)}
                    </span>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col w-full items-start"
                  >
                    <div className="flex items-center gap-1.5 mb-1 ml-1">
                      <div className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                        <Sparkles size={10} className="text-blue-400" />
                      </div>
                      <span className="text-[11px] font-semibold text-blue-400">Emexa</span>
                    </div>
                    <div className="dark:bg-[#2C2C2E] bg-white px-4 py-3.5 rounded-2xl rounded-bl-[4px] flex items-center gap-1.5 border border-black/5 dark:border-white/[0.06]">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} className="h-2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-2xl backdrop-blur-xl rounded-3xl p-4 space-y-3 mx-auto z-10">
        <form onSubmit={handleFormSubmit} className="relative">
          <textarea
            ref={inputRef}
            id="emexa-message-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={1}
            placeholder="Ask Emexa anything about your inventory..."
            className="w-full dark:bg-[#212121] bg-white border border-slate-200 dark:border-slate-800 rounded-3xl py-3.5 pl-5 pr-14 text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:border-[#007AFF]/50 resize-none transition-all shadow-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleFormSubmit(e);
              }
            }}
          />
          <motion.button
            id="emexa-send-btn"
            type="submit"
            disabled={!inputText.trim() || isTyping}
            whileHover={inputText.trim() ? { scale: 1.05 } : {}}
            whileTap={inputText.trim() ? { scale: 0.95 } : {}}
            className="absolute top-1/2 -translate-y-1/2 right-3 h-8 w-8 bg-[#007AFF] text-white rounded-full flex items-center justify-center shadow-md transition-all disabled:opacity-30 disabled:bg-slate-400 z-20"
          >
            <Send size={14} />
          </motion.button>
        </form>

        {/* Quick suggestions (only when empty chat) */}
        {messages.length === 0 && !isLoadingMessages && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/50 justify-center"
          >
            {suggestions.map((s, i) => (
              <motion.button
                key={i}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                id={`emexa-suggestion-${i}`}
                onClick={() => handleSendMessage(s.text)}
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium rounded-xl dark:bg-[#212121] bg-white border border-slate-200 dark:border-slate-800 text-foreground shadow-sm hover:border-[#007AFF]/40 hover:text-[#007AFF] transition-all cursor-pointer whitespace-nowrap"
              >
                {s.icon}
                {s.text}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-80 bg-background/90 dark:bg-[#1C1C1E]/90 backdrop-blur-2xl border-l border-white/10 dark:border-white/5 z-50 rounded-l-[2rem] shadow-[-10px_0_40px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
            >
              {/* Sidebar header */}
              <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#007AFF]" />
                  <h2 className="text-lg font-bold text-foreground">Conversations</h2>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 scrollbar-none">
                {isLoadingConversations ? (
                  <div className="flex flex-col gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-16 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse"
                      />
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 gap-3 py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <MessageSquare size={20} className="text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">No conversations yet.</p>
                    <p className="text-xs text-slate-500">Click "New Chat" to start.</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <motion.button
                      key={conv.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      id={`conversation-${conv.id}`}
                      onClick={() => loadConversation(conv.id)}
                      className={`w-full flex flex-col text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        activeId === conv.id
                          ? "bg-[#007AFF]/10 border-[#007AFF]/30 shadow-sm"
                          : "bg-white/50 dark:bg-[#2C2C2E]/50 border-transparent hover:bg-white dark:hover:bg-[#3A3A3C] hover:border-slate-200 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[13px] font-semibold truncate leading-snug ${
                            activeId === conv.id ? "text-[#007AFF]" : "text-foreground"
                          }`}
                        >
                          {conv.title || "New Chat"}
                        </span>
                        {activeId === conv.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF] mt-1 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] text-slate-400">
                          {formatRelativeDate(conv.createdAt)}
                        </span>
                        {conv.messageCount > 0 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {conv.messageCount} msg{conv.messageCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))
                )}
              </div>

              {/* New Chat button */}
              <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <motion.button
                  id="emexa-new-chat-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNewChat}
                  className="w-full py-3 rounded-2xl bg-[#007AFF] text-white font-semibold text-sm cursor-pointer hover:bg-[#0066DD] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Plus size={16} />
                  New Chat
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}