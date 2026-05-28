"use client";

import { motion } from "framer-motion";
import { TerminalSquare } from "lucide-react";

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 backdrop-blur-3xl"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)", transition: { duration: 0.6, ease: "easeInOut" } }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute -inset-4 rounded-full border-t-2 border-r-2 border-blue-500/50"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            className="absolute -inset-8 rounded-full border-b-2 border-l-2 border-blue-400/30"
          />
          <div className="p-4 rounded-2xl bg-blue-900/30 neon-glow-blue border border-blue-500/50">
            <TerminalSquare size={48} className="text-blue-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-100 neon-text-blue mb-2 uppercase mt-8">
          Quantum Nexus
        </h1>
        
        <motion.div className="flex items-center gap-2 text-blue-400/80 text-sm tracking-widest mt-2">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            INITIALIZING CORE
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
