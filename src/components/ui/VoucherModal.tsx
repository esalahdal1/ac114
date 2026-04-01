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
    /* Set page size and margins */
    @page {
      size: A4;
      margin: 15mm;
    }

    /* Hide everything on the page */
    body * {
      visibility: hidden !important;
      background: none !important;
      color: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }

    /* Only show the print area and its children */
    #voucher-print-area, #voucher-print-area * {
      visibility: visible !important;
      color: black !important;
      border-color: #000 !important;
    }

    /* Position the print area to take over the whole page */
    #voucher-print-area {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      display: block !important;
      overflow: visible !important;
    }

    /* Specific element styling for print */
    .print-header { border-bottom: 2px solid #000 !important; }
    .print-table-header { background-color: #f3f4f6 !important; border-bottom: 1px solid #000 !important; }
    .print-table-row { border-bottom: 1px solid #eee !important; }
    .print-table-footer { border-top: 2px solid #000 !important; background-color: #f3f4f6 !important; }
    
    /* Ensure no-print elements are truly gone */
    .no-print { display: none !important; }
    
    /* Force background colors to show in print */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
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
    if (!voucherRef.current || !data) return;
    setExporting(true);
    
    try {
      const element = voucherRef.current;
      
      // Create a temporary container for the PDF version
      const printContainer = document.createElement('div');
      printContainer.style.position = 'fixed';
      printContainer.style.left = '-9999px';
      printContainer.style.top = '0';
      printContainer.style.width = '210mm'; // A4 Width
      printContainer.style.backgroundColor = 'white';
      printContainer.style.color = 'black';
      printContainer.style.direction = 'rtl';
      printContainer.dir = 'rtl';
      document.body.appendChild(printContainer);

      // Clone the content into the print container
      const contentClone = element.cloneNode(true) as HTMLElement;
      
      // Remove the "no-print" elements and UI-only bits
      contentClone.querySelectorAll('.no-print').forEach(el => el.remove());
      
      // Force visibility of hidden print elements
      contentClone.querySelectorAll('.hidden.print\\:flex').forEach((el: any) => {
        el.classList.remove('hidden');
        el.style.display = 'flex';
      });

      // Force styles for the clone to ensure high quality and correct colors
      contentClone.style.backgroundColor = 'white';
      contentClone.style.color = 'black';
      contentClone.style.padding = '20mm';
      contentClone.style.width = '100%';
      contentClone.style.height = 'auto';
      contentClone.style.overflow = 'visible';
      
      // Adjust all internal elements for light mode
      const allElements = contentClone.querySelectorAll('*');
      allElements.forEach((el: any) => {
        if (el.classList.contains('bg-white/5')) {
          el.style.backgroundColor = '#f9fafb';
          el.style.borderColor = '#e5e7eb';
        }
        if (el.classList.contains('text-white')) el.style.color = '#000000';
        if (el.classList.contains('text-gray-400')) el.style.color = '#4b5563';
        if (el.classList.contains('text-gray-300')) el.style.color = '#374151';
        if (el.classList.contains('text-purple-400')) el.style.color = '#7c3aed';
        if (el.classList.contains('border-white/5')) el.style.borderColor = '#e5e7eb';
        if (el.classList.contains('divide-white/5')) el.style.borderColor = '#e5e7eb';
        
        // Specific fixes for table
        if (el.tagName === 'TH') {
          el.style.backgroundColor = '#f3f4f6';
          el.style.color = '#000';
          el.style.borderColor = '#d1d5db';
        }
        if (el.tagName === 'TD') {
          el.style.borderColor = '#e5e7eb';
        }
      });

      printContainer.appendChild(contentClone);

      const canvas = await html2canvas(contentClone, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 794, // 210mm at 96 DPI
        onclone: (clonedDoc) => {
          // This is a secondary safety check
          const el = clonedDoc.querySelector('div') as HTMLElement;
          if (el) el.style.direction = 'rtl';
        }
      });

      document.body.removeChild(printContainer);

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Voucher_${data.reference || 'Entry'}.pdf`);
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
              dir="rtl"
              className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#0f0f1a] print:bg-white print:text-black print:overflow-visible text-right"
            >
              {loading ? (
                <div className="flex items-center justify-center h-64 no-print">
                  <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
              ) : data ? (
                <>
                  {/* Professional Header (Visible in Print/PDF) */}
                  <div className="hidden print:flex flex-row justify-between items-start border-b-2 border-black pb-6 mb-8 print-header">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 print:bg-white print:border-black print:border">
                      <div className="flex items-center gap-2 justify-start text-purple-400 print:text-black">
                        <Hash className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">رقم المرجع</span>
                      </div>
                      <p className="text-lg font-bold text-white print:text-black">{data.reference || '---'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 print:bg-white print:border-black print:border">
                      <div className="flex items-center gap-2 justify-start text-purple-400 print:text-black">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">التاريخ</span>
                      </div>
                      <p className="text-lg font-bold text-white print:text-black">{data.date}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 print:bg-white print:border-black print:border">
                      <div className="flex items-center gap-2 justify-start text-purple-400 print:text-black">
                        <FileText className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">البيان العام</span>
                      </div>
                      <p className="text-sm font-medium text-white line-clamp-2 print:text-black print:line-clamp-none">{data.description}</p>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="rounded-2xl border border-white/5 overflow-hidden print:border-black print:border print:rounded-none">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/5 print-table-header">
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right print:text-black">الحساب</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right print:text-black">البيان</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right print:text-black">مدين</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right print:text-black">دائن</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 print:divide-black">
                        {data.lines?.map((line: any, i: number) => (
                          <tr key={i} className="hover:bg-white/[0.02] smooth-transition print:bg-white print-table-row">
                            <td className="p-4">
                              <div className="flex flex-col items-start">
                                <span className="text-sm font-medium text-white print:text-black">{line.accounts?.name}</span>
                                <span className="text-[10px] text-gray-500 font-mono print:text-gray-700">{line.accounts?.code}</span>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-300 print:text-black text-right">{line.description}</td>
                            <td className="p-4 text-sm font-bold text-emerald-400 print:text-black text-right">{line.debit > 0 ? line.debit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}</td>
                            <td className="p-4 text-sm font-bold text-rose-400 print:text-black text-right">{line.credit > 0 ? line.credit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-white/5 font-bold print-table-footer">
                          <td colSpan={2} className="p-4 text-sm text-right text-gray-400 print:text-black">الإجمالي</td>
                          <td className="p-4 text-sm text-white print:text-black text-right">
                            {data.lines?.reduce((sum: number, l: any) => sum + (l.debit || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-sm text-white print:text-black text-right">
                            {data.lines?.reduce((sum: number, l: any) => sum + (l.credit || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
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
