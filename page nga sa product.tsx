'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ArrowLeft, Cpu, MapPin, CheckCircle, 
  Clock, ShoppingBag, MessageSquare, Loader2, Star
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  
  // --- PRESERVED ORIGINAL VARIABLES ---
  const [listing, setListing] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null); 
  const [loading, setLoading] = useState(true);

  // --- NEW EMULATION VARIABLES ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchListingAndSeller = async () => {
      if (!id) return;
      
      try {
        const docRef = doc(db, "listings", id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const listingData = docSnap.data();
          setListing(listingData);

          if (listingData.sellerId) {
            const sellerRef = doc(db, "users", listingData.sellerId);
            const sellerSnap = await getDoc(sellerRef);
            if (sellerSnap.exists()) {
              setSeller(sellerSnap.data());
            }
          }
        } else {
          router.push('/marketplace');
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListingAndSeller();
  }, [id, router]);

  const handleBuy = async () => {
    if (!listing) return;
    
    const confirmBuy = confirm(`Do you want to reserve this ${listing.title} for ₱${listing.price}?`);
    
    if (confirmBuy) {
      setIsProcessing(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 2500));

        const docRef = doc(db, "listings", id as string);
        await updateDoc(docRef, {
          status: "SOLD",
          soldAt: serverTimestamp()
        });

        setIsProcessing(false);
        setIsSuccess(true);

        setTimeout(() => {
          router.push('/marketplace');
        }, 2000);

      } catch (error) {
        console.error("Payment error:", error);
        alert("Acquisition failed.");
        setIsProcessing(false);
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-emerald-500" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      
      {/* EMULATED PAYMENT OVERLAY */}
      {(isProcessing || isSuccess) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1e33]/90 backdrop-blur-md">
          <div className="text-center p-8 bg-white rounded-[40px] shadow-2xl max-w-sm w-full mx-4 border-4 border-emerald-400">
            {isProcessing ? (
              <>
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <Loader2 className="animate-spin text-emerald-500 w-full h-full" />
                  <Cpu className="absolute inset-0 m-auto text-slate-900" size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Encrypting...</h2>
                <p className="text-slate-500 text-sm font-bold mt-2">Processing secure acquisition.</p>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-emerald-500 w-16 h-16" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Success!</h2>
                <p className="text-slate-500 text-sm font-bold mt-2">Item reserved in your manifest.</p>
              </>
            )}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-6 lg:p-12">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-slate-500 text-sm font-bold mb-8 hover:text-emerald-600 transition group"
        >
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <section className="lg:col-span-7 space-y-6">
            <div className="rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 bg-white">
              <img 
                src={listing.imageUrl || "https://placehold.co/600x400?text=No+Image"} 
                alt={listing.title} 
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            <div className="bg-white p-8 rounded-[24px] border border-slate-100 text-slate-600 leading-relaxed shadow-sm text-sm italic">
              "{listing.description || "No description provided."}"
            </div>
          </section>

          <section className="lg:col-span-5">
            <div className="flex justify-between items-center mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                {listing.category || "General Tech"}
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                <Clock size={14} /> Active Listing
              </span>
            </div>
            
            <h1 className="text-4xl font-black text-slate-900 mb-6 leading-tight">{listing.title}</h1>
            
            <div className="flex gap-4 text-[10px] text-slate-500 mb-8 font-black uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-500" /> {listing.location}</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500" /> Verified Tech</span>
            </div>

            <div className="bg-[#0b1e33] rounded-[32px] p-8 text-white flex justify-between items-center mb-10 shadow-2xl">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black mb-1 opacity-70">Total Valuation</p>
                    <p className="text-4xl font-black italic text-emerald-50">₱{listing.price?.toLocaleString()}</p>
                </div>
                <button 
                  onClick={handleBuy}
                  disabled={isProcessing || isSuccess || listing.status === "SOLD"}
                  className="bg-emerald-400 hover:bg-emerald-500 text-slate-900 px-6 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg disabled:bg-slate-600 disabled:text-slate-300"
                >
                    {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <><ShoppingBag size={20} /> Reserve</>}
                </button>
            </div>

            <h3 className="font-black text-slate-900 uppercase tracking-[0.15em] text-[11px] mb-4 ml-1">
              Component Breakdown ({listing.components?.length || 0})
            </h3>
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {listing.components?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[20px] hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-50 rounded-xl text-emerald-500"><Cpu size={20} /></div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{item.condition} • {item.health}</p>
                    </div>
                  </div>
                  <span className="font-black text-slate-900 text-sm">₱{item.price?.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            <img src={seller?.photoURL || `https://ui-avatars.com/api/?name=${seller?.displayName || 'Seller'}`} alt="Seller" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">{seller?.displayName || "Authorized Seller"}</p>
                            <p className="text-[10px] text-slate-400 font-bold">HNU Tech Community • Verified</p>
                        </div>
                    </div>
                    <div className="text-emerald-500 font-black text-xs bg-emerald-50 px-3 py-1 rounded-lg flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> 4.9
                    </div>
                </div>
                <button className="w-full border-2 border-slate-900 text-slate-900 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all">
                    <MessageSquare size={18} /> Message Seller
                </button>
            </div>
          </section>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}