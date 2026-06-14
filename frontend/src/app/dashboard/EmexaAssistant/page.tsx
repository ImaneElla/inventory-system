"use client";

import { Activity, AlertTriangle, BarChart2, FileUp, FolderOpen, HelpCircle, ImageIcon, MessageCircle, MessageCircleCode, MessageCircleDashed, MessageCirclePlus, MessageSquareDashed, Plus, Send } from "lucide-react";
import { useState , useEffect, useRef} from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  sender: "user" | "Emexa";
  text: string;
  timestamp: Date;
}

export default function EmexaAssistant() {
  const [messages, setMessages] = useState<Message[]>([
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userQuery = inputText;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userQuery,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText(""); 

    setIsTyping(true);
    setTimeout(() => {
      const emexaResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "Emexa",
        text: `I received your message: "${userQuery}". I'm ready to connect to your Spring Boot backend!`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, emexaResponse]);
      setIsTyping(false);
    }, 1200);
  };

  const suggestions = [
    { text: "What is Emexa?", icon: <HelpCircle size={16} className="btn-gradient" /> },
    { text: "Check Low Stock?", icon: <AlertTriangle size={16} className="btn-gradient" /> },
    { text: "Generate Report?", icon: <BarChart2 size={16} className="btn-gradient" /> },
    { text: "Analyze Sales Data?", icon: <Activity size={16} className="btn-gradient" /> }
];

const [userName, setUserName] = useState<string>("");

useEffect(() => {
  if (typeof window !== "undefined") {
    const storedName = sessionStorage.getItem("userName") || sessionStorage.getItem("username") || "Imane";
    setUserName(storedName);
  }
}, []);

const [showOptions, setShowOptions] = useState(false);

  // Motion variants for stagger effect on suggestions
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };


  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col justify-between items-center px-4 py-6 overflow-hidden relative">
      <div className="bg-linear-to-b from-blue-900/50 to-background opacity-40 absolute inset-0"></div>

      {/* ============ Dynamic Content Area (Welcome OR Chat Messages) =============== */}
      <div className="w-full flex-1 flex flex-col justify-center items-center z-10 max-w-2xl overflow-hidden my-auto">
        <AnimatePresence mode="wait">
          {messages.length <= 0 ? (
            
            /* ============ Icon + Welcome =============== */
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center space-y-3"
            >
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-blue-600/10 border border-blue-500/30 shadow-[0_0_40px_rgba(37,99,235,0.25)] animate-pulse">
                <MessageSquareDashed size={36} className="text-blue-500" />
                <div className="absolute inset-0 rounded-full border border-blue-500/10 blur-sm"></div>
              </div>
              
              <h1 className="text-3xl font-black tracking-tight text-foreground mt-6">
                Welcome {userName} , I'm Emexa
              </h1>
              <p className=" text-slate-400 max-w-sm font-medium tracking-wide">
                How can I help you today?      
              </p>
            </motion.div>

          ) : (

            /* ============ Active Chat Feed =============== */
            <motion.div
              key="chat-feed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex-1 flex flex-col gap-4 overflow-y-auto p-4 scrollbar-none"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] p-3.5 rounded-2xl text-[16px] font-medium leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white shadow-lg shadow-foreground/40 rounded-br-none"
                        : "dark:bg-[#212121] bg-background  text-foreground rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex w-full justify-start"
                >
                  <div className="dark:bg-[#212121] bg-background p-3.5 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </motion.div>

          )}
        </AnimatePresence>
      </div>

      {/* ============ Chat Box =============== */}
      <div className="w-full max-w-2xl backdrop-blur-xl rounded-3xl p-5 space-y-3 mx-auto z-10">
      <form onSubmit={handleSend} className="relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={2}
          placeholder="Type your message here..."
          className="w-full dark:bg-[#212121] bg-background border  rounded-3xl p-3 pl-14 pr-14 mx-auto text-ms text-foreground placeholder:text-slate-400 focus:outline-none focus:border-blue-500/50 resize-none transition-all"
          onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
          }}
        />

        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowOptions(!showOptions)}
            className=" absolute top-7 -translate-y-1/2 left-3 h-10 w-10 text-foreground rounded-full hover:scale-120 cursor-pointer font-bold flex items-center justify-center transition-all "
          >
          <Plus size={20} 
          className={`transition-transform duration-200 ${showOptions ? 'rotate-45 text-primary' : ''}`} />

      </motion.button>
      
      <AnimatePresence>
        {showOptions && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ type: "spring", duration: 0.25 }}
          className="absolute bottom-15 left-3 bg-slate-950/80 backdrop-blur-xl border border-slate-800 p-2 rounded-2xl shadow-2xl flex flex-col gap-1 w-48 z-30"
        >
          
          <button
            type="button"
            onClick={() => { setShowOptions(false); }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-300 hover:text-white hover:bg-blue-600/20 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer text-left"
          >
            <ImageIcon size={14} className="text-blue-400" />
            <span>Upload Image</span>
          </button>

          <button
            type="button"
            onClick={() => {setShowOptions(false); }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-300 hover:text-white hover:bg-amber-600/20 hover:border-amber-500/30 border border-transparent transition-all cursor-pointer text-left"
          >
            <FileUp size={14} className="text-amber-400" />
            <span>Upload Document</span>
          </button>

          <button
            type="button"
            onClick={() => { setShowOptions(false); }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-300 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/30 border border-transparent transition-all cursor-pointer text-left"
          >
            <FolderOpen size={14} className="text-purple-400" />
            <span>Browse Inventory</span>
          </button>
          
        </motion.div>
      )}
     </AnimatePresence>
        
        <motion.button
            type="submit"
            disabled={!inputText.trim()}
            whileHover={inputText.trim() ? { scale: 1.05 } : {}}
            whileTap={inputText.trim() ? { scale: 0.95 } : {}}
            className="absolute bottom-6 top-3 right-3 h-10 w-10 btn-gradient hover:bg-blue-500 text-white rounded-full cursor-pointer flex items-center justify-center shadow-md transition-all disabled:pointer-events-none z-20 disabled:opacity-20 "
          >
            <Send size={12} />
          </motion.button>
        </form>

        {messages.length <= 0 && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-2 pt-2 border-t "
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setInputText(suggestion.text)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg dark:bg-[#212121] border border-slate-800 hover:border-slate-700 text-foreground hover:text-primary hover:shadow-md shadow-primary/20 transition-all cursor-pointer"
              >
                {suggestion.icon}
                {suggestion.text}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}