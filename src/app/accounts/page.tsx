"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { 
  ChevronLeft, 
  Folder, 
  FileText, 
  Plus, 
  MoreVertical,
  Search,
  ChevronDown
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { getAccounts, deleteAccount } from "@/lib/accounting-actions";
import { Account } from "@/types/accounting";
import { AddAccountModal } from "@/components/ui/AddAccountModal";
import { Trash2 } from "lucide-react";

const TreeItem = ({ item, allAccounts, onRefresh, depth = 0 }: { item: Account; allAccounts: Account[]; onRefresh: () => void; depth?: number }) => {
  const [isOpen, setIsOpen] = useState(true);
  const children = allAccounts.filter(acc => acc.parent_id === item.id);
  const isGroup = item.is_group || children.length > 0;

  const getAggregateBalance = (account: Account): number => {
    if (!account.is_group) return Number(account.balance) || 0;
    const accountChildren = allAccounts.filter(a => a.parent_id === account.id);
    return accountChildren.reduce((sum, child) => sum + getAggregateBalance(child), 0);
  };

  const displayBalance = isGroup ? getAggregateBalance(item) : item.balance;

  const handleDelete = async () => {
    if (children.length > 0) {
      alert("لا يمكن حذف حساب يحتوي على حسابات فرعية. قم بحذف الحسابات الفرعية أولاً.");
      return;
    }
    if (item.balance !== 0) {
      alert("لا يمكن حذف حساب يحتوي على رصيد.");
      return;
    }
    if (confirm(`هل أنت متأكد من حذف الحساب "${item.name}"؟`)) {
      try {
        await deleteAccount(item.id);
        onRefresh();
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("حدث خطأ أثناء حذف الحساب.");
      }
    }
  };

  return (
    <div className="select-none text-right">
      <motion.div
        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
        className={cn(
          "flex items-center justify-between p-3 rounded-xl smooth-transition group border border-transparent hover:border-white/5",
          depth > 0 && "mr-4"
        )}
      >
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "p-1 rounded-md cursor-pointer hover:bg-white/10 smooth-transition",
              !isGroup && "opacity-0 pointer-events-none"
            )}
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </div>
          {isGroup ? (
            <Folder className="w-4 h-4 text-purple-400" />
          ) : (
            <FileText className="w-4 h-4 text-blue-400" />
          )}
          <div className="flex flex-col">
            <span className={cn(
              "text-sm font-medium transition-colors",
              isGroup ? "text-white" : "text-gray-300 group-hover:text-white"
            )}>
              {item.name}
            </span>
            <span className="text-[10px] text-gray-500 font-mono">{item.code}</span>
          </div>
        </div>
        <div className="flex items-center gap-6 flex-row-reverse">
          <button 
            onClick={handleDelete}
            className="p-1 rounded-lg hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 smooth-transition"
            title="حذف الحساب"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-white w-32 text-left">
            {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(displayBalance)}
          </span>
          <span className="text-xs font-mono text-gray-500">
            {item.type === 'Asset' ? 'أصل' : 
             item.type === 'Liability' ? 'خصم' : 
             item.type === 'Equity' ? 'حقوق' : 
             item.type === 'Revenue' ? 'إيراد' : 'مصروف'}
          </span>
        </div>
      </motion.div>
      <AnimatePresence>
        {isOpen && children.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-r border-white/10 mr-6 mt-1"
          >
            {children.map((child) => (
              <TreeItem key={child.id} item={child} allAccounts={allAccounts} onRefresh={onRefresh} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const rootAccounts = accounts.filter(acc => !acc.parent_id);
  const filteredAccounts = accounts.filter(acc => 
    acc.name.includes(searchTerm) || acc.code.includes(searchTerm)
  );

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Topbar />
      
      <main className="pr-72 pt-28 pl-8 pb-8">
        <PageTransition>
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1 text-right">
                <h1 className="text-3xl font-bold text-white">دليل الحسابات</h1>
                <p className="text-gray-400 text-sm">إدارة الهيكل المالي الخاص بك.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 border border-purple-500 rounded-xl text-sm font-medium text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all"
              >
                <Plus className="w-4 h-4" />
                إضافة حساب
              </button>
            </div>

            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5 flex-row-reverse">
                <div className="relative w-96 group">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="تصفية الحسابات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl pr-10 pl-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all text-right"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">إجمالي الحسابات</span>
                    <span className="text-xl font-bold text-purple-400">{accounts.length}</span>
                  </div>
                </div>
              </div>

              {loading ? (
                <TableSkeleton />
              ) : (
                <div className="space-y-2">
                  {searchTerm 
                    ? filteredAccounts.map(acc => {
                        const getAggBal = (a: Account): number => {
                          if (!a.is_group) return Number(a.balance) || 0;
                          const children = accounts.filter(child => child.parent_id === a.id);
                          return children.reduce((sum, child) => sum + getAggBal(child), 0);
                        };
                        const bal = acc.is_group ? getAggBal(acc) : acc.balance;
                        
                        return (
                          <div key={acc.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 smooth-transition flex items-center justify-between group flex-row-reverse">
                            <div className="flex items-center gap-4 flex-row-reverse">
                              <div className={cn(
                                "p-2 rounded-lg bg-white/5",
                                acc.is_group ? "text-purple-400" : "text-blue-400"
                              )}>
                                {acc.is_group ? <Folder className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-white">{acc.name}</p>
                                <p className="text-xs text-gray-500 font-mono">{acc.code}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-8 flex-row-reverse">
                              <span className="text-sm font-bold text-white min-w-[120px] text-left">
                                {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(bal)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {acc.type === 'Asset' ? 'أصل' : 
                                 acc.type === 'Liability' ? 'خصم' : 
                                 acc.type === 'Equity' ? 'حقوق' : 
                                 acc.type === 'Revenue' ? 'إيراد' : 'مصروف'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    : rootAccounts.map((item) => (
                        <TreeItem key={item.id} item={item} allAccounts={accounts} onRefresh={fetchAccounts} />
                      ))
                  }
                </div>
              )}
            </GlassCard>
          </div>
        </PageTransition>

        <AddAccountModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchAccounts}
          parentAccounts={accounts}
        />
      </main>
    </div>
  );
}
