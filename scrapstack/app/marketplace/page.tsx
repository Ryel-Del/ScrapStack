'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { Search, MapPin, Tag } from 'lucide-react';

const CATEGORIES = ["All", "Smartphones", "Laptops", "Robotics", "Components", "Audio"];

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [listings, setListings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Create a dynamic query based on category
    let q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
    
    if (activeCategory !== "All") {
      q = query(collection(db, "listings"), where("category", "==", activeCategory), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeCategory]);

  // Filter listings by search query locally for speed
  const filteredListings = listings.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Marketplace</h1>
          <p className="text-slate-500 text-sm">Find the specific components you need for your next project</p>
        </div>
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Search For Parts (e.g. LCD, Stepper Motor)..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-10">
        {/* SIDEBAR */}
        <aside className="w-48 shrink-0 space-y-8">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Tag size={14} /> Categories
            </h3>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left px-4 py-2 rounded-lg font-bold text-sm transition ${
                    activeCategory === cat ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* WANTED AD PROMO */}
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <h4 className="text-emerald-900 font-bold text-sm mb-2">Need Something Specific?</h4>
            <p className="text-[10px] text-emerald-700 leading-relaxed mb-4">You can post "Wanted" ads for specific hard-to-find components.</p>
            <button className="w-full py-2 bg-emerald-500 text-white text-xs font-black rounded-lg hover:bg-emerald-600 transition">
              Post Wanted Ad
            </button>
          </div>
        </aside>

        {/* GRID */}
        <main className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {filteredListings.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition group">
              <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
                <img src={item.imageUrl || "https://placehold.co/600x400?text=Component"} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute top-4 left-4 bg-slate-900/50 backdrop-blur px-3 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest">
                  {item.conditionTag || "FOR PARTS"}
                </div>
              </div>
              <div className="p-6">
                <p className="text-emerald-500 text-[10px] font-black uppercase mb-1 tracking-widest flex items-center gap-1">
                  <Tag size={10} /> {item.category}
                </p>
                <h3 className="text-lg font-bold text-slate-900 mb-4">{item.title}</h3>
                <div className="flex gap-2 mb-6 flex-wrap">
                  {item.tags?.map((tag: string) => (
                    <span key={tag} className="bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded-full font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <div className="text-2xl font-black text-slate-900">₱ {item.price?.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                    <MapPin size={12} /> {item.location || "Tagbilaran City"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}