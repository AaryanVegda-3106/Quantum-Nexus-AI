"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Copy, Check, Mic, MicOff } from "lucide-react";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";

export type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  isTyping?: boolean;
};

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
}

export default function ChatInterface({ messages, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let transcript = "";
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInput(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
            <div className="p-4 rounded-full bg-blue-900/30 mb-6 neon-glow-blue">
              <Sparkles size={48} className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 neon-text-blue">Welcome to Quantum Nexus AI</h2>
            <p className="max-w-md text-slate-400">
              I am your advanced AI mentor. Ask me anything about Quantum Computing, Web3, AI, and other emerging technologies.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={clsx(
                "flex w-full gap-4",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "ai" && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-900/50 border border-blue-500/30 flex items-center justify-center neon-glow-blue text-blue-400">
                  <Bot size={20} />
                </div>
              )}

              <div
                className={clsx(
                  "max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-lg backdrop-blur-sm relative group",
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-600/80 to-blue-800/80 border border-blue-400/20 text-white rounded-tr-sm"
                    : "bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-tl-sm glass-panel"
                )}
              >
                {msg.role === "ai" && !msg.isTyping && (
                  <CopyButton text={msg.content} />
                )}
                
                {msg.isTyping ? (
                  <div className="flex space-x-1 items-center h-6">
                    <motion.div className="w-2 h-2 bg-blue-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-2 h-2 bg-blue-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-2 h-2 bg-blue-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                ) : (
                  <div className="prose prose-invert prose-blue max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900/80 prose-pre:border prose-pre:border-slate-700">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300">
                  <User size={20} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800/50">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask about emerging technologies..."}
            className={clsx(
              "w-full bg-slate-900/60 border border-slate-700/50 rounded-full py-4 pl-6 pr-24 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner",
              isListening ? "ring-1 ring-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)] border-rose-500/50" : "focus:ring-1 focus:ring-blue-500/50"
            )}
            disabled={isLoading}
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={toggleListening}
              className={clsx(
                "p-2.5 rounded-full transition-colors",
                isListening 
                  ? "bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 neon-glow-rose" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
              title="Voice Input"
            >
              {isListening ? <MicOff size={18} className="animate-pulse" /> : <Mic size={18} />}
            </button>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-lg neon-glow-blue"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        <div className="text-center mt-3 text-xs text-slate-500">
          Quantum Nexus AI can make mistakes. Verify critical information.
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-1.5 rounded-md bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
      title="Copy response"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  );
}
