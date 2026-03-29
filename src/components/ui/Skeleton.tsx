"use client";

import { motion } from "framer-motion";

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", repeatType: "reverse" }}
      className={`bg-white/5 rounded-xl ${className}`}
    />
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );
};

export const TableSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
};
