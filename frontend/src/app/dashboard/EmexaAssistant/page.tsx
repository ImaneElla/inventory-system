"use client";

import { 
  Activity, 
  AlertTriangle, 
  BarChart2, 
  FileUp, 
  FolderOpen, 
  ImageIcon, 
  Plus, 
  Send, 
  Lock, 
  History,
  MessageCircle,
  X,
  MessageSquare
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { Logo } from "@/components/logo/logo";

interface Message {
  id: string;
  sender: "user" | "Emexa";
  text: string;
  timestamp: Date;
}

// Dummy interface for your future real backend data
interface Conversation {
  id: string;
  title: string;
  date: string;
}

export default function EmexaAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [showOptions, setShowOptions] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Hook interfaces for routing parameters
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryProcessed = useRef(false);

  // Suggestions data array
  const suggestions = [
    { text: "Check Low Stock?", icon: <AlertTriangle size={26} className="btn-gradient rounded-2xl p-1" /> },
    { text: "Generate Report?", icon: <BarChart2 size={26} className="btn-gradient rounded-2xl p-1" /> },
    { text: "Analyze Sales Data?", icon: <Activity size={26} className="btn-gradient rounded-2xl p-1" /> }
  ];

  // Dummy conversation history for the sidebar (Replace with API call later)
  const conversationHistory: Conversation[] = [
    { id: "c1", title: "Spring Boot Setup", date: "Today" },
    { id: "c2", title: "Q3 Sales Analysis", date: "Yesterday" },
    { id: "c3", title: "Inventory Restock", date: "Last Week" },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = sessionStorage.getItem("userName") || sessionStorage.getItem("username") || "Imane";
      setUserName(storedName);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const emexaResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "Emexa",
        text: `I received your message: "${textToSend}". I'm ready to connect to your Spring Boot backend!`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, emexaResponse]);
      setIsTyping(false);
    }, 1200);
  };

  useEffect(() => {
    const incomingQuery = searchParams.get("query");
    
    if (incomingQuery && !queryProcessed.current) {
      queryProcessed.current = true;
      handleSendMessage(decodeURIComponent(incomingQuery));

      const params = new URLSearchParams(searchParams.toString());
      params.delete("query");
      const newQueryString = params.toString();
      const targetUrl = window.location.pathname + (newQueryString ? `?${newQueryString}` : "");
      
      window.history.replaceState(null, "", targetUrl);
    }
  }, [searchParams]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "numeric", hour12: true }).format(date);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col justify-between items-center px-4 py-6 overflow-hidden relative">
      <div className="bg-linear-to-b from-blue-900/50 to-background opacity-40 absolute inset-0 pointer-events-none"></div>

      {/* Top Right Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="absolute top-6 right-6 z-20 p-2.5 cursor-pointer rounded-full bg-background/50 backdrop-blur-md border border-white/10 shadow-sm hover:bg-background/80 transition-all text-foreground"
      >
        <History size={20} />
      </button>

      {/* ============ Dynamic Content Area =============== */}
      <div className="w-full flex-1 flex flex-col justify-center items-center z-10 max-w-2xl overflow-hidden my-auto">
        <AnimatePresence mode="wait">
          {messages.length <= 0 ? (
            /* ============ Empty State / Welcome =============== */
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col cursor-default items-center text-center space-y-3"
            >
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-blue-600/10 border border-blue-500/30 shadow-[0_0_40px_rgba(37,99,235,0.25)] animate-pulse hover:animate-none transition-all hover:scale-105">
                <Logo className="text-blue-500 h-10 w-10 animate-pulse mx-auto my-auto opacity-20 transition-opacity" />
                <div className="absolute inset-0 rounded-full border border-blue-500/10 blur-sm"></div>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground mt-6">
                Welcome {userName}, I'm Emexa
              </h1>
              <p className="text-slate-400 max-w-sm font-medium tracking-wide">
                How can I help you today?
              </p>
            </motion.div>
          ) : (
            /* ============ Active Chat Feed =============== */
            <motion.div
              key="chat-feed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex-1 flex flex-col overflow-y-auto px-4 py-2 scrollbar-none"
            >
              {/*  Encrypted Header */}
              <div className="w-full flex flex-col items-center justify-center my-6 gap-1.5 pb-4">
                <Logo className="text-blue-500 h-8 w-8 mx-auto my-auto transition-opacity" />
                <span className="text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-400 ">
                  Today {formatTime(messages[0].timestamp)}
                </span>
                <div className="flex items-center gap-1.5 text-[9px] text-slate-700/80 uppercase tracking-wider font-semibold">
                  <Lock size={10} />
                  <span>Encrypted</span>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex flex-col gap-5">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col w-full ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    {/*  Bubbles */}
                    <div
                      className={`max-w-[75%] px-4 py-2.5 text-[15px] font-normal leading-relaxed shadow-sm ${
                        msg.sender === "user"
                          ? "bg-[#007AFF] text-white rounded-2xl rounded-br-[0px] rounded-shadow-md shadow-blue-900/20"
                          : "dark:bg-[#3A3A3C] bg-background text-foreground rounded-2xl rounded-bl-[0px] border border-black/5 dark:border-white/5"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {/*  Timestamps */}
                    <span className="text-[10px] text-slate-400 mt-1.5 px-1 font-medium">
                      {msg.sender === "user"}
                      {formatTime(msg.timestamp)}
                    </span>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col w-full items-start"
                  >
                    <div className="dark:bg-[#3A3A3C] bg-[#E9E9EB] px-4 py-3.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5 border border-black/5 dark:border-white/5">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} className="h-2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============ Chat Box =============== */}
      <div className="w-full max-w-2xl backdrop-blur-xl rounded-3xl p-5 space-y-3 mx-auto z-10">
        <form onSubmit={handleFormSubmit} className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={1}
            placeholder="Ask me anything..."
            className="w-full dark:bg-[#212121] bg-background border border-slate-200 dark:border-slate-800 rounded-3xl py-3.5 pl-14 pr-14 mx-auto text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:border-[#007AFF]/50 resize-none transition-all shadow-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleFormSubmit(e);
              }
            }}
          />

          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowOptions(!showOptions)}
            className="absolute top-6 -translate-y-1/2 left-3 h-8 w-8 text-slate-400 hover:text-foreground rounded-full cursor-pointer font-bold flex items-center justify-center transition-all"
          >
            <Plus size={22} className={`transition-transform duration-200 ${showOptions ? "rotate-45 text-[#007AFF]" : ""}`} />
          </motion.button>

          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                transition={{ type: "spring", duration: 0.25 }}
                className="absolute bottom-16 left-0 bg-background/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-2xl flex flex-col gap-1 w-48 z-30"
              >
                <button type="button" onClick={() => setShowOptions(false)} className="flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl text-foreground/70 hover:text-foreground hover:bg-blue-500/10 transition-all text-left">
                  <ImageIcon size={16} className="text-[#007AFF]" /> <span>Photos</span>
                </button>
                <button type="button" onClick={() => setShowOptions(false)} className="flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl text-foreground/70 hover:text-foreground hover:bg-amber-500/10 transition-all text-left">
                  <FileUp size={16} className="text-amber-500" /> <span>Documents</span>
                </button>
                <button type="button" onClick={() => setShowOptions(false)} className="flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl text-foreground/70 hover:text-foreground hover:bg-purple-500/10 transition-all text-left">
                  <FolderOpen size={16} className="text-purple-500" /> <span>Inventory</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={!inputText.trim()}
            whileHover={inputText.trim() ? { scale: 1.05 } : {}}
            whileTap={inputText.trim() ? { scale: 0.95 } : {}}
            className="absolute top-6 -translate-y-1/2 right-2 h-8 w-8 bg-[#007AFF] text-white rounded-full flex items-center justify-center shadow-md transition-all disabled:opacity-30 disabled:bg-slate-400 z-20"
          >
            <Send size={14}/>
          </motion.button>
        </form>

        {messages.length <= 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/50 justify-center"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleSendMessage(suggestion.text)}
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium rounded-xl dark:bg-[#212121] bg-white border border-slate-200 dark:border-slate-800 text-foreground shadow-sm hover:border-[#007AFF]/30 transition-all cursor-pointer whitespace-nowrap"
              >
                {suggestion.icon}
                {suggestion.text}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* ============ Sliding Right Sidebar (History) =============== */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
            />
            
            {/* Glassmorphic Sliding Drawer */}
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-80 bg-background/80 dark:bg-[#1C1C1E]/80 backdrop-blur-2xl border-l border-white/10 dark:border-white/5 z-50 rounded-l-[2rem] p-6 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-foreground">Conversations</h2>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-200 cursor-pointer dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={20} className="text-slate-500 " />
                </button>
              </div>

              {/* Dynamic Conversation List for Future API */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 scrollbar-none pr-2 ">
                {conversationHistory.map((conv) => (
                  <button
                    key={conv.id}
                    className="w-full flex flex-col text-left p-4 rounded-2xl bg-white/50 dark:bg-[#2C2C2E]/50  hover:bg-white dark:hover:bg-[#3A3A3C] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-1 cursor-pointer">
                      <span className="text-sm font-semibold text-foreground truncate ">{conv.title}</span>
                    </div>
                    <span className="text-xs text-slate-500 pl-1">{conv.date}</span>
                  </button>
                ))}
              </div>

              {/* Sidebar Footer Action */}
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="mt-4 w-full py-3 rounded-xl bg-[#007AFF]/10 text-[#007AFF] font-semibold text-sm cursor-pointer hover:bg-[#007AFF]/20 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> New Chat
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}