'use client';
import React, { useState, useEffect } from 'react';
import { 
  Bell, Plus, Settings, Leaf, TrendingUp, ChevronRight, 
  Loader2, Trash2, Package, Eye, AlertTriangle, X 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  views: number;
  imageUrl: string;
  createdAt: any;
}

export default function ProfileDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveListings, setLiveListings] = useState<Listing[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const [dynamicStats, setDynamicStats] = useState({
    earnings: 0,
    activeCount: 0,
    partsSalvaged: 0
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const q = query(collection(db, "listings"), where("sellerId", "==", currentUser.uid));
        
        const unsubscribeDb = onSnapshot(q, (querySnapshot) => {
          const fetchedListings: Listing[] = [];
          let totalEarnings = 0;
          let activeListings = 0;
          let salvaged = 0;

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedListings.push({ id: doc.id, ...data } as Listing);
            if (data.status === 'SOLD') {
              totalEarnings += Number(data.price || 0);
              salvaged += 1;
            } else if (data.status === 'ACTIVE') {
              activeListings += 1;
            }
          });

          setLiveListings(fetchedListings);
          setDynamicStats({ earnings: totalEarnings, activeCount: activeListings, partsSalvaged: salvaged });
          setLoading(false);
        }, (error) => {
          console.error("Firestore error:", error);
          setLoading(false);
        });

        return () => unsubscribeDb(); 
      } else {
        router.push('/');
        setLoading(false);
      }
    });

    return () => unsubscribeAuth(); 
  }, [router]);

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleting(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, "listings", itemToDelete));
      setIsDeleting(false);
      setItemToDelete(null);
    } catch (e) {
      alert("Delete failed.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
    </div>
  );

  const firstName = user?.displayName?.split(' ')[0] || 'Innovator';

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-slate-50/50 min-h-screen relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          <img src={user?.photoURL || ""} alt="Profile" className="w-16 h-16 rounded-full shadow-sm border-2 border-white" />
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Welcome back, {firstName}!</h1>
            <p className="text-slate-500 text-sm font-medium">You've diverted {(dynamicStats.partsSalvaged * 0.5).toFixed(1)}kg of e-waste from landfills.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition shadow-sm">
            <Bell size={20} />
          </button>
          <button onClick={() => router.push('/marketplace')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition active:scale-95">
            <Plus size={18} /> List New Scrap
          </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { title: "Total Earnings", value: `₱${dynamicStats.earnings.toLocaleString()}`, trend: "Lifetime", label: "total sales" },
          { title: "Active Listings", value: dynamicStats.activeCount.toString(), trend: "Live", label: "on marketplace" },
          { title: "Parts Salvaged", value: dynamicStats.partsSalvaged.toString(), trend: "Success", label: "items sold" },
          { title: "Impact Score", value: (dynamicStats.partsSalvaged * 25).toString(), trend: "Top 5%", label: "points earned" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
            <h3 className="text-slate-400 font-bold mb-4 text-[10px] uppercase tracking-widest">{stat.title}</h3>
            <div className="text-3xl font-black text-slate-900 mb-2">{stat.value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              <span className="text-emerald-500">{stat.trend}</span> {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECENT LISTINGS BOX */}
        <div className="lg:col-span-2 space-y-8 flex flex-col">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col h-[520px]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl font-bold text-slate-900 italic">Your Active Inventory</h2>
              <Package size={20} className="text-slate-300" />
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {liveListings.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 h-full flex flex-col items-center justify-center">
                  <Package className="text-slate-200 mb-2" size={40} />
                  <p className="text-slate-500 font-medium italic">No active hardware found.</p>
                </div>
              ) : (
                liveListings.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-white rounded-2xl transition border border-transparent hover:border-emerald-100 group shadow-sm">
                    <div className="flex items-center gap-4">
                      <img src={item.imageUrl} className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-sm" alt="t" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{item.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                           <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border tracking-tighter uppercase ${item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500'}`}>{item.status}</span>
                           <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold"><Eye size={12}/> {item.views || 0} views</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-black text-slate-900 text-sm">₱{item.price?.toLocaleString()}</div>
                      <button onClick={() => confirmDelete(item.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* FIXED IMPACT BANNER */}
          <div className="bg-[#116e4d] rounded-[32px] p-10 text-white relative overflow-hidden shadow-xl border border-emerald-800 shrink-0">
            <Leaf className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5" strokeWidth={1} />
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-3 italic tracking-tight">You're an Innovator!</h2>
              <p className="text-emerald-50/80 text-sm leading-relaxed mb-8 max-w-sm font-medium">
                Supporting the circular economy at HNU, one component at a time. Every part saved counts toward our community goal.
              </p>
              <button className="bg-white text-[#116e4d] px-8 py-3 rounded-2xl font-black text-xs hover:bg-emerald-50 transition shadow-lg active:scale-95">
                SHARE YOUR IMPACT
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR WIDGETS */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={20} /> Demand Radar
            </h2>
            <div className="space-y-6">
              {[
                {l: "OLED Screens", v: "85%", d: "High"}, 
                {l: "Stepper Motors", v: "60%", d: "Mid"},
                {l: "Li-on Batteries", v: "40%", d: "Stable"}
              ].map((d, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[11px] font-bold mb-2 uppercase tracking-tight">
                    <span className="text-slate-700">{d.l}</span>
                    <span className="text-emerald-500 font-black">{d.d}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-emerald-400 h-1.5 rounded-full" style={{width: d.v}}></div></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4 italic">Innovation Tip</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-4 italic font-medium">
              "A working motherboard is worth 3x the price of the copper inside. Always test the ports before harvesting!"
            </p>
            {/* RESTORED IFIXIT LINK */}
            <a href="https://www.ifixit.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-500 font-bold text-sm hover:underline flex items-center gap-1">
              Read Build Guides <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* CUSTOM POPUP: DELETE CONFIRMATION */}
      {isDeleting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-red-50 rounded-[24px] flex items-center justify-center text-red-500 mb-6 mx-auto">
              <AlertTriangle size={32} />
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-2 italic">Remove Item?</h3>
            <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed px-2">
              Are you sure you want to delete this listing? This action is permanent and cannot be undone.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={executeDelete}
                className="w-full bg-red-500 text-white py-5 rounded-2xl font-black text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-100 uppercase tracking-widest"
              >
                Confirm Delete
              </button>
              <button 
                onClick={() => setIsDeleting(false)}
                className="w-full bg-slate-100 text-slate-500 py-5 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}