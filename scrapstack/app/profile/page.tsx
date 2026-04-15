'use client';
import React, { useState, useEffect } from 'react';
import { 
  Bell, Plus, Leaf, TrendingUp, ChevronRight, 
  Loader2, Trash2, Package, Eye, AlertTriangle, ShoppingBag, CheckCircle, DollarSign
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
  purchasedBy?: string;
}

export default function ProfileDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveListings, setLiveListings] = useState<Listing[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<Listing[]>([]); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const [dynamicStats, setDynamicStats] = useState({
    earnings: 0,
    activeCount: 0,
    partsSalvaged: 0,
    totalSpent: 0 
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        const qSales = query(collection(db, "listings"), where("sellerId", "==", currentUser.uid));
        const qBought = query(collection(db, "listings"), where("purchasedBy", "==", currentUser.uid));
        
        const unsubscribeSales = onSnapshot(qSales, (querySnapshot) => {
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
          setDynamicStats(prev => ({ ...prev, earnings: totalEarnings, activeCount: activeListings, partsSalvaged: salvaged }));
        });

        const unsubscribeBought = onSnapshot(qBought, (querySnapshot) => {
          const bought: Listing[] = [];
          let spent = 0;
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            bought.push({ id: doc.id, ...data } as Listing);
            spent += Number(data.price || 0);
          });
          setPurchasedItems(bought);
          setDynamicStats(prev => ({ ...prev, totalSpent: spent }));
          setLoading(false);
        });

        return () => {
          unsubscribeSales();
          unsubscribeBought();
        }; 
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
    <div className="max-w-7xl mx-auto px-6 py-12 bg-slate-50/50 min-h-screen relative font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          <img src={user?.photoURL || ""} alt="Profile" className="w-16 h-16 rounded-full shadow-sm border-2 border-white" />
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Welcome back, {firstName}!</h1>
            <p className="text-slate-500 text-sm font-medium italic">
              Purchased {purchasedItems.length} units • Diverted {((dynamicStats.partsSalvaged + purchasedItems.length) * 0.5).toFixed(1)}kg of e-waste
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/marketplace?list=true')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm transition active:scale-95">
            <Plus size={18} /> List New Scrap
          </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { title: "Total Earnings", value: `₱${dynamicStats.earnings.toLocaleString()}`, trend: "Revenue", label: "from sales" },
          { title: "Active Inventory", value: dynamicStats.activeCount.toString(), trend: "Live", label: "on market" },
          { title: "Total Spent", value: `₱${dynamicStats.totalSpent.toLocaleString()}`, trend: "Investment", label: "in salvage" },
          { title: "Impact Score", value: ((dynamicStats.partsSalvaged + purchasedItems.length) * 25).toString(), trend: "Top 5%", label: "points earned" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
            <h3 className="text-slate-400 font-bold mb-4 text-[10px] uppercase tracking-widest">{stat.title}</h3>
            <div className="text-3xl font-black text-slate-900 mb-2">{stat.value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              <span className="text-emerald-500 italic">{stat.trend}</span> {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-2 space-y-8 flex flex-col">
          
          {/* ACTIVE INVENTORY */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col h-[350px]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl font-bold text-slate-900 italic">Active Listings</h2>
              <Package size={20} className="text-slate-300" />
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {liveListings.filter(i => i.status === 'ACTIVE').length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 h-full flex flex-col items-center justify-center">
                  <Package className="text-slate-200 mb-2" size={32} />
                  <p className="text-slate-500 font-medium italic text-sm">No active hardware found.</p>
                </div>
              ) : (
                liveListings.filter(i => i.status === 'ACTIVE').map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-white rounded-2xl transition border border-transparent hover:border-emerald-100 group shadow-sm">
                    <div className="flex items-center gap-4">
                      <img src={item.imageUrl} className="w-12 h-12 rounded-xl object-cover border border-slate-200" alt="t" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{item.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-100 tracking-tighter uppercase">ACTIVE</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold"><Eye size={12}/> {item.views || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-black text-slate-900 text-sm">₱{item.price?.toLocaleString()}</div>
                      <button onClick={() => confirmDelete(item.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* NEW: SOLD MANIFESTS (SALES HISTORY) */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col h-[350px]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl font-bold text-slate-900 italic">Sales History</h2>
              <DollarSign size={20} className="text-emerald-500" />
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {liveListings.filter(i => i.status === 'SOLD').length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 h-full flex flex-col items-center justify-center">
                  <DollarSign className="text-slate-200 mb-2" size={32} />
                  <p className="text-slate-500 font-medium italic text-sm">No items sold yet.</p>
                </div>
              ) : (
                liveListings.filter(i => i.status === 'SOLD').map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800">
                    <div className="flex items-center gap-4">
                      <img src={item.imageUrl} className="w-12 h-12 rounded-xl object-cover border border-white/10 opacity-80" alt="s" />
                      <div>
                        <h4 className="font-bold text-sm tracking-tight">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <CheckCircle size={12} className="text-emerald-400" />
                           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Payout Confirmed</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-emerald-400 text-sm">+₱{item.price?.toLocaleString()}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Revenue</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SALVAGE COLLECTION (PURCHASES) */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col h-[350px]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl font-bold text-slate-900 italic">Salvage Collection</h2>
              <ShoppingBag size={20} className="text-emerald-500" />
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {purchasedItems.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 h-full flex flex-col items-center justify-center">
                  <ShoppingBag className="text-slate-200 mb-2" size={32} />
                  <p className="text-slate-500 font-medium italic text-sm">No purchased salvage yet.</p>
                </div>
              ) : (
                purchasedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <img src={item.imageUrl} className="w-12 h-12 rounded-xl object-cover border border-emerald-200" alt="p" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm tracking-tight">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <CheckCircle size={12} className="text-emerald-500" />
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified Purchase</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900 text-sm">₱{item.price?.toLocaleString()}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Acquired</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR WIDGETS */}
        <div className="space-y-8">
          <div className="bg-[#116e4d] rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl border border-emerald-800">
            <Leaf className="absolute -right-12 -bottom-12 w-48 h-48 text-white/5" strokeWidth={1} />
            <h2 className="text-2xl font-black mb-3 italic tracking-tight">Eco-Impact</h2>
            <p className="text-emerald-50/80 text-xs leading-relaxed mb-6 font-medium">
              You've diverted significant e-waste from the Tagbilaran landfill. Keep it up!
            </p>
            <div className="text-4xl font-black text-white italic">
               {((dynamicStats.partsSalvaged + purchasedItems.length) * 0.5).toFixed(1)}kg
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-60">Total Mass Salvaged</div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 italic">
              <TrendingUp className="text-emerald-500" size={20} /> Demand Radar
            </h2>
            <div className="space-y-6">
              {[
                {l: "OLED Screens", v: "85%", d: "High"}, 
                {l: "Stepper Motors", v: "60%", d: "Mid"},
                {l: "Li-on Batteries", v: "40%", d: "Stable"}
              ].map((d, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[11px] font-black mb-2 uppercase tracking-tighter">
                    <span className="text-slate-700">{d.l}</span>
                    <span className="text-emerald-500">{d.d}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-emerald-400 h-1.5 rounded-full" style={{width: d.v}}></div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {isDeleting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl border border-slate-100 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-[24px] flex items-center justify-center text-red-500 mb-6 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 italic">Remove Item?</h3>
            <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed">
              Permanent action. This cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={executeDelete} className="w-full bg-red-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition shadow-lg">Confirm Delete</button>
              <button onClick={() => setIsDeleting(false)} className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition">Cancel</button>
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