'use client';
import React, { useState, useEffect } from 'react';
import { Bell, Plus, Settings, Leaf, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  views: number;
  date: string;
}

export default function ProfileDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [liveListings, setLiveListings] = useState<Listing[]>([]);
  const [dynamicStats, setDynamicStats] = useState({
    earnings: 0,
    activeCount: 0,
    partsSalvaged: 0
  });

  useEffect(() => {
    // 1. Listen for Auth State
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // 2. Setup Real-time Firestore Listener
        const q = query(
          collection(db, "listings"), 
          where("sellerId", "==", currentUser.uid)
        );

        const unsubscribeDb = onSnapshot(q, (querySnapshot) => {
          const fetchedListings: Listing[] = [];
          let totalEarnings = 0;
          let activeListings = 0;
          let salvaged = 0;

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedListings.push({ id: doc.id, ...data } as Listing);
            
            // Live calculation of stats
            if (data.status === 'SOLD') {
              totalEarnings += Number(data.price || 0);
              salvaged += 1;
            } else if (data.status === 'ACTIVE') {
              activeListings += 1;
            }
          });

          setLiveListings(fetchedListings);
          setDynamicStats({
            earnings: totalEarnings,
            activeCount: activeListings,
            partsSalvaged: salvaged
          });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-emerald-500">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-sm font-bold animate-pulse">Syncing with ScrapStack...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const firstName = user.displayName ? user.displayName.split(' ')[0] : 'Innovator';

  const stats = [
    { title: "Total Earnings", value: `₱${dynamicStats.earnings.toLocaleString()}`, trend: "Lifetime", label: "total sales", color: "text-emerald-500" },
    { title: "Active Listings", value: dynamicStats.activeCount.toString(), trend: "Live", label: "on marketplace", color: "text-emerald-500" },
    { title: "Parts Salvaged", value: dynamicStats.partsSalvaged.toString(), trend: "Success", label: "items sold", color: "text-emerald-500" },
    { title: "Impact Score", value: (dynamicStats.partsSalvaged * 25).toString(), trend: "Top 5%", label: "points earned", color: "text-emerald-500" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-slate-50/50 min-h-screen">
      
      {/* WELCOME HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          {user.photoURL && (
            <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full shadow-sm border-2 border-white" />
          )}
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="text-slate-500 text-sm">You've diverted {(dynamicStats.partsSalvaged * 0.5).toFixed(1)}kg of e-waste from landfills.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm transition">
            <Bell size={20} />
          </button>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition">
            <Plus size={18} /> List New Scrap
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between transition-transform hover:scale-[1.02]">
            <h3 className="text-slate-400 font-bold mb-4">{stat.title}</h3>
            <div className="text-3xl font-black text-slate-900 mb-2">{stat.value}</div>
            <div className="text-xs font-medium text-slate-400">
              <span className={stat.color}>{stat.trend}</span> {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECENT LISTINGS SECTION */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Your Recent Listings</h2>
              {liveListings.length > 0 && <button className="text-emerald-500 font-bold text-sm hover:underline">View all</button>}
            </div>
            
            <div className="space-y-4">
              {liveListings.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">You don't have any listings yet!</p>
                  <p className="text-sm text-slate-400 mt-1">Click 'List New Scrap' to get started.</p>
                </div>
              ) : (
                liveListings.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition border border-transparent hover:border-slate-100 group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-emerald-500 transition-colors">
                        <Settings size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{item.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">{item.date || 'Just now'} • {item.views || 0} views</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-black text-slate-900">₱{item.price}</div>
                        <div className={`text-[10px] font-black tracking-widest uppercase ${item.status === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {item.status}
                        </div>
                      </div>
                      <button className="text-slate-300 hover:text-slate-600 transition opacity-0 group-hover:opacity-100">
                        <Settings size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* IMPACT BANNER */}
          <div className="bg-[#116e4d] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
            <Leaf className="absolute -right-10 -bottom-10 w-48 h-48 text-white/10" strokeWidth={1} />
            <div className="relative z-10 max-w-md">
              <h2 className="text-2xl font-bold mb-3">You're an Innovator!</h2>
              <p className="text-emerald-50 text-sm leading-relaxed mb-6">
                By participating in the circular economy, you are directly supporting sustainable tech in your local area.
              </p>
              <button className="bg-white text-[#116e4d] px-6 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-50 transition shadow-sm">
                Share Your Impact
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR WIDGETS */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={20} /> Local Demand
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-700">OLED Screens</span>
                  <span className="text-emerald-500 text-[10px] uppercase bg-emerald-50 px-2 py-0.5 rounded">High Demand</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-emerald-400 h-1.5 rounded-full w-[85%]"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-700">Stepper Motors</span>
                  <span className="text-blue-500 text-[10px] uppercase bg-blue-50 px-2 py-0.5 rounded">Trending</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-blue-400 h-1.5 rounded-full w-[60%]"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-700">Li-on Batteries</span>
                  <span className="text-slate-500 text-[10px] uppercase bg-slate-100 px-2 py-0.5 rounded">Stable</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-slate-400 h-1.5 rounded-full w-[40%]"></div></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Innovation Tip</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              Before listing a laptop, try connecting an external monitor. If it displays, the motherboard is good! High value for robotics projects.
            </p>
            <a href="https://www.ifixit.com/" target='blank' className="text-emerald-500 font-bold text-sm hover:underline flex items-center gap-1">
              Read Repair Guides <ChevronRight size={16} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}