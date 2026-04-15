'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, auth } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { 
  ArrowLeft, Cpu, MapPin, CheckCircle, 
  Clock, ShoppingBag, MessageSquare, Loader2, Star, UserCheck, X
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null); 
  const [loading, setLoading] = useState(true);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);


  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);


  useEffect(() => {
    const fetchListingAndSeller = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "listings", id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const listingData = docSnap.data();
          setListing(listingData);
          
          
          if (currentUser && listingData.sellerId === currentUser.uid) {
            setSeller({
              displayName: currentUser.displayName || "My Profile",
            });
          } 
         
          else if (listingData.sellerId) {
            const userSnap = await getDoc(doc(db, "users", listingData.sellerId));
            if (userSnap.exists()) {
              setSeller(userSnap.data());
            } else {
            
              setSeller({
                displayName: listingData.sellerName || "Authorized Seller",
              });
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
  }, [id, currentUser, router]); 

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setShowAuthModal(false);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleBuyTrigger = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (currentUser.uid === listing.sellerId) return; 
    setShowConfirmModal(true);
  };

  const executePurchase = async () => {
    setIsProcessing(true);
    try {
      const docRef = doc(db, "listings", id as string);
      await updateDoc(docRef, {
        status: "SOLD",
        purchasedBy: currentUser?.uid,
        soldAt: serverTimestamp()
      });
      router.push('/profile');
    } catch (e) {
      alert("Transaction failed.");
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-emerald-500" size={48} />
    </div>
  );

  const isOwner = currentUser?.uid === listing?.sellerId;

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      <main className="max-w-6xl mx-auto p-6 lg:p-12">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 hover:text-emerald-600 transition group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* IMAGE & DESC */}
          <section className="lg:col-span-7 space-y-6">
            <div className="rounded-[40px] overflow-hidden shadow-2xl border border-slate-200 bg-white">
              <img src={listing.imageUrl || "https://placehold.co/600x400?text=No+Image"} className="w-full aspect-[4/3] object-cover" alt="p" />
            </div>
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 text-slate-500 italic font-medium text-sm leading-relaxed shadow-sm">
              "{listing.description}"
            </div>
          </section>

          {/* ACTIONS & INFO */}
          <section className="lg:col-span-5">
            <div className="flex justify-between items-center mb-4">
              <span className="px-4 py-1.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 uppercase tracking-widest">{listing.category}</span>
              <span className="text-slate-400 text-[9px] flex items-center gap-1 font-black uppercase tracking-widest"><Clock size={14} /> {listing.status === 'SOLD' ? 'Closed' : 'Active'}</span>
            </div>
            
            <h1 className="text-4xl font-black text-slate-900 mb-6 italic tracking-tighter">{listing.title}</h1>

            <div className={`rounded-[32px] p-8 text-white flex justify-between items-center mb-10 shadow-2xl transition-all ${isOwner ? 'bg-slate-800' : 'bg-[#0b1e33]'}`}>
                <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black mb-1 opacity-70 italic">Valuation</p>
                    <p className="text-4xl font-black italic text-emerald-50 tracking-tighter">₱{listing.price?.toLocaleString()}</p>
                </div>
                
                <button 
                  onClick={handleBuyTrigger}
                  disabled={listing.status === 'SOLD' || isOwner}
                  className={`px-6 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg text-xs ${isOwner || listing.status === 'SOLD' ? 'bg-slate-700 text-slate-500 cursor-not-allowed border border-white/10' : 'bg-emerald-400 hover:bg-emerald-500 text-slate-900 active:scale-95'}`}
                >
                  {isOwner ? <UserCheck size={18}/> : <ShoppingBag size={18} />} 
                  {isOwner ? "YOUR ITEM" : listing.status === 'SOLD' ? "SOLD" : "RESERVE"}
                </button>
            </div>

            {/* COMPONENTS */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {listing.components?.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[24px] shadow-sm hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-xl text-emerald-500"><Cpu size={18} /></div>
                    <div>
                      <h4 className="font-black text-slate-900 text-[10px] uppercase">{item.name}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{item.health}</p>
                    </div>
                  </div>
                  <span className="font-black text-slate-900 text-sm">₱{item.price}</span>
                </div>
              ))}
            </div>

            {/* SELLER SECTION */}
            <div className="mt-12 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-emerald-500 flex items-center justify-center">
                            <img 
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(seller?.displayName || 'U')}&background=10b981&color=fff&bold=true`} 
                              className="w-full h-full" 
                              alt="s"
                            />
                        </div>
                        <div>
                            
                            <p className="font-black text-slate-900 text-[10px] uppercase tracking-tight">
                              {seller?.displayName || "Authorized Seller"}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Verified Innovator</p>
                        </div>
                    </div>
                    <div className="text-emerald-500 font-black text-[10px] bg-emerald-50 px-3 py-1 rounded-lg uppercase flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> 4.9
                    </div>
                </div>
                <button className="w-full border-2 border-slate-900 text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all">
                    Contact Seller
                </button>
            </div>
          </section>
        </div>
      </main>

      
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 mb-6 mx-auto"><ShoppingBag size={28} /></div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 italic">Join ScrapStack.</h3>
            <p className="text-slate-500 text-[11px] font-medium mb-8">Sign in to reserve this technical manifest.</p>
            <div className="space-y-3">
              <button onClick={handleLogin} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl">Login with Google</button>
              <button onClick={() => setShowAuthModal(false)} className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase">Maybe Later</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl text-center">
            <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-6 mx-auto"><CheckCircle size={28} /></div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 italic">Confirm Reserve?</h3>
            <p className="text-slate-500 text-[11px] font-medium mb-8">Secure this ₱{listing?.price?.toLocaleString()} manifest.</p>
            <div className="space-y-3">
              <button onClick={executePurchase} disabled={isProcessing} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl flex items-center justify-center">
                {isProcessing ? <Loader2 className="animate-spin" size={16}/> : "CONFIRM PURCHASE"}
              </button>
              <button onClick={() => setShowConfirmModal(false)} className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase">Go Back</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}