"use client";

import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { 
  Download, 
  Filter, 
  Search, 
  ArrowUpLeft, 
  ArrowDownLeft,
  MoreVertical
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

export default function LedgerPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('journal_lines')
          .select(`
            id,
            debit,
            credit,
            description,
            account_id,
            accounts (name, code),
            journal_entries (date, reference)
          `)
          .order('id', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error("Error fetching ledger:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTrx = transactions.filter(t => 
    t.description?.includes(searchTerm) || 
    t.accounts?.name?.includes(searchTerm) ||
    t.journal_entries?.reference?.includes(searchTerm)
  );

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    
    const headers = ["التاريخ", "المرجع", "الوصف", "الحساب", "مدين", "دائن"];
    const rows = filteredTrx.map(t => [
      t.journal_entries?.date,
      t.journal_entries?.reference || 'بدون مرجع',
      t.description,
      t.accounts?.name,
      t.debit.toFixed(2),
      t.credit.toFixed(2)
    ]);

    const csvContent = [
      "\uFEFF" + headers.join(","), // UTF-8 BOM for Arabic support in Excel
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Topbar />
      
      <main className="pr-72 pt-28 pl-8 pb-8">
        <PageTransition>
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1 text-right">
                <h1 className="text-3xl font-bold text-white">دفتر الأستاذ العام</h1>
                <p className="text-gray-400 text-sm">سجل العمليات التفصيلي لجميع الحسابات.</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
                  <Filter className="w-4 h-4" />
                  تصفية
                </button>
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 border border-purple-500 rounded-xl text-sm font-medium text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all"
                >
                  <Download className="w-4 h-4" />
                  تصدير CSV
                </button>
              </div>
            </div>

            <GlassCard className="overflow-hidden">
              <div className="p-8 border-b border-white/5 flex items-center justify-between flex-row-reverse">
                <div className="relative w-96 group">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="ابحث عن عملية..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl pr-10 pl-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all text-right"
                  />
                </div>
                <div className="flex gap-8 flex-row-reverse">
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">عدد العمليات</span>
                    <span className="text-lg font-bold text-white">{transactions.length}</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-8"><TableSkeleton /></div>
                ) : (
                  <table className="w-full text-right">
                    <thead>
                      <tr className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 bg-white/[0.02]">
                        <th className="px-8 py-5">التاريخ / المرجع</th>
                        <th className="px-4 py-5">الوصف</th>
                        <th className="px-4 py-5">الحساب</th>
                        <th className="px-4 py-5 text-rose-400">مدين</th>
                        <th className="px-4 py-5 text-emerald-400">دائن</th>
                        <th className="px-8 py-5 text-left"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredTrx.map((trx, idx) => (
                        <motion.tr
                          key={trx.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                          className="group smooth-transition"
                        >
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">{trx.journal_entries?.date}</span>
                              <span className="text-xs text-gray-500 font-mono">{trx.journal_entries?.reference || 'بدون مرجع'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{trx.description}</span>
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-2 justify-start">
                              <div className="w-2 h-2 rounded-full bg-purple-500/40" />
                              <span className="text-sm text-white font-medium">{trx.accounts?.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            {trx.debit > 0 && (
                              <div className="flex items-center gap-1 justify-start">
                                <ArrowDownLeft className="w-3 h-3 text-rose-400" />
                                <span className="text-sm font-bold text-rose-400">{trx.debit.toFixed(2)}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-5">
                            {trx.credit > 0 && (
                              <div className="flex items-center gap-1 justify-start">
                                <ArrowUpLeft className="w-3 h-3 text-emerald-400" />
                                <span className="text-sm font-bold text-emerald-400">{trx.credit.toFixed(2)}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-5 text-left">
                            <button className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 smooth-transition">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </GlassCard>
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
