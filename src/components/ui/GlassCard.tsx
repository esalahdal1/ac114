"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export const GlassCard = ({ children, className, animate = true }: GlassCardProps) => {
  const Component = animate ? motion.div : "div";
  
  return (
    <Component
      initial={animate ? { opacity: 0, y: 20, scale: 0.95 } : undefined}
      animate={animate ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={animate ? { scale: 1.02, boxShadow: "0 0 25px rgba(255, 255, 255, 0.05)" } : undefined}
      className={cn(
        "glass-card overflow-hidden",
        className
      )}
    >
      {children}
    </Component>
  );
};
