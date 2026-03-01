import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/layout/HeroSection";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "追基日报 | 基金投资早报",
  description: "每日基金估值、组合管理 - 您的基金投资早报",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700&family=Libre+Baskerville:wght@400;700&family=Playfair+Display:wght@500;600;700&family=JetBrains+Mono:wght@400;500&family=Source+Sans+3:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-news-bg text-news-text antialiased flex flex-col">
        <Header />
        <div className="max-w-7xl mx-auto px-4 w-full">
          <HeroSection />
        </div>
        <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

