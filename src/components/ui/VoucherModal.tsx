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
      margin: 0;
    }
    body * {
      visibility: hidden;
    }
    #voucher-print-area, #voucher-print-area * {
      visibility: visible;
    }
    #voucher-print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 210mm;
      height: 297mm;
      padding: 20mm;
      background: white !important;
      color: black !important;
      visibility: visible !important;
    }
    .no-print {
      display: none !important;
    }
    .print-black {
      color: black !important;
      border-color: #ddd !important;
    }
    .print-bg-white {
      background: white !important;
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
      
      // Temporary style change for better capture
      const originalStyle = element.style.height;
      element.style.height = 'auto';
      element.style.maxHeight = 'none';
      element.style.overflow = 'visible';

      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff", // Use white background for PDF
        windowWidth: 1200, // Fixed width for consistent rendering
      });
      
      // Revert styles
      element.style.height = originalStyle;
      element.style.maxHeight = '90vh';
      element.style.overflow = 'auto';

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Voucher_${data?.reference || 'Entry'}.pdf`);
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
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 no-print">
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
            <div 
              id="voucher-print-area"
              ref={voucherRef} 
              className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#0f0f1a] print:bg-white print:text-black print:overflow-visible"
            >
              {loading ? (
                <div className="flex items-center justify-center h-64 no-print">
                  <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
              ) : data ? (
                <>
                  {/* Professional Header (Visible in Print/PDF) */}
                  <div className="hidden print:flex flex-row-reverse justify-between items-start border-b-2 border-black pb-6 mb-8">
                    <div className="text-right space-y-1">
                      <h1 className="text-2xl font-black">مؤسسة الأعمال المحدودة</h1>
                      <p className="text-sm text-gray-600">لإدارة العقارات والاستثمارات</p>
                      <p className="text-xs text-gray-500">الرقم الضريبي: 300012345600003</p>
                    </div>
                    <div className="text-center border-2 border-black p-4 rounded-lg">
                      <h2 className="text-xl font-bold uppercase tracking-widest">سند قيد يومي</h2>
                      <p className="text-sm font-mono mt-1">JOURNAL VOUCHER</p>
                    </div>
                    <div className="text-left text-xs text-gray-500 space-y-1">
                      <p>المملكة العربية السعودية</p>
                      <p>جدة - حي الصفا</p>
                      <p>هاتف: 0500000000</p>
                    </div>
                  </div>

                  {/* Voucher Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 print:bg-white print:border-black print:border">
                      <div className="flex items-center gap-2 justify-end text-purple-400 print:text-black">
                        <span className="text-xs font-bold uppercase tracking-wider">رقم المرجع</span>
                        <Hash className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-bold text-white print:text-black">{data.reference || '---'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 print:bg-white print:border-black print:border">
                      <div className="flex items-center gap-2 justify-end text-purple-400 print:text-black">
                        <span className="text-xs font-bold uppercase tracking-wider">التاريخ</span>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-bold text-white print:text-black">{data.date}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 print:bg-white print:border-black print:border">
                      <div className="flex items-center gap-2 justify-end text-purple-400 print:text-black">
                        <span className="text-xs font-bold uppercase tracking-wider">البيان العام</span>
                        <FileText className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium text-white line-clamp-2 print:text-black print:line-clamp-none">{data.description}</p>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="rounded-2xl border border-white/5 overflow-hidden print:border-black print:border">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/5 print:bg-gray-100 print:border-black">
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider print:text-black">دائن</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider print:text-black">مدين</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider print:text-black">البيان</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider print:text-black">الحساب</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 print:divide-black">
                        {data.lines?.map((line: any, i: number) => (
                          <tr key={i} className="hover:bg-white/[0.02] smooth-transition print:bg-white">
                            <td className="p-4 text-sm font-bold text-rose-400 print:text-black">{line.credit > 0 ? line.credit.toFixed(2) : '-'}</td>
                            <td className="p-4 text-sm font-bold text-emerald-400 print:text-black">{line.debit > 0 ? line.debit.toFixed(2) : '-'}</td>
                            <td className="p-4 text-sm text-gray-300 print:text-black">{line.description}</td>
                            <td className="p-4">
                              <div className="flex flex-col items-end">
                                <span className="text-sm font-medium text-white print:text-black">{line.accounts?.name}</span>
                                <span className="text-[10px] text-gray-500 font-mono print:text-gray-700">{line.accounts?.code}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-white/5 font-bold print:bg-gray-100 print:border-t-2 print:border-black">
                          <td className="p-4 text-sm text-white print:text-black">
                            {data.lines?.reduce((sum: number, l: any) => sum + (l.credit || 0), 0).toFixed(2)}
                          </td>
                          <td className="p-4 text-sm text-white print:text-black">
                            {data.lines?.reduce((sum: number, l: any) => sum + (l.debit || 0), 0).toFixed(2)}
                          </td>
                          <td colSpan={2} className="p-4 text-sm text-right text-gray-400 print:text-black">الإجمالي</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Footer / Signatures */}
                  <div className="grid grid-cols-2 gap-12 pt-12 text-center">
                    <div className="space-y-8">
                      <div className="border-b border-dashed border-white/20 w-48 mx-auto print:border-black" />
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest print:text-black">توقيع المحاسب</p>
                    </div>
                    <div className="space-y-8">
                      <div className="border-b border-dashed border-white/20 w-48 mx-auto print:border-black" />
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest print:text-black">توقيع المستلم / المدير</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500 no-print">فشل في تحميل البيانات</p>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
