'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { Search, Box, Cpu, AlertCircle, Layers, ChevronRight, ChevronLeft, Zap } from 'lucide-react';

const CATEGORIES = ["All", "Computers", "Smartphones", "Laptops", "Gaming", "Robotics", "Components", "Tools", "Audio"];
const ITEMS_PER_PAGE = 6;

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [listings, setListings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // 1. DATA LISTENER (The Source)
  useEffect(() => {
    setLoading(true);
    
    // Base Query: Get everything sorted by newest
    // Note: We pull all recent items and filter SOLD items in useMemo 
    // to avoid potential Firestore "Composite Index" crashes during your live demo.
    let q = query(collection(db, "listings"), orderBy("createdAt", "desc"));

    if (activeCategory !== "All") {
      q = query(
        collection(db, "listings"), 
        where("category", "==", activeCategory), 
        orderBy("createdAt", "desc")
      );
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

  // 2. THE BULLETPROOF FILTER (The Safety Net)
  // This logic ensures SOLD items are hidden even if they exist in the 'listings' state.
  const processedListings = useMemo(() => {
    return listings.filter(item => {
      // RULE 1: Item must be ACTIVE (Case-insensitive check for safety)
      const isActive = item.status?.toUpperCase() === "ACTIVE";
      
      // RULE 2: Matches Search Query
      const matchesSearch = 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return isActive && matchesSearch;
    });
  }, [listings, searchQuery]);

  // 3. PAGINATION LOGIC
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  const totalPages = Math.ceil(processedListings.length / ITEMS_PER_PAGE);
  const paginatedListings = processedListings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-white lg:h-screen flex flex-col lg:overflow-hidden">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Marketplace</h1>
            <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
              <Zap size={12} fill="currentColor" className="animate-pulse" /> 
              {processedListings.length} Live Manifests
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium italic">Hardware salvage hub for Local Innovators.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Search parts (e.g. Joycon, SSD)..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-10 lg:flex-1 lg:overflow-hidden">
        
        {/* SIDEBAR CATEGORIES */}
        <aside className="w-full lg:w-64 shrink-0 space-y-8 lg:overflow-y-auto pr-2 custom-scrollbar">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Layers size={14} /> Salvage Classes
            </h3>
          
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-between group whitespace-nowrap lg:whitespace-normal ${
                    activeCategory === cat 
                    ? 'bg-slate-900 text-white shadow-xl lg:translate-x-1' 
                    : 'text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-100'
                  }`}
                >
                  <span>{cat}</span>
                  <ChevronRight size={14} className={`hidden lg:block transition-transform ${activeCategory === cat ? 'translate-x-0' : '-translate-x-2 opacity-0'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-emerald-500 rounded-[32px] p-6 text-slate-900 relative overflow-hidden shadow-lg border border-emerald-400">
            <Cpu className="absolute -right-4 -bottom-4 w-20 h-20 text-black/10" />
            <p className="text-[14px] font-extrabold leading-tight mb-4 opacity-90 relative z-10 italic">Need a specific component?</p>
            <button className="w-full py-3 bg-slate-900 text-white text-[9px] font-black rounded-xl hover:bg-black transition-colors relative z-10 uppercase tracking-widest shadow-lg">
              REQUEST PART
            </button>
          </div>
        </aside>

        {/* LISTINGS GRID */}
        <main className="flex-1 flex flex-col lg:overflow-hidden">
          <div className="flex-1 lg:overflow-y-auto pr-0 lg:pr-4 custom-scrollbar">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-[450px] bg-slate-50 rounded-[40px] animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : paginatedListings.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
                <Box className="mx-auto text-slate-200 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-800 tracking-tight uppercase italic">No Active Manifests</h3>
                <p className="text-slate-500 text-sm italic mt-2">All current hardware has been secured by other innovators.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                {paginatedListings.map((item) => (
                  <div key={item.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 group flex flex-col border-b-4 border-b-slate-100 hover:border-b-emerald-500">
                    
                    <div className="aspect-[16/11] bg-slate-100 relative overflow-hidden">
                      <img 
                        src={item.imageUrl || "https://placehold.co/600x400?text=Hardware"} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" 
                        alt={item.title}
                      />
                      <div className="absolute top-5 left-5 backdrop-blur-md bg-slate-900/70 px-4 py-2 rounded-2xl text-[9px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        {item.conditionMode === 'harvest' ? <Cpu size={12} className="text-emerald-400" /> : <AlertCircle size={12} className="text-amber-400" />}
                        {item.conditionMode || "Hardware"}
                      </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-2xl font-black text-slate-900 mb-4 leading-none group-hover:text-emerald-600 transition-colors italic tracking-tighter">
                        {item.title}
                      </h3>

                      <div className="space-y-2 mb-8 flex-1">
                        {item.components?.slice(0, 3).map((comp: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                            <span className="text-[11px] font-bold text-slate-600">{comp.name}</span>
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{comp.health}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valuation</p>
                          <div className="text-3xl font-black text-slate-900 italic tracking-tighter">
                            ₱{item.price?.toLocaleString()}
                          </div>
                        </div>
                        <Link href={`/marketplace/${item.id}`}>
                          <button className="bg-slate-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black hover:bg-emerald-500 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 uppercase tracking-widest">
                            VIEW MANIFEST
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PAGINATION FOOTER */}
          {totalPages > 1 && (
            <footer className="shrink-0 py-6 border-t border-slate-50 bg-white flex justify-center items-center gap-4">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                      currentPage === num ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </footer>
          )}
        </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}