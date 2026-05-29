"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar, { ChatSession } from "@/components/Sidebar";
import ChatInterface, { Message } from "@/components/ChatInterface";
import SplashScreen from "@/components/SplashScreen";
import { Cpu, Sparkles, ChevronRight } from "lucide-react";

import { useTheme } from "@/components/ThemeProvider";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [hasStarted, setHasStarted] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Chat");
  const [showSplash, setShowSplash] = useState(false);

  // Load sessions from localStorage, but DO NOT auto-select one. Default to New Chat.
  useEffect(() => {
    const stored = localStorage.getItem("nexus_sessions");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessions(parsed);
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
  }, []);

  // Save sessions whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("nexus_sessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  // Sync messages when active session changes
  useEffect(() => {
    if (activeSessionId) {
      const session = sessions.find((s) => s.id === activeSessionId);
      if (session) setMessages(session.messages);
    } else {
      setMessages([]);
    }
  }, [activeSessionId, sessions]);

  const handleStartExploring = () => {
    setHasStarted(true);
    setShowSplash(true);
    setTimeout(() => setShowSplash(false), 2000);
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setActiveTab("Chat");
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setActiveTab("Chat");
  };

  const handleSendMessage = async (content: string) => {
    let currentSessionId = activeSessionId;
    let newSessions = [...sessions];

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    const aiMsgId = crypto.randomUUID();
    const aiTypingMsg: Message = {
      id: aiMsgId,
      role: "ai",
      content: "",
      isTyping: true,
    };

    const newMessages = [...messages, userMsg, aiTypingMsg];
    setMessages(newMessages);

    // If new chat, create session
    if (!currentSessionId) {
      currentSessionId = crypto.randomUUID();
      const newSession: ChatSession = {
        id: currentSessionId,
        title: content.substring(0, 30) + (content.length > 30 ? "..." : ""),
        messages: newMessages,
        createdAt: Date.now(),
      };
      newSessions = [newSession, ...newSessions];
      setSessions(newSessions);
      setActiveSessionId(currentSessionId);
    } else {
      // Update existing session
      newSessions = newSessions.map(s => 
        s.id === currentSessionId ? { ...s, messages: newMessages } : s
      );
      setSessions(newSessions);
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      // Handle API errors
      if (!response.ok) {
        let errorMsg = "Failed to fetch response";
        try {
          const errorData = await response.json();
          if (errorData.error) errorMsg = errorData.error;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      // Update with AI response
      const updatedMessages = newMessages.map((msg) =>
        msg.id === aiMsgId ? { ...msg, content: data.response, isTyping: false } : msg
      );
      
      setMessages(updatedMessages);
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: updatedMessages } : s));

    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "Error connecting to Quantum Nexus core. Please try again.";
      const updatedMessages = newMessages.map((msg) =>
        msg.id === aiMsgId ? { ...msg, content: `Error: ${errorMessage}`, isTyping: false } : msg
      );
      setMessages(updatedMessages);
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: updatedMessages } : s));
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] z-0 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 flex flex-col items-center text-center max-w-3xl px-6"
        >
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="p-6 rounded-[2rem] bg-blue-900/20 border border-blue-500/30 neon-glow-blue mb-8 backdrop-blur-xl relative"
          >
            <div className="absolute inset-0 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
            <Cpu size={64} className="text-blue-400" />
            <Sparkles size={24} className="absolute -top-3 -right-3 text-blue-300 animate-pulse" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-blue-500">
            Quantum Nexus <span className="font-light">AI</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl mx-auto">
            Experience the next generation of conversational intelligence. Delve into the complex worlds of Quantum Computing, Web3, and cutting-edge technology with an advanced AI mentor.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartExploring}
            className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold text-lg transition-all duration-300 shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span>Start Exploring</span>
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>
      
      {!showSplash && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex h-screen overflow-hidden"
        >
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
          />
          <main className="flex-1 flex flex-col h-full bg-transparent">
            {activeTab === "Chat" ? (
              <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
              />
            ) : activeTab === "About" ? (
              <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
                <div className="max-w-2xl w-full p-8 rounded-2xl bg-slate-900/60 border border-slate-700/50 glass-panel relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-32 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
                  <h2 className="text-3xl font-bold mb-6 neon-text-blue tracking-wide">About Quantum Nexus AI</h2>
                  <div className="space-y-4 text-slate-300 leading-relaxed">
                    <p>
                      Quantum Nexus AI is a futuristic conversational AI platform designed to educate, guide, and assist users in understanding emerging technologies through intelligent, real-time interactions.
                    </p>
                    <p>
                      The platform acts as a next-generation AI mentor for students, researchers, developers, and tech enthusiasts. It bridges the gap between complex theoretical concepts and accessible knowledge.
                    </p>
                    <h3 className="text-xl font-semibold text-white mt-6 mb-2">How it works:</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Knowledge Retrieval:</strong> It searches a structured local knowledge base to verify facts about Quantum Computing, Web3, AI, and more.</li>
                      <li><strong>Generative Core:</strong> It uses advanced LLMs to process the retrieved context and generate natural, contextual, and accurate responses.</li>
                      <li><strong>Secure Architecture:</strong> All interactions are processed securely, ensuring your data and backend configurations remain private.</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : activeTab === "Settings" ? (
              <div className="flex-1 p-8 flex flex-col items-center justify-center">
                <div className="max-w-lg w-full p-8 rounded-2xl bg-slate-900/60 border border-slate-700/50 glass-panel">
                  <h2 className="text-3xl font-bold mb-6 text-white">Settings</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                      <div>
                        <h3 className="font-medium text-white">Theme</h3>
                        <p className="text-sm text-slate-400">{theme === 'dark' ? 'Cinematic Dark Mode' : 'Clean Light Mode'}</p>
                      </div>
                      <button 
                        onClick={toggleTheme}
                        className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-400'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                      <div>
                        <h3 className="font-medium text-white">Streaming Responses</h3>
                        <p className="text-sm text-slate-400">Simulate real-time typing</p>
                      </div>
                      <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700 text-center text-slate-400 text-sm">
                      System configurations and API integrations are managed via secure environment variables.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 glass-panel max-w-lg">
                  <h2 className="text-3xl font-bold mb-4 neon-text-blue">{activeTab}</h2>
                  <p className="text-slate-400">
                    The {activeTab} module is currently under construction for Phase 2. Please return to "Chat" to use the core AI.
                  </p>
                  <button 
                    onClick={() => setActiveTab("Chat")}
                    className="mt-6 px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  >
                    Return to Chat
                  </button>
                </div>
              </div>
            )}
          </main>
        </motion.div>
      )}
    </>
  );
}
