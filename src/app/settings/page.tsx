"use client";

import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { 
  Settings as SettingsIcon, 
  Building2, 
  Globe, 
  Coins, 
  Save,
  Bell,
  Lock,
  Palette
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [settings, setSettings] = useState({
    companyName: "شركة الأعمال المحدودة",
    taxNumber: "300012345600003",
    currency: "SAR",
    language: "ar",
    notifications: true,
    theme: "dark"
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("تم حفظ الإعدادات بنجاح!");
    }, 1000);
  };

  const tabs = [
    { id: "general", label: "عام", icon: Building2 },
    { id: "localization", label: "اللغة والعملة", icon: Globe },
    { id: "notifications", label: "التنبيهات", icon: Bell },
    { id: "security", label: "الأمان", icon: Lock },
    { id: "appearance", label: "المظهر", icon: Palette },
  ];

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Topbar />
      
      <main className="pr-72 pt-28 pl-8 pb-8">
        <PageTransition>
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1 text-right">
                <h1 className="text-3xl font-bold text-white">الإعدادات</h1>
                <p className="text-gray-400 text-sm">تخصيص النظام ومعلومات المنشأة.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Tabs Sidebar */}
              <div className="lg:col-span-1 space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl smooth-transition text-right flex-row-reverse",
                      activeTab === tab.id 
                        ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" 
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Settings Form */}
              <div className="lg:col-span-3">
                <GlassCard className="p-8 space-y-8">
                  {activeTab === "general" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="space-y-4 text-right">
                        <label className="text-sm font-medium text-gray-400">اسم المنشأة</label>
                        <input 
                          type="text" 
                          value={settings.companyName}
                          onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 smooth-transition text-right"
                        />
                      </div>
                      <div className="space-y-4 text-right">
                        <label className="text-sm font-medium text-gray-400">الرقم الضريبي</label>
                        <input 
                          type="text" 
                          value={settings.taxNumber}
                          onChange={(e) => setSettings({...settings, taxNumber: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 smooth-transition text-right font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "localization" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 text-right">
                          <label className="text-sm font-medium text-gray-400">العملة الافتراضية</label>
                          <select 
                            value={settings.currency}
                            onChange={(e) => setSettings({...settings, currency: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 smooth-transition appearance-none text-right"
                          >
                            <option value="SAR" className="bg-[#0f0f1a]">ريال سعودي (SAR)</option>
                            <option value="USD" className="bg-[#0f0f1a]">دولار أمريكي (USD)</option>
                            <option value="AED" className="bg-[#0f0f1a]">درهم إماراتي (AED)</option>
                          </select>
                        </div>
                        <div className="space-y-4 text-right">
                          <label className="text-sm font-medium text-gray-400">لغة النظام</label>
                          <select 
                            value={settings.language}
                            onChange={(e) => setSettings({...settings, language: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 smooth-transition appearance-none text-right"
                          >
                            <option value="ar" className="bg-[#0f0f1a]">العربية</option>
                            <option value="en" className="bg-[#0f0f1a]">English</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-8 border-t border-white/5 flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl smooth-transition shadow-lg shadow-purple-500/20 disabled:opacity-50"
                    >
                      {loading ? <SettingsIcon className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      حفظ التغييرات
                    </button>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
