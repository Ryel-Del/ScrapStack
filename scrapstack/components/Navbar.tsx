'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, Plus, Menu, X } from 'lucide-react'; // Added Menu and X
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

import ListScrapModal from './ListScrapModel'; 

export default function Navbar() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isScrapModalOpen, setIsScrapModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state for mobile toggle

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
      setIsMobileMenuOpen(false); // Close menu on logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleListScrapClick = () => {
    setIsMobileMenuOpen(false); // Close mobile menu when opening modal
    if (!user) {
      handleLogin(); 
    } else {
      setIsScrapModalOpen(true);
    }
  };

  return (
    <>
      <header className="w-full border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-[#10b981] rounded flex items-center justify-center text-white font-bold transition-transform group-hover:scale-110">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              Scrap<span className="text-[#10b981]">Stack</span>
            </span>
          </Link>
          
          {/* DESKTOP NAV */}
          <nav className="hidden md:flex space-x-10 font-medium text-slate-600 text-sm">
            <Link href="/" className="hover:text-[#10b981] transition">Home</Link>
            <Link href="/marketplace" className="hover:text-[#10b981] transition">Marketplace</Link>
            <Link href="/impact" className="hover:text-[#10b981] transition">Our Impact</Link>
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={handleListScrapClick} 
              className="bg-[#10b981] hover:bg-[#059669] text-white px-5 py-2 rounded-full text-xs font-semibold flex items-center transition shadow-sm"
            >
              <Plus size={14} className="mr-1" /> List Scrap
            </button>

            {user ? (
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                <Link href="/profile" className="hover:opacity-80 transition">
                  <img 
                    src={user.photoURL || 'https://www.gravatar.com/avatar/?d=mp'} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" 
                  />
                </Link>
                <button onClick={() => setShowLogoutModal(true)} className="text-slate-400 hover:text-red-500 transition">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2 rounded-full text-xs font-bold flex items-center transition shadow-sm">
                Sign in
              </button>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-6 space-y-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-4 font-bold text-slate-800 text-lg">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link href="/marketplace" onClick={() => setIsMobileMenuOpen(false)}>Marketplace</Link>
              <Link href="/impact" onClick={() => setIsMobileMenuOpen(false)}>Our Impact</Link>
              {user && <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>}
            </nav>
            
            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-4">
              <button 
                onClick={handleListScrapClick} 
                className="w-full bg-[#10b981] text-white py-4 rounded-2xl font-black text-center shadow-lg"
              >
                + LIST NEW SCRAP
              </button>
              
              {!user ? (
                <button onClick={handleLogin} className="w-full py-4 border border-slate-200 rounded-2xl font-bold">
                  Sign In with Google
                </button>
              ) : (
                <button onClick={() => setShowLogoutModal(true)} className="w-full py-4 text-red-500 font-bold bg-red-50 rounded-2xl">
                  Log Out
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* MODALS */}
      <ListScrapModal 
        isOpen={isScrapModalOpen} 
        onClose={() => setIsScrapModalOpen(false)} 
      />

      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <LogOut size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to leave?</h3>
            <p className="text-slate-500 text-sm mb-8">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-3 bg-[#10b981] text-white font-bold rounded-xl">Log Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}