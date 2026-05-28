"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Cpu, Database, Network, Settings, X, Menu, TerminalSquare, Plus, MessageCircle } from "lucide-react";
import clsx from "clsx";

export type ChatSession = {
  id: string;
  title: string;
  messages: any[];
  createdAt: number;
};

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

export default function Sidebar({ activeTab, onTabChange, sessions, activeSessionId, onSelectSession, onNewChat }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Quantum Nexus", icon: Cpu },
    { name: "Neural Network", icon: Network },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-slate-800/80 text-white backdrop-blur-md border border-slate-700"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(isOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className={clsx(
              "fixed md:relative z-40 h-full w-72 glass-panel border-r border-slate-700/50 flex flex-col",
              "md:translate-x-0"
            )}
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-600/20 neon-glow-blue border border-blue-500/30 text-blue-400">
                  <TerminalSquare size={24} />
                </div>
                <h1 className="font-bold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
                  NEXUS AI
                </h1>
              </div>
              <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="px-4 py-4">
              <button 
                onClick={() => {
                  onNewChat();
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all duration-300 shadow-lg neon-glow-blue"
              >
                <Plus size={20} />
                <span className="font-semibold">New Chat</span>
              </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-2 px-4 space-y-4">
              
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Menu</div>
                {navItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onTabChange(item.name);
                      if (window.innerWidth < 768) setIsOpen(false);
                    }}
                    className={clsx(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300",
                      activeTab === item.name
                        ? "bg-slate-800 text-white border border-slate-700"
                        : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                    )}
                  >
                    <item.icon size={18} className={activeTab === item.name ? "text-white" : "text-slate-400"} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-4">Recent Chats</div>
                {sessions.length === 0 ? (
                  <div className="text-xs text-slate-500 px-2 italic">No recent chats</div>
                ) : (
                  sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => {
                        onSelectSession(session.id);
                        if (window.innerWidth < 768) setIsOpen(false);
                      }}
                      className={clsx(
                        "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 text-left truncate",
                        activeTab === "Chat" && activeSessionId === session.id
                          ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 neon-glow-blue"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                      )}
                    >
                      <MessageCircle size={16} className="flex-shrink-0" />
                      <span className="font-medium text-sm truncate">{session.title}</span>
                    </button>
                  ))
                )}
              </div>
            </div>


            {/* Footer */}
            <div className="p-4 border-t border-slate-700/50 space-y-2">
              <button 
                onClick={() => {
                  onTabChange("About");
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                  activeTab === "About"
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 neon-glow-blue"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <Database size={20} className={activeTab === "About" ? "text-blue-400" : "text-slate-400"} />
                <span className="font-medium">About Nexus</span>
              </button>

              <button 
                onClick={() => {
                  onTabChange("Settings");
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                  activeTab === "Settings"
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 neon-glow-blue"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <Settings size={20} className={activeTab === "Settings" ? "text-blue-400" : "text-slate-400"} />
                <span className="font-medium">Settings</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
