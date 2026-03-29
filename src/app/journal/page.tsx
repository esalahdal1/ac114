"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { 
  Plus, 
  Trash2, 
  Save, 
  Calendar as CalendarIcon, 
  FileText, 
  CheckCircle2, 
  XCircle,
  History,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getAccounts, createJournalEntry } from "@/lib/accounting-actions";
import { Account } from "@/types/accounting";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

interface JournalLineItem {
  id: string;
  account_id: string;
  debit: string;
  credit: string;
  description: string;
}

export default function JournalPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<JournalLineItem[]>([
    { id: "1", account_id: "", debit: "", credit: "", description: "" },
    { id: "2", account_id: "", debit: "", credit: "", description: "" },
  ]);
  const [showHistory, setShowHistory] = useState(false);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const data = await getAccounts();
      setAccounts(data.filter(acc => !acc.is_group));
    };
    fetchAccounts();
  }, []);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    setRecentEntries(data || []);
  };

  const addRow = () => {
    setLines([
      ...lines,
      { id: Math.random().toString(36).substr(2, 9), account_id: "", debit: "", credit: "", description: "" }
    ]);
  };

  const removeRow = (id: string) => {
    if (lines.length > 2) {
      setLines(lines.filter(l => l.id !== id));
    }
  };

  const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0 && lines.every(l => l.account_id);

  const handlePost = async () => {
    if (!isBalanced) return;
    setLoading(true);
    try {
      const entry = {
        date,
        reference,
        description
      };
      const journalLines = lines.map(l => ({
        account_id: l.account_id,
        debit: parseFloat(l.debit) || 0,
        credit: parseFloat(l.credit) || 0,
        description: l.description || description
      }));

      await createJournalEntry(entry, journalLines);
      alert("تم ترحيل القيد بنجاح!");
      // Reset form
      setLines([
        { id: "1", account_id: "", debit: "", credit: "", description: "" },
        { id: "2", account_id: "", debit: "", credit: "", description: "" },
      ]);
      setReference("");
      setDescription("");
      if (showHistory) fetchHistory(); // Refresh history if open
    } catch (error) {
      console.error("Error posting entry:", error);
      alert("حدث خطأ أثناء ترحيل القيد");
    } finally {
      setLoading(false);
    }
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
                <h1 className="text-3xl font-bold text-white">قيد يومي جديد</h1>
                <p className="text-gray-400 text-sm">إنشاء عملية محاسبية جديدة في النظام.</p>
              </div>
              <button 
                onClick={() => {
                  setShowHistory(!showHistory);
                  if (!showHistory) fetchHistory();
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  showHistory 
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" 
                    : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                )}
              >
                <History className="w-4 h-4" />
                {showHistory ? "إغلاق السجل" : "القيود الأخيرة"}
              </button>
            </div>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <GlassCard className="p-6 bg-purple-600/5 border-purple-500/20">
                    <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4 text-right">آخر القيود المسجلة</h3>
                    <div className="space-y-3">
                      {recentEntries.length > 0 ? recentEntries.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 flex-row-reverse">
                          <div className="flex flex-col text-right">
                            <span className="text-sm font-medium text-white">{entry.reference || 'بدون مرجع'}</span>
                            <span className="text-xs text-gray-500">{entry.date}</span>
                          </div>
                          <span className="text-xs text-gray-400 truncate max-w-[200px]">{entry.description}</span>
                        </div>
                      )) : (
                        <p className="text-center text-gray-500 py-4 text-sm">لا توجد قيود مسجلة مؤخراً</p>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <GlassCard className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 flex-row-reverse">
                    <div className="space-y-4 text-right">
                      <label className="text-sm font-medium text-gray-400 flex items-center gap-2 justify-end">
                        تاريخ العملية
                        <CalendarIcon className="w-4 h-4" />
                      </label>
                      <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 smooth-transition text-right"
                      />
                    </div>
                    <div className="space-y-4 text-right">
                      <label className="text-sm font-medium text-gray-400 flex items-center gap-2 justify-end">
                        رقم المرجع
                        <FileText className="w-4 h-4" />
                      </label>
                      <input 
                        type="text" 
                        placeholder="JV-2026-001"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 smooth-transition text-right"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/5">
                          <th className="pb-4 pr-2">الحساب</th>
                          <th className="pb-4 text-rose-400">مدين</th>
                          <th className="pb-4 text-emerald-400">دائن</th>
                          <th className="pb-4">البيان / الوصف</th>
                          <th className="pb-4 w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        <AnimatePresence initial={false}>
                          {lines.map((line, index) => (
                            <motion.tr
                              key={line.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="group"
                            >
                              <td className="py-4 pr-2">
                                <select 
                                  value={line.account_id}
                                  onChange={(e) => {
                                    const newLines = [...lines];
                                    newLines[index].account_id = e.target.value;
                                    setLines(newLines);
                                  }}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 smooth-transition appearance-none text-right"
                                >
                                  <option value="" className="bg-[#0f0f1a]">اختر الحساب</option>
                                  {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id} className="bg-[#0f0f1a]">{acc.name} ({acc.code})</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-4 px-2">
                                <input 
                                  type="number" 
                                  placeholder="0.00"
                                  value={line.debit}
                                  onChange={(e) => {
                                    const newLines = [...lines];
                                    newLines[index].debit = e.target.value;
                                    if (e.target.value) newLines[index].credit = "";
                                    setLines(newLines);
                                  }}
                                  className="w-full bg-rose-500/5 border border-rose-500/20 rounded-lg px-3 py-2 text-sm text-rose-400 placeholder-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500/50 smooth-transition text-right font-bold"
                                />
                              </td>
                              <td className="py-4 px-2">
                                <input 
                                  type="number" 
                                  placeholder="0.00"
                                  value={line.credit}
                                  onChange={(e) => {
                                    const newLines = [...lines];
                                    newLines[index].credit = e.target.value;
                                    if (e.target.value) newLines[index].debit = "";
                                    setLines(newLines);
                                  }}
                                  className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2 text-sm text-emerald-400 placeholder-emerald-900 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 smooth-transition text-right font-bold"
                                />
                              </td>
                              <td className="py-4 px-2">
                                <input 
                                  type="text" 
                                  placeholder="وصف العملية..."
                                  value={line.description}
                                  onChange={(e) => {
                                    const newLines = [...lines];
                                    newLines[index].description = e.target.value;
                                    setLines(newLines);
                                  }}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 smooth-transition text-right"
                                />
                              </td>
                              <td className="py-4 text-left">
                                <button 
                                  onClick={() => removeRow(line.id)}
                                  className="p-2 rounded-lg hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 smooth-transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between flex-row-reverse">
                    <button 
                      onClick={addRow}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-medium hover:bg-purple-500/20 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة سطر
                    </button>
                    <div className="flex items-center gap-12 pl-12 flex-row-reverse">
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-rose-400/60 font-bold uppercase tracking-wider text-rose-400">إجمالي المدين</span>
                        <span className="text-xl font-bold text-rose-400">{totalDebit.toFixed(2)} ر.س</span>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-emerald-400/60 font-bold uppercase tracking-wider text-emerald-400">إجمالي الدائن</span>
                        <span className="text-xl font-bold text-emerald-400">{totalCredit.toFixed(2)} ر.س</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>

              <div className="space-y-6">
                <GlassCard className="p-6 text-right">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">الحالة</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-row-reverse">
                      <span className="text-sm text-gray-300">متوازن</span>
                      {isBalanced ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between flex-row-reverse">
                      <span className="text-sm text-gray-300">الفرق</span>
                      <span className={cn(
                        "text-sm font-mono",
                        totalDebit - totalCredit === 0 ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {Math.abs(totalDebit - totalCredit).toFixed(2)} ر.س
                      </span>
                    </div>
                  </div>
                </GlassCard>

                <button 
                  disabled={!isBalanced || loading}
                  onClick={handlePost}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all shadow-xl",
                    isBalanced && !loading
                      ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20 glow-purple" 
                      : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
                  )}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  ترحيل القيد
                </button>

                <GlassCard className="p-6 bg-purple-600/5 border-purple-500/20 text-right">
                  <h4 className="text-sm font-semibold text-purple-300 mb-2">نصيحة محاسبية</h4>
                  <p className="text-xs text-purple-200/60 leading-relaxed">
                    تأكد دائماً من أن مجموع المبالغ المدينة يساوي مجموع المبالغ الدائنة قبل ترحيل القيد. النظام لن يقبل القيود غير المتوازنة.
                  </p>
                </GlassCard>
              </div>
            </div>
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
