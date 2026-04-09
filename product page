'use client';
import React from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Cpu, 
  Camera, 
  Battery, 
  ScanFace, 
  MapPin, 
  CheckCircle, 
  Clock, 
  ShoppingBag,
  UserCircle
} from 'lucide-react';

interface ComponentItem {
  name: string;
  status: string;
  price: number;
  icon: React.ReactNode;
}

export default function ProductPage() {
  // Data for the component list to keep the TSX clean
  const components: ComponentItem[] = [
    { name: "Logic Board (iCloud Clear)", status: "Working (Tested)", price: 1500, icon: <Cpu size={20} /> },
    { name: "Rear Camera Assembly", status: "Working (Tested)", price: 500, icon: <Camera size={20} /> },
    { name: "OEM Battery (Pull)", status: "Working", price: 300, icon: <Battery size={20} /> },
    { name: "TrueDepth FaceID Module", status: "Working", price: 200, icon: <ScanFace size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <Cpu className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-emerald-800 tracking-tight">ScrapStack</span>
        </div>
        <div className="hidden md:flex gap-8 text-slate-600 font-semibold text-sm">
          <a href="#" className="hover:text-emerald-600 transition">Home</a>
          <a href="#" className="text-emerald-600 border-b-2 border-emerald-600 pb-1">Marketplace</a>
          <a href="#" className="hover:text-emerald-600 transition">Our Impact</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-sm transition">
            + List Scrap
          </button>
          <UserCircle className="text-slate-400 hover:text-slate-600 cursor-pointer" size={28} />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 lg:p-12">
        {/* BACK BUTTON */}
        <button className="flex items-center text-slate-500 text-sm font-bold mb-8 hover:text-emerald-600 transition group">
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* LEFT COLUMN: IMAGES & DESCRIPTION */}
          <section className="space-y-6">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200">
              {/* Replace with your actual image state/source */}
              <img 
                src="https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?q=80&w=1000" 
                alt="Broken iPhone" 
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1592890288564-76628a30a657?q=80&w=500" className="rounded-2xl border shadow-sm aspect-square object-cover" />
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                +2 More Photos
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 italic text-slate-600 leading-relaxed shadow-sm">
              "I dropped my iPhone 11 on the pavement in Tagbilaran City, which completely shattered the screen. While the display is unusable, the Logic Board is fully functional and iCloud-unlocked."
            </div>
          </section>

          {/* RIGHT COLUMN: PRODUCT INFO */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                For Parts
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Clock size={14} /> Posted 2 Hours Ago
              </span>
            </div>
            
            <h1 className="text-4xl font-black text-slate-900 mb-2">iPhone 11 Damaged Display</h1>
            <div className="flex gap-4 text-xs text-slate-500 mb-8 font-bold">
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-emerald-500" /> De La Paz, Cortes
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle size={14} className="text-emerald-500" /> Verified Seller
              </span>
            </div>

            {/* TOTAL VALUATION CARD */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white flex justify-between items-center mb-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-1">Total Valuation</p>
                    <p className="text-5xl font-black italic">₱ 2,500</p>
                </div>
                <button className="bg-emerald-400 hover:bg-emerald-500 text-slate-900 px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-400/20">
                    <ShoppingBag size={20} /> Buy Full Unit
                </button>
            </div>

            {/* COMPONENT BREAKDOWN */}
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-4">Component Breakdown</h3>
            <div className="space-y-3">
              {components.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-slate-400 group-hover:text-emerald-500 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">{item.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-slate-900">₱{item.price.toLocaleString()}</span>
                    <ChevronRight size={16} className="text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>

            {/* SELLER MINI CARD */}
            <div className="mt-10 pt-8 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden">
                        <img src="https://i.pravatar.cc/150?u=sofia" alt="Seller" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">Sofia Borja</p>
                        <p className="text-xs text-slate-400 font-medium">Member since Feb 2024</p>
                    </div>
                </div>
                <button className="border-2 border-slate-900 text-slate-900 px-6 py-2 rounded-xl font-bold text-sm hover:bg-slate-900 hover:text-white transition">
                    Message Seller
                </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ScrapStack Product Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-gray-50">

  <div class="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
    
    <div class="lg:col-span-7">
      <button class="text-gray-500 mb-6 flex items-center gap-2 hover:text-gray-800 transition"> ← Back to Marketplace</button>
      
      <div class="rounded-2xl overflow-hidden border bg-white mb-4 shadow-sm">
        <img src="https://via.placeholder.com/600x400" alt="iPhone" class="w-full object-cover">
      </div>
      
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="bg-gray-200 h-48 rounded-2xl border shadow-sm"></div>
        <div class="bg-gray-100 h-48 rounded-2xl flex items-center justify-center text-gray-400 font-medium border-2 border-dashed border-gray-200">
          +2 More Photos
        </div>
      </div>

      <p class="text-gray-600 leading-relaxed bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        I dropped my iPhone 11 on the pavement in Tagbilaran City, which completely shattered the screen and caused the digitizer to fail. While the display is unusable, the phone still powers on and vibrates, and the Logic Board is fully functional and iCloud-unlocked. The Rear Camera Assembly, OEM Battery, and TrueDepth FaceID Module were all tested and working perfectly before the screen went dark.
      </p>
    </div>

    <div class="lg:col-span-5">
      <div class="flex justify-between items-center mb-4">
        <span class="bg-green-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">For Parts</span>
        <span class="text-gray-400 text-sm">Posted 2 Hours Ago</span>
      </div>

      <h1 class="text-4xl font-bold text-gray-900 mb-6">Iphone 11 Damaged Display</h1>

      <div class="bg-[#0b1e33] text-white p-6 rounded-2xl flex justify-between items-center mb-10 shadow-lg">
        <div>
          <p class="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-1">Total Valuation</p>
          <p class="text-4xl font-bold">₱ 2,500</p>
        </div>
        <button class="bg-[#2dd4bf] text-[#0b1e33] px-6 py-3 rounded-xl font-bold hover:brightness-110 transition active:scale-95">
          Buy Full Unit
        </button>
      </div>

      <h3 class="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4">Component Breakdown</h3>
      
      <div class="space-y-3">
        
        <div class="group border rounded-xl p-4 flex items-center justify-between hover:border-emerald-500 transition cursor-pointer bg-white shadow-sm">
          <div class="flex items-center gap-4">
            <div class="p-2 bg-gray-50 rounded-lg group-hover:bg-emerald-50 text-xl">⚙️</div>
            <div>
              <p class="font-bold text-gray-900">Logic Board (iCloud Clear)</p>
              <p class="text-xs text-gray-500">Working (Tested)</p>
            </div>
          </div>
          <div class="flex items-center gap-2 font-bold text-gray-900">
            <span>₱1,500</span>
            <span class="text-gray-300 font-normal">›</span>
          </div>
        </div>

        <div class="group border rounded-xl p-4 flex items-center justify-between hover:border-emerald-500 transition cursor-pointer bg-white shadow-sm">
          <div class="flex items-center gap-4">
            <div class="p-2 bg-gray-50 rounded-lg group-hover:bg-emerald-50 text-xl">📷</div>
            <div>
              <p class="font-bold text-gray-900">Rear Camera Assembly</p>
              <p class="text-xs text-gray-500">Working (Tested)</p>
            </div>
          </div>
          <div class="flex items-center gap-2 font-bold text-gray-900">
            <span>₱500</span>
            <span class="text-gray-300 font-normal">›</span>
          </div>
        </div>

        <div class="group border rounded-xl p-4 flex items-center justify-between hover:border-emerald-500 transition cursor-pointer bg-white shadow-sm">
          <div class="flex items-center gap-4">
            <div class="p-2 bg-gray-50 rounded-lg group-hover:bg-emerald-50 text-xl">🔋</div>
            <div>
              <p class="font-bold text-gray-900">OEM Battery (Pull)</p>
              <p class="text-xs text-gray-500">Working</p>
            </div>
          </div>
          <div class="flex items-center gap-2 font-bold text-gray-900">
            <span>₱300</span>
            <span class="text-gray-300 font-normal">›</span>
          </div>
        </div>

        <div class="group border rounded-xl p-4 flex items-center justify-between hover:border-emerald-500 transition cursor-pointer bg-white shadow-sm">
          <div class="flex items-center gap-4">
            <div class="p-2 bg-gray-50 rounded-lg group-hover:bg-emerald-50 text-xl">🛡️</div>
            <div>
              <p class="font-bold text-gray-900">TrueDepth FaceID Module</p>
              <p class="text-xs text-gray-500">Working</p>
            </div>
          </div>
          <div class="flex items-center gap-2 font-bold text-gray-900">
            <span>₱200</span>
            <span class="text-gray-300 font-normal">›</span>
          </div>
        </div>

      </div> <div class="mt-8 pt-8 border-t border-gray-200">
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                    <img src="https://via.placeholder.com/100" alt="Seller">
                </div>
                <div>
                    <p class="font-bold">Cyra Jebs Butihen</p>
                    <p class="text-xs text-gray-500">Member since Feb 2024 • 12 Sales</p>
                </div>
            </div>
            <div class="text-emerald-500 font-bold text-sm">★ 4.6</div>
        </div>
        <button class="w-full border-2 border-gray-900 rounded-xl py-3 font-bold flex items-center justify-center gap-2 hover:bg-gray-900 hover:text-white transition">
            💬 Message Seller
        </button>
      </div>

    </div>
  </div>

</body>
</html> <p class="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-1">Total Valuation

