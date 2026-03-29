"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Users, 
  Settings, 
  ChevronLeft,
  Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", href: "/" },
  { icon: Users, label: "الحسابات", href: "/accounts" },
  { icon: BookOpen, label: "القيود اليومية", href: "/journal" },
  { icon: FileText, label: "دفتر الأستاذ", href: "/ledger" },
  { icon: Settings, label: "الإعدادات", href: "/settings" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed right-0 top-0 h-screen w-64 glass-morphism border-l border-white/10 z-50 flex flex-col"
    >
      {/* Logo Section */}
      <div className="p-8 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-600/20 glow-purple border border-purple-500/30">
          <Calculator className="w-6 h-6 text-purple-400" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          نظام AC
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: -5, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl smooth-transition group cursor-pointer",
                  isActive 
                    ? "bg-white/10 text-white border border-white/10 shadow-lg" 
                    : "text-gray-400 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-purple-400" : "group-hover:text-purple-400"
                  )} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="active-indicator">
                    <ChevronLeft className="w-4 h-4 text-purple-400" />
                  </motion.div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer smooth-transition">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">أحمد محمد</span>
            <span className="text-xs text-gray-400">مدير النظام</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
