'use client';

import React from 'react';
import { 
  Recycle, 
  Users, 
  Leaf, 
  Banknote, 
  Globe, 
  BarChart3 
} from 'lucide-react';

export default function ImpactPage() {
  const stats = [
    { label: "E-WASTE SAVED", value: "1.2 Tons", icon: <Recycle size={24} />, color: "bg-emerald-100 text-emerald-600" },
    { label: "INNOVATORS SUPPORTED", value: "1000+", icon: <Users size={24} />, color: "bg-blue-100 text-blue-600" },
    { label: "CO2 OFFSET", value: "3,400 kg", icon: <Leaf size={24} />, color: "bg-green-100 text-green-600" },
    { label: "REPAIR ECONOMY", value: "₱ 850K+", icon: <Banknote size={24} />, color: "bg-yellow-100 text-yellow-600" },
  ];

  return (
    <main className="w-full bg-white">
      {/* 1. GREEN HERO SECTION */}
      <section className="w-full bg-[#065f46] text-white pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
              Measuring Our Digital Footprint in the Philippines.
            </h1>
            <p className="text-emerald-50/80 text-lg leading-relaxed max-w-xl">
              ScrapStack isn't just a marketplace; it's a movement to turn e-waste into education and innovation. 
              Every component salvaged is a step toward a circular economy.
            </p>
          </div>
          <div className="relative rounded-[32px] overflow-hidden border-4 border-white/10 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070" 
              alt="Green Tech Header" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-emerald-900/20 mix-blend-multiply"></div>
          </div>
        </div>
      </section>

      {/* 2. FLOATING STATS CARDS */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 mb-24 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[32px] shadow-2xl border border-slate-50 flex flex-col items-start transition-transform hover:-translate-y-2">
              <div className={`p-4 rounded-2xl mb-6 ${stat.color}`}>
                {stat.icon}
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
              <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. THE PROBLEM SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-20 items-start">
        <div className="space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              The Problem: Philippines' E-Waste Crisis
            </h2>
            <p className="text-slate-500 leading-relaxed text-lg">
              The Philippines generates approximately 32,000 tons of e-waste annually. 
              Most of it ends up in landfills, leaching toxic chemicals into our soil and water. 
              In Tagbilaran, students struggle to find affordable components for their projects, 
              while high-value electronics are discarded daily.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-5 p-8 bg-slate-50 rounded-[32px] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
              <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                <Globe size={28} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2 text-xl">Environmental Impact</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  While shipping remains a viable option for sourcing, utilizing a localized 
                  pool of components significantly reduces the carbon footprint associated 
                  with transporting new parts from distant suppliers.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-5 p-8 bg-slate-50 rounded-[32px] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
              <div className="p-4 bg-blue-100 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                <BarChart3 size={28} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2 text-xl">Circular Economics</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  We shift the mindset from "Broken = Trash" to "Broken = Collection of Parts", 
                  extending the lifecycle of every device by up to 300%.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. IMAGE & TESTIMONIAL OVERLAY */}
        <div className="relative group">
          <div className="aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80" 
              alt="E-waste Pile" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          
          {/* Testimonial Box */}
          <div className="absolute bottom-8 left-8 right-8 bg-[#001c30] p-8 rounded-[32px] text-white shadow-2xl border border-white/10 backdrop-blur-sm">
            <p className="italic text-lg mb-6 text-slate-200 font-medium">
              "ScrapStack helped me source a Retina display for my final project at 1/10th the retail price."
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white shadow-inner">
                JC
              </div>
              <div>
                <p className="font-bold text-lg">Jeremy Chua</p>
                <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">Engineering Student</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Extra space before the global footer kicks in */}
      <div className="h-24"></div>
    </main>
  );
}