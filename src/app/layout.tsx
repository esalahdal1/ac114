import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({ 
  subsets: ["arabic"],
  weight: ['200', '300', '400', '500', '700', '800', '900']
});

export const metadata: Metadata = {
  title: "نظام محاسبي متطور",
  description: "لوحة تحكم محاسبية حديثة بتصميم زجاجي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={tajawal.className}>
        <div className="bg-mesh" />
        {children}
      </body>
    </html>
  );
}
