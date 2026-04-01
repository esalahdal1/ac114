"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, Download, Calendar, Hash, FileText, Loader2 } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { useEffect, useState, useRef } from "react";
import { getJournalEntryDetails } from "@/lib/accounting-actions";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const A4_STYLES = `
  @media print {
    @page {
      size: A4;
      margin: 20mm;
    }
    body {
      background: white !important;
    }
    .print-hidden {
      display: none !important;
    }
    .print-content {
      background: white !important;
      color: black !important;
      padding: 0 !important;
      width: 100% !important;
    }
    .print-text-black {
      color: black !important;
    }
    .print-border-black {
      border-color: #eee !important;
    }
  }
`;

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryId: string | null;
}

export const VoucherModal = ({ isOpen, onClose, entryId }: VoucherModalProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const voucherRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!voucherRef.current) return;
    setExporting(true);
    try {
      const element = voucherRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#0f0f1a"
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Voucher_${data?.reference || 'Entry'}_${data?.date}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("حدث خطأ أثناء تصدير الملف");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (isOpen && entryId) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const details = await getJournalEntryDetails(entryId);
          setData(details);
        } catch (error) {
          console.error("Error fetching entry details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    } else {
      setData(null);
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, entryId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <style>{A4_STYLES}</style>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:p-0">
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
          className="relative w-full max-w-4xl h-fit max-h-[90vh] overflow-hidden flex flex-col"
        >
          <GlassCard className="flex flex-col flex-1 border-white/10 shadow-2xl overflow-hidden bg-[#0f0f1a]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
              <div className="flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white smooth-transition"
                  title="طباعة"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  disabled={exporting}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white smooth-transition disabled:opacity-50" 
                  title="تصدير PDF"
                >
                  {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                </button>
              </div>
              <h2 className="text-xl font-bold text-white">تفاصيل قيد يومي</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 smooth-transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div ref={voucherRef} className="flex-1 overflow-y-auto p-8 space-y-8 print:p-0 bg-[#0f0f1a]">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
              ) : data ? (
                <>
                  {/* Voucher Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                      <div className="flex items-center gap-2 justify-end text-purple-400">
                        <span className="text-xs font-bold uppercase tracking-wider">رقم المرجع</span>
                        <Hash className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-bold text-white">{data.reference || '---'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                      <div className="flex items-center gap-2 justify-end text-purple-400">
                        <span className="text-xs font-bold uppercase tracking-wider">التاريخ</span>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-bold text-white">{data.date}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                      <div className="flex items-center gap-2 justify-end text-purple-400">
                        <span className="text-xs font-bold uppercase tracking-wider">البيان العام</span>
                        <FileText className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium text-white line-clamp-2">{data.description}</p>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="rounded-2xl border border-white/5 overflow-hidden">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/5">
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">دائن</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">مدين</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">البيان</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">الحساب</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {data.lines?.map((line: any, i: number) => (
                          <tr key={i} className="hover:bg-white/[0.02] smooth-transition">
                            <td className="p-4 text-sm font-bold text-rose-400">{line.credit > 0 ? line.credit.toFixed(2) : '-'}</td>
                            <td className="p-4 text-sm font-bold text-emerald-400">{line.debit > 0 ? line.debit.toFixed(2) : '-'}</td>
                            <td className="p-4 text-sm text-gray-300">{line.description}</td>
                            <td className="p-4">
                              <div className="flex flex-col items-end">
                                <span className="text-sm font-medium text-white">{line.accounts?.name}</span>
                                <span className="text-[10px] text-gray-500 font-mono">{line.accounts?.code}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-white/5 font-bold">
                          <td className="p-4 text-sm text-white">
                            {data.lines?.reduce((sum: number, l: any) => sum + (l.credit || 0), 0).toFixed(2)}
                          </td>
                          <td className="p-4 text-sm text-white">
                            {data.lines?.reduce((sum: number, l: any) => sum + (l.debit || 0), 0).toFixed(2)}
                          </td>
                          <td colSpan={2} className="p-4 text-sm text-right text-gray-400">الإجمالي</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Footer / Signatures */}
                  <div className="grid grid-cols-2 gap-12 pt-12 text-center">
                    <div className="space-y-8">
                      <div className="border-b border-dashed border-white/20 w-48 mx-auto" />
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">توقيع المحاسب</p>
                    </div>
                    <div className="space-y-8">
                      <div className="border-b border-dashed border-white/20 w-48 mx-auto" />
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">توقيع المستلم / المدير</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500">فشل في تحميل البيانات</p>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
