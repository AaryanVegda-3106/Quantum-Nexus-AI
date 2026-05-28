import type { Metadata } from "next";
import { Inter } from "next/font/google";
import CursorGlow from "@/components/CursorGlow";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Quantum Nexus AI",
  description: "Futuristic AI-Powered Emerging Technologies Chatbot Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col antialiased transition-colors duration-300">
        <ThemeProvider>
          {/* Background elements */}
          <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-300/30 dark:bg-blue-900/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-300/20 dark:bg-rose-900/10 blur-[120px]" />
          </div>
          
          <CursorGlow />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
