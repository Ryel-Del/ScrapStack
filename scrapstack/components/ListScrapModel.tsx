'use client';
import React, { useState } from 'react';
import { X, Upload, CheckCircle2, Loader2, Camera, Trash2, MapPin, Settings } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Use the exact variable name from your .env.local
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "");

interface AIResult {
  name: string;
  health: string;
  condition: string;
  price: number;
}

export default function ListScrapModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Tagbilaran City");
  const [isLocating, setIsLocating] = useState(false);
  const [isUntestedUnit, setIsUntestedUnit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResults, setAiResults] = useState<AIResult[]>([]);

  if (!isOpen) return null;

  // Reset all states for a fresh listing
  const resetModal = () => {
    setStep(1);
    setImages([]);
    setPreviews([]);
    setDescription("");
    setAiResults([]);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles].slice(0, 3));
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews].slice(0, 3));
    }
  };

  const handleGPS = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (Detected)`);
        setIsLocating(false);
      },
      () => {
        alert("Unable to retrieve location");
        setIsLocating(false);
      }
    );
  };

  async function fileToGenerativePart(file: File) {
    const base64Promise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    const base64Data = (await base64Promise) as string;
    return {
      inlineData: { data: base64Data.split(',')[1], mimeType: file.type },
    };
  }

  const runAnalysis = async () => {
    if (images.length === 0) return;
    setStep(2);

    try {
      // Using 1.5-flash as a fallback if 2.5-flash is at high demand (503 error)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const imageParts = await Promise.all(images.map(fileToGenerativePart));

      const prompt = `
        Analyze these electronic scrap images.
        1. Identification: Identify the device and salvageable components.
        2. Pricing: Estimate value in Philippine Pesos (PHP) based on local scrap market.
           - User Context: "${description}"
           - Mode: ${isUntestedUnit ? "Selling as one whole UNTESTED unit" : "Selling for individual parts"}
        Return ONLY a JSON array of objects with keys: name, health, condition, price. No markdown.
      `;

      const result = await model.generateContent([prompt, ...imageParts]);
      const text = result.response.text();
      const cleanJson = text.replace(/```json|```/g, "");
      setAiResults(JSON.parse(cleanJson));
      setStep(3);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      alert("Analysis failed. Gemini might be busy. Please try again.");
      setStep(1);
    }
  };

  const handleConfirmListing = async () => {
    setIsSubmitting(true);
    try {
      const totalPrice = aiResults.reduce((sum, item) => sum + item.price, 0);
      await addDoc(collection(db, "listings"), {
        sellerId: auth.currentUser?.uid,
        title: isUntestedUnit ? `Untested ${description || 'Unit'}` : "Salvaged Components",
        description,
        location,
        price: totalPrice,
        isUntested: isUntestedUnit,
        components: aiResults,
        status: "ACTIVE",
        createdAt: serverTimestamp(),
      });
      setStep(4);
    } catch (error) {
      console.error("Listing failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
           <div className="flex gap-2">
             {[1,2,3,4].map(i => (
               <div key={i} className={`w-2 h-2 rounded-full ${step >= i ? 'bg-emerald-500' : 'bg-slate-200'}`} />
             ))}
           </div>
           <button onClick={handleClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        <div className="p-8 max-h-[75vh] overflow-y-auto">
          {/* STEP 1: UPLOAD & INPUT */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex gap-4 overflow-x-auto py-2">
                <label className="shrink-0 w-28 h-28 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition">
                  <Camera size={24} className="text-slate-400"/>
                  <input type="file" hidden multiple onChange={handleImageChange} accept="image/*" />
                </label>
                {previews.map((src, i) => (
                  <div key={i} className="shrink-0 w-28 h-28 rounded-2xl relative group">
                    <img src={src} className="w-full h-full object-cover rounded-2xl" />
                    <button 
                      onClick={() => {
                        setPreviews(prev => prev.filter((_, idx) => idx !== i));
                        setImages(prev => prev.filter((_, idx) => idx !== i));
                      }}
                      className="absolute -top-2 -right-2 bg-white shadow-md p-1 rounded-full text-red-500"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button onClick={() => setIsUntestedUnit(false)} className={`flex-1 py-2 rounded-lg font-bold text-[10px] transition ${!isUntestedUnit ? 'bg-white shadow-sm' : 'text-slate-400'}`}>PARTS HARVEST</button>
                <button onClick={() => setIsUntestedUnit(true)} className={`flex-1 py-2 rounded-lg font-bold text-[10px] transition ${isUntestedUnit ? 'bg-white shadow-sm' : 'text-slate-400'}`}>UNTESTED UNIT</button>
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Pickup Location (e.g. Tagbilaran City)"
                />
                <button onClick={handleGPS} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                  {isLocating ? <Loader2 size={18} className="animate-spin" /> : <Settings size={18} />}
                </button>
              </div>

              <textarea 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none h-24"
                placeholder="Additional details for the AI..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <button onClick={runAnalysis} disabled={images.length === 0} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-emerald-600 transition disabled:bg-slate-200">
                ANALYZE SCRAP
              </button>
            </div>
          )}

          {/* STEP 2: LOADING */}
          {step === 2 && (
            <div className="py-20 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
              <p className="font-bold text-slate-900 uppercase tracking-tighter">Gemini is appraising your scrap...</p>
            </div>
          )}

          {/* STEP 3: RESULTS (EDITABLE) */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black">Confirm Components</h2>
              <div className="space-y-3">
                {aiResults.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50">
                    <div className="flex-1">
                      <input 
                        className="font-bold bg-transparent outline-none w-full"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...aiResults];
                          updated[i].name = e.target.value;
                          setAiResults(updated);
                        }}
                      />
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{item.health}</p>
                    </div>
                    <div className="flex items-center bg-white px-3 py-1 rounded-lg shadow-sm">
                      <span className="text-slate-400 font-bold mr-1">₱</span>
                      <input 
                        type="number"
                        className="w-16 bg-transparent font-black text-right outline-none"
                        value={item.price}
                        onChange={(e) => {
                          const updated = [...aiResults];
                          updated[i].price = parseInt(e.target.value) || 0;
                          setAiResults(updated);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleConfirmListing} disabled={isSubmitting} className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-emerald-600 transition">
                {isSubmitting ? "POSTING..." : "CONFIRM & POST"}
              </button>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="text-center py-10 space-y-6">
              <CheckCircle2 size={64} className="text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-black">Listing Live!</h2>
              <div className="flex flex-col gap-3">
                <button onClick={resetModal} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">List Another</button>
                <button onClick={handleClose} className="w-full py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold">Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}