'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // 1. IMPORT LINK
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { Search, MapPin, Tag, Box, Cpu, AlertCircle, Layers, ChevronRight } from 'lucide-react';

const CATEGORIES = ["All", "Smartphones", "Laptops", "Robotics", "Components", "Audio"];

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [listings, setListings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
    
    if (activeCategory !== "All") {
      q = query(collection(db, "listings"), where("category", "==", activeCategory), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeCategory]);

  const filteredListings = listings.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Marketplace</h1>
          <p className="text-slate-500 text-sm mt-1">Bohol's specialized hub for salvaged tech and components.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Search parts (e.g. LCD, SSD, Motor)..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-48 shrink-0 space-y-8">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Layers size={14} /> Browse Categories
            </h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-between group ${
                    activeCategory === cat 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100' 
                    : 'text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-100'
                  }`}
                >
                  {cat}
                  {activeCategory !== cat && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
            <Cpu className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
            <h4 className="font-bold text-sm mb-2 relative z-10 text-emerald-400">Builder's Guild</h4>
            <p className="text-[10px] leading-relaxed mb-4 text-slate-400 relative z-10">Need a specific IC or controller? Post a request to local builders.</p>
            <button className="w-full py-2.5 bg-white text-slate-900 text-[10px] font-black rounded-xl hover:bg-emerald-400 transition-colors relative z-10">
              REQUEST A PART
            </button>
          </div>
        </aside>

        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-96 bg-slate-50 rounded-[32px]" />)}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
              <Box className="mx-auto text-slate-200 mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-800">No items found</h3>
              <p className="text-slate-500 text-sm">Try adjusting your search or category filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredListings.map((item) => (
                <div key={item.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                  <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                    <img 
                      src={item.imageUrl || "https://placehold.co/600x400?text=Electronic+Scrap"} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                    />
                    <div className={`absolute top-4 left-4 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-1.5 ${
                      item.isUntested ? 'bg-amber-500/80' : 'bg-slate-900/60'
                    }`}>
                      {item.isUntested ? <AlertCircle size={10} /> : <Cpu size={10} />}
                      {item.isUntested ? "Untested Unit" : "Harvested Parts"}
                    </div>
                  </div>

                  <div className="p-7 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Tag size={10} /> {item.category || "General Tech"}
                      </p>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-4 leading-tight group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h3>

                    <div className="space-y-2 mb-6 flex-1">
                      {item.components?.slice(0, 3).map((comp: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-100/50 px-3 py-2.5 rounded-2xl">
                          <span className="text-xs font-bold text-slate-700 truncate mr-2">{comp.name}</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            parseInt(comp.health) > 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {comp.health}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Estimated Value</p>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">
                          ₱{item.price?.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold">
                          <MapPin size={12} className="text-emerald-500" /> {item.location}
                        </div>
                        
                        {/* 2. WRAP BUTTON IN LINK */}
                        <Link href={`/marketplace/${item.id}`} className="block w-full">
                          <button className="w-full bg-slate-100 group-hover:bg-emerald-500 group-hover:text-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black transition-all">
                            VIEW DETAILS
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}