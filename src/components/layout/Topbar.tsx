"use client";

import { motion } from "framer-motion";
import { Bell, Search, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const Topbar = () => {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-4 right-72 left-4 h-16 glass-morphism border border-white/10 rounded-2xl z-40 flex items-center justify-between px-8"
    >
      {/* Search Section */}
      <div className="flex-1 max-w-md relative group">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
        <input
          type="text"
          placeholder="ابحث عن قيود، حسابات..."
          className="w-full h-10 bg-white/5 border border-white/5 rounded-xl pr-10 pl-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all text-right"
        />
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
          >
            <Bell className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
        
        <div className="h-8 w-[1px] bg-white/10 mx-2" />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-xl transition-all glow-purple"
        >
          <User className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-100">الملف الشخصي</span>
        </motion.button>
      </div>
    </motion.header>
  );
};
