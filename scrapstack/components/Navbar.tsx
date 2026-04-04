'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, Plus } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function Navbar() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  
 
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleListScrapClick = () => {
    if (!user) {
      
      handleLogin(); 
    } else {
      alert("Opening the AI Listing Modal! (Placeholder for now)");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };


  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutModal(false); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <header className="w-full border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-[#10b981] rounded flex items-center justify-center text-white font-bold transition-transform group-hover:scale-110">S</div>
            <span className="text-xl font-bold tracking-tight text-slate-800">Scrap<span className="text-[#10b981]">Stack</span></span>
          </Link>
          
          <nav className="hidden md:flex space-x-10 font-medium text-slate-600 text-sm">
            <Link href="/" className="hover:text-[#10b981] transition">Home</Link>
            <Link href="/marketplace" className="hover:text-[#10b981] transition">Marketplace</Link>
            <Link href="/impact" className="hover:text-[#10b981] transition">Our Impact</Link>
          </nav>

          

          <div className="flex items-center space-x-4">
            <button 
                onClick={handleListScrapClick} 
                className="bg-[#10b981] hover:bg-[#059669] text-white px-5 py-2 rounded-full text-xs font-semibold flex items-center transition shadow-sm"
                >
                <Plus size={14} className="mr-1" /> List Scrap
            </button>

            {user ? (
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                <Link href="/profile" className="hover:opacity-80 transition">
                  <img src={user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" />
                </Link>
             
                <button 
                  onClick={() => setShowLogoutModal(true)} 
                  className="text-slate-400 hover:text-green-500 transition"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2 rounded-full text-xs font-bold flex items-center transition shadow-sm">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4 mr-2" />
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

    
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-4">
              <LogOut size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to leave?</h3>
            <p className="text-slate-500 text-sm mb-8">
              Are you sure you want to log out of your ScrapStack account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition shadow-sm"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}