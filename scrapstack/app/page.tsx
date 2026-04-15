'use client';

import React, { useState } from 'react';
import Link from 'next/link'; 
import { Brain, BarChart3, Zap } from 'lucide-react';


import ListScrapModal from '../components/ListScrapModel'; 

export default function Home() {
 
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white text-slate-900 min-h-screen w-full flex flex-col">
      
      {/* HERO SECTION */}
      <section className="w-full">
        <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-6xl md:text-8xl font-extrabold leading-[1.05] tracking-tight text-slate-900">
              Your Broken<br />Tech is<br /><span className="text-[#10b981] italic">Smart Scrap.</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
              ScrapStack connects e-waste sellers with engineering students and DIYers. 
              Don't throw it away—part it out and fuel local innovation.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/marketplace">
                <button className="bg-[#2d2d2d] hover:bg-black text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-xl active:scale-95">
                  Browse Marketplace
                </button>
              </Link>
              
              <button 
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="border-2 border-[#10b981] text-[#10b981] hover:bg-emerald-50 transition px-8 py-4 rounded-xl font-bold text-lg active:scale-95"
              >
                List Your Scrap +
              </button>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-50">
            <img 
              src="https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=2070&auto=format&fit=crop" 
              className="w-full h-full object-cover" 
              alt="E-waste salvage" 
            />
          </div>
        </main>
      </section>

      {/* HOW IT WORKS */}
      <section className="w-full bg-[#f8fafc] py-24 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">How ScrapStack Works</h2>
          <p className="text-slate-500 max-w-2xl mx-auto mb-16 text-lg font-medium italic">We use Gemini AI to identify high-value internals hidden in your e-waste.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Brain />, title: "AI Component ID", desc: "Our AI identifies working parts in your broken gadgets instantly." },
              { icon: <BarChart3 />, title: "Fair Valuation", desc: "Get real-time market value for salvageable components in the local market." },
              { icon: <Zap />, title: "Innovator Supply", desc: "Providing affordable parts for builders and engineers at HNU." }
            ].map((item, i) => (
              <div key={i} className="bg-white p-12 rounded-[32px] shadow-sm flex flex-col items-center border border-slate-100 hover:shadow-lg transition group">
                <div className="text-slate-900 mb-6 scale-150 group-hover:text-emerald-500 transition-colors">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-4 italic tracking-tight">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="w-full bg-[#065f46] py-24 text-center">
        <div className="max-w-4xl mx-auto px-6 text-white">
          <h2 className="text-5xl font-extrabold mb-8 tracking-tighter italic">Ready to Declutter and Innovate?</h2>
          <p className="text-emerald-50/80 text-xl mb-12 font-medium">Join the circular economy movement in the Philippines.</p>
          <div className="flex justify-center gap-4">
            <button 
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-[#10b981] hover:bg-emerald-400 px-10 py-5 rounded-2xl font-bold text-xl transition shadow-xl active:scale-95"
            >
              List Your Scrap
            </button>
          
            <Link href="/impact">
              <button className="border border-white/20 hover:bg-white/10 px-10 py-5 rounded-2xl font-bold text-xl transition active:scale-95">
                View Our Impact
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* MODAL MOUNTING */}
      {isModalOpen && (
        <ListScrapModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}