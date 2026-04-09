import type { Metadata } from "next";
import "../styles/globals.css";
import Navbar from "../components/Navbar"; 
import { Smartphone, MapPin,Github, Mail } from 'lucide-react';
import Link from 'next/link';

declare module '*.css';

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

export const metadata: Metadata = {
  title: "ScrapStack | E-Waste Marketplace",
  description: "Connecting e-waste sellers with innovation in Bohol.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-slate-900">
        
        <Navbar />

        <main className="min-h-screen">
          {children}
        </main>

        <footer className="bg-[#001c30] text-white pt-16 pb-8 border-t-4 border-[#10b981]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            
            {/* Branding Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-[#10b981] rounded-lg flex items-center justify-center text-white">
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold tracking-tight">ScrapStack</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
                Reducing e-waste in the Philippines by connecting broken tech with innovation. 
                Smart components for a smarter future.
              </p>
              <div className="flex space-x-5 text-slate-400">
                <a href="#" className="hover:text-[#10b981] transition">𝕏</a>
                <a 
                  href="https://github.com/Ryel-Del/ScrapStack" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#10b981] transition"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-[#10b981] transition">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="font-bold mb-6 tracking-widest uppercase text-xs text-white">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-300">
                <li><Link href="/marketplace" className="hover:text-[#10b981] transition">Marketplace</Link></li>
                <li><Link href="/ai-diagnostic" className="hover:text-[#10b981] transition">AI Diagnostic</Link></li>
                <li><Link href="/dashboard" className="hover:text-[#10b981] transition">Seller Dashboard</Link></li>
                <li><Link href="/impact" className="hover:text-[#10b981] transition">Impact Data</Link></li>
              </ul>
            </div>

            {/* Community Links */}
            <div>
              <h4 className="font-bold mb-6 tracking-widest uppercase text-xs text-white">Community</h4>
              <ul className="space-y-4 text-sm text-slate-300">
                <li><a href="#" className="hover:text-[#10b981] transition">Engineering Forum</a></li>
                <li><a href="#" className="hover:text-[#10b981] transition">DIY Projects</a></li>
                <li><a href="#" className="hover:text-[#10b981] transition">Repair Guides</a></li>
                <li><a href="#" className="hover:text-[#10b981] transition">Local Chapters</a></li>
              </ul>
            </div>

            {/* Local & SDG Section */}
            <div className="space-y-6">
              <h4 className="font-bold mb-2 tracking-widest uppercase text-xs text-white">Local</h4>
              <div className="flex items-start space-x-2 text-sm text-[#10b981] font-medium">
                <MapPin className="w-5 h-5 mt-0.5" />
                <span>Tagbilaran City, Bohol, Philippines</span>
              </div>
              <div className="mt-4">
                <p className="text-[10px] text-slate-400 leading-tight uppercase tracking-wider">
                  Supporting SDG 12: Responsible<br /> Consumption and Production.
                </p>
              </div>
            </div>
          </div>

          {/* Copyright Section */}
          <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              © 2026 ScrapStack Philippines. All rights reserved.
            </p>
          </div>
        </footer>

      </body>
    </html>
  );
}