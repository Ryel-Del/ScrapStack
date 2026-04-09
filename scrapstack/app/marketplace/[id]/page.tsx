'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ArrowLeft, ChevronRight, Cpu, Camera, Battery, 
  ScanFace, MapPin, CheckCircle, Clock, ShoppingBag, UserCircle, MessageSquare, Loader2 
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      const docRef = doc(db, "listings", id as string);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setListing(docSnap.data());
      } else {
        router.push('/marketplace');
      }
      setLoading(false);
    };
    fetchListing();
  }, [id]);

  const handleBuy = async () => {
    if (!listing) return;
    const confirmBuy = confirm(`Do you want to reserve this ${listing.title} for ₱${listing.price}?`);
    
    if (confirmBuy) {
      const docRef = doc(db, "listings", id as string);
      await updateDoc(docRef, {
        status: "SOLD",
        soldAt: serverTimestamp()
      });
      alert("Success! Item reserved. Please contact the seller for pickup details.");
      router.push('/marketplace');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-emerald-500" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <main className="max-w-6xl mx-auto p-6 lg:p-12">
        {/* BACK BUTTON */}
        <button 
          onClick={() => router.back()}
          className="flex items-center text-slate-500 text-sm font-bold mb-8 hover:text-emerald-600 transition group"
        >
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: IMAGES & DESCRIPTION (7 Cols) */}
          <section className="lg:col-span-7 space-y-6">
            <div className="rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 bg-white">
              <img 
                src={listing.imageUrl || "https://placehold.co/600x400?text=No+Image"} 
                alt={listing.title} 
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {listing.imageGallery?.slice(1, 2).map((url: string, i: number) => (
                 <img key={i} src={url} className="rounded-2xl border shadow-sm aspect-square object-cover" />
               ))}
               <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                +{listing.imageGallery?.length > 1 ? listing.imageGallery.length - 1 : 0} More Photos
               </div>
            </div>

            <div className="bg-white p-8 rounded-[24px] border border-slate-100 text-slate-600 leading-relaxed shadow-sm text-sm">
              "{listing.description || "No description provided by the seller."}"
            </div>
          </section>

          {/* RIGHT COLUMN: PRODUCT INFO (5 Cols) */}
          <section className="lg:col-span-5">
            <div className="flex justify-between items-center mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${listing.isUntested ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {listing.isUntested ? "Untested Unit" : "For Parts"}
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                <Clock size={14} /> {listing.createdAt ? "Recently Posted" : "Active"}
              </span>
            </div>
            
            <h1 className="text-4xl font-black text-slate-900 mb-6 leading-tight">{listing.title}</h1>
            
            <div className="flex gap-4 text-[10px] text-slate-500 mb-8 font-black uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-500" /> {listing.location}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-500" /> Verified Seller
              </span>
            </div>

            {/* TOTAL VALUATION CARD */}
            <div className="bg-[#0b1e33] rounded-[32px] p-8 text-white flex justify-between items-center mb-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black mb-1 opacity-70">Total Valuation</p>
                    <p className="text-4xl font-black italic text-emerald-50">₱{listing.price?.toLocaleString()}</p>
                </div>
                <button 
                  onClick={handleBuy}
                  className="bg-emerald-400 hover:bg-emerald-500 text-slate-900 px-6 py-4 rounded-2xl font-black flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-400/20"
                >
                    <ShoppingBag size={20} /> {listing.isUntested ? "Buy Unit" : "Reserve All"}
                </button>
            </div>

            {/* COMPONENT BREAKDOWN */}
            <h3 className="font-black text-slate-900 uppercase tracking-[0.15em] text-[11px] mb-4 ml-1">Component Breakdown</h3>
            <div className="space-y-3">
              {listing.components?.map((item: any, idx: number) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[20px] hover:border-emerald-200 hover:shadow-md transition-all group cursor-default"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-500 transition-colors">
                      <Cpu size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{item.health}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900 text-sm">₱{item.price?.toLocaleString()}</span>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </div>
              ))}
            </div>

            {/* SELLER MINI CARD */}
            <div className="mt-12 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            <img src={`https://i.pravatar.cc/150?u=${listing.sellerId}`} alt="Seller" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">Authorized Seller</p>
                            <p className="text-[10px] text-slate-400 font-bold">Member Since 2026 • 10+ Sales</p>
                        </div>
                    </div>
                    <div className="text-emerald-500 font-black text-xs bg-emerald-50 px-3 py-1 rounded-lg">★ 4.9</div>
                </div>
                <button className="w-full border-2 border-slate-900 text-slate-900 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                    <MessageSquare size={18} /> Message Seller
                </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}