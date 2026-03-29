"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  CreditCard 
} from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { cn } from "@/lib/utils";

const supabase = createClient();

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [recentTrx, setRecentTrx] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total balance (sum of all assets)
        const { data: accountsData } = await supabase
          .from('accounts')
          .select('balance, type');
        
        const totalAssets = accountsData?.filter(a => a.type === 'Asset').reduce((sum, a) => sum + Number(a.balance), 0) || 0;
        const totalIncome = accountsData?.filter(a => a.type === 'Revenue').reduce((sum, a) => sum + Number(a.balance), 0) || 0;
        const totalExpenses = accountsData?.filter(a => a.type === 'Expense').reduce((sum, a) => sum + Number(a.balance), 0) || 0;

        setStats([
          { 
            label: "إجمالي الأصول", 
            value: `${totalAssets.toFixed(2)} ر.س`, 
            change: "+0%", 
            trend: "up", 
            icon: DollarSign,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10"
          },
          { 
            label: "إجمالي الإيرادات", 
            value: `${totalIncome.toFixed(2)} ر.س`, 
            change: "+0%", 
            trend: "up", 
            icon: TrendingUp,
            color: "text-blue-400",
            bg: "bg-blue-500/10"
          },
          { 
            label: "إجمالي المصروفات", 
            value: `${totalExpenses.toFixed(2)} ر.س`, 
            change: "+0%", 
            trend: "down", 
            icon: TrendingDown,
            color: "text-rose-400",
            bg: "bg-rose-500/10"
          },
          { 
            label: "صافي الربح", 
            value: `${(totalIncome - totalExpenses).toFixed(2)} ر.س`, 
            change: "+0%", 
            trend: "up", 
            icon: Activity,
            color: "text-purple-400",
            bg: "bg-purple-500/10"
          },
        ]);

        // Fetch recent transactions
        const { data: recentData } = await supabase
          .from('journal_lines')
          .select('*, accounts(name), journal_entries(date)')
          .order('id', { ascending: false })
          .limit(5);
        
        setRecentTrx(recentData || []);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <Sidebar />
        <Topbar />
        <main className="pr-72 pt-28 pl-8 pb-8">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar />
      <Topbar />
      
      <main className="pr-72 pt-28 pl-8 pb-8">
        <PageTransition>
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-white">نظرة عامة</h1>
                <p className="text-gray-400 text-sm">أهلاً بك مجدداً، إليك ملخص النشاط المالي.</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
                  تصدير التقارير
                </button>
                <Link href="/journal">
                  <button className="px-4 py-2 bg-purple-600 border border-purple-500 rounded-xl text-sm font-medium text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all">
                    عملية جديدة
                  </button>
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <GlassCard key={idx} className="p-6 group relative overflow-hidden text-right">
                  <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <stat.icon className="w-16 h-16" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className={stat.bg + " p-3 rounded-xl w-fit mr-0 ml-auto"}>
                      <stat.icon className={stat.color + " w-6 h-6"} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                    </div>
                    <div className="flex items-center gap-2 justify-start flex-row-reverse">
                      <span className={stat.trend === "up" ? "text-emerald-400" : "text-rose-400"}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500">منذ البداية</span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Charts Section Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GlassCard className="lg:col-span-2 p-8 h-[400px] flex flex-col justify-between text-right">
                <div className="flex items-center justify-between mb-8 flex-row-reverse">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white">نشاط الإيرادات</h3>
                    <p className="text-sm text-gray-400">تحليل بياني للإيرادات المسجلة.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-xs font-medium">النشاط المالي</span>
                  </div>
                </div>
                <div className="flex-1 flex items-end gap-2 h-full pb-4 flex-row-reverse">
                  {[40, 70, 45, 90, 65, 85, 45, 75, 55, 95, 60, 80].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className="flex-1 bg-gradient-to-t from-purple-600/20 to-purple-500/60 rounded-t-lg group relative"
                    >
                    </motion.div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-8 h-[400px] text-right">
                <h3 className="text-lg font-semibold text-white mb-6">آخر العمليات المسجلة</h3>
                <div className="space-y-6">
                  {recentTrx.length > 0 ? recentTrx.map((trx, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer flex-row-reverse">
                      <div className="flex items-center gap-4 flex-row-reverse">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-purple-500/30 smooth-transition">
                          <CreditCard className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white truncate max-w-[120px]">{trx.description}</p>
                          <p className="text-xs text-gray-500">{trx.journal_entries?.date}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "text-sm font-semibold",
                        trx.debit > 0 ? "text-rose-400" : "text-emerald-400"
                      )}>
                        {trx.debit > 0 ? `-${trx.debit}` : `+${trx.credit}`} ر.س
                      </span>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 text-center mt-20">لا توجد عمليات مسجلة بعد</p>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
