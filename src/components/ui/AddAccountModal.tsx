"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createAccount, getLastAccountCode } from "@/lib/accounting-actions";
import { Account, AccountType } from "@/types/accounting";

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentAccounts: Account[];
}

export const AddAccountModal = ({ isOpen, onClose, onSuccess, parentAccounts }: AddAccountModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "Asset" as AccountType,
    is_group: false,
    parent_id: "" as string | null
  });

  // Auto-generate code when parent or type changes
  useEffect(() => {
    if (!isOpen) return;

    const generateCode = async () => {
      const parentId = formData.parent_id === "" ? null : formData.parent_id;
      const lastCode = await getLastAccountCode(parentId, formData.type);
      
      let nextCode = "";
      if (lastCode) {
        // Increment last code
        const codeNum = parseInt(lastCode);
        nextCode = (codeNum + 1).toString();
      } else {
        // Generate initial code based on type and parent
        if (parentId) {
          const parent = parentAccounts.find(a => a.id === parentId);
          if (parent) {
            nextCode = `${parent.code}01`;
          }
        } else {
          const typePrefixMap: Record<AccountType, string> = {
            'Asset': '1',
            'Liability': '2',
            'Equity': '3',
            'Revenue': '4',
            'Expense': '5'
          };
          nextCode = typePrefixMap[formData.type];
        }
      }
      setFormData(prev => ({ ...prev, code: nextCode }));
    };

    generateCode();
  }, [formData.parent_id, formData.type, isOpen, parentAccounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAccount({
        ...formData,
        parent_id: formData.parent_id === "" ? null : formData.parent_id,
        balance: 0
      });
      onSuccess();
      onClose();
      setFormData({ name: "", code: "", type: "Asset", is_group: false, parent_id: "" });
    } catch (error) {
      console.error("Error creating account:", error);
      alert("حدث خطأ أثناء إضافة الحساب. تأكد من أن الكود فريد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-morphism border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">إضافة حساب جديد</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full smooth-transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-right">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">اسم الحساب</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 smooth-transition text-right"
                  placeholder="مثلاً: البنك الأهلي، المبيعات..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">كود الحساب (تلقائي)</label>
                  <input
                    readOnly
                    type="text"
                    value={formData.code}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-400 focus:outline-none smooth-transition text-right font-mono cursor-not-allowed"
                    placeholder="يتم توليده تلقائياً..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">نوع الحساب</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AccountType })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 smooth-transition appearance-none text-right"
                  >
                    <option value="Asset" className="bg-[#0f0f1a]">أصل (Asset)</option>
                    <option value="Liability" className="bg-[#0f0f1a]">خصم (Liability)</option>
                    <option value="Equity" className="bg-[#0f0f1a]">حقوق ملكية (Equity)</option>
                    <option value="Revenue" className="bg-[#0f0f1a]">إيراد (Revenue)</option>
                    <option value="Expense" className="bg-[#0f0f1a]">مصروف (Expense)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">الحساب الأب (اختياري)</label>
                <select
                  value={formData.parent_id || ""}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 smooth-transition appearance-none text-right"
                >
                  <option value="" className="bg-[#0f0f1a]">-- بدون حساب أب --</option>
                  {parentAccounts.filter(a => a.is_group).map(acc => (
                    <option key={acc.id} value={acc.id} className="bg-[#0f0f1a]">{acc.name} ({acc.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 py-2 flex-row-reverse">
                <input
                  type="checkbox"
                  id="is_group"
                  checked={formData.is_group}
                  onChange={(e) => setFormData({ ...formData, is_group: e.target.checked })}
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500/50"
                />
                <label htmlFor="is_group" className="text-sm font-medium text-white cursor-pointer">
                  هذا الحساب عبارة عن مجموعة (Group)
                </label>
              </div>

              <div className="pt-4">
                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-2xl smooth-transition shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  حفظ الحساب
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
