'use client';
import React, { useState } from 'react';
import { 
  X, CheckCircle2, Loader2, Camera, Trash2, MapPin, 
  Settings, Layers, Cpu, CheckCircle, Wrench 
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "");

// DIY & Engineering Categories
const CATEGORIES = ["Smartphones", "Laptops", "Computers", "Gaming", "Robotics", "Components", "Tools", "Audio"];

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
  const [selectedCategory, setSelectedCategory] = useState("Components");
  
  // New Condition Modes
  const [listingMode, setListingMode] = useState('harvest'); // harvest, untested, working, repair
  
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResults, setAiResults] = useState<AIResult[]>([]);

  if (!isOpen) return null;

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.6); 
          resolve(base64);
        };
      };
    });
  };

  const resetModal = () => {
    setStep(1);
    setImages([]);
    setPreviews([]);
    setDescription("");
    setAiResults([]);
    setIsSubmitting(false);
    setListingMode('harvest');
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
      alert("Geolocation is not supported");
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
    const base64Full = await processImage(file);
    const base64Data = base64Full.split(',')[1];
    return {
      inlineData: { data: base64Data, mimeType: "image/jpeg" },
    };
  }

  const runAnalysis = async () => {
    if (images.length === 0) return;
    setStep(2);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const imageParts = await Promise.all(images.map(fileToGenerativePart));

      const prompt = `
        Analyze these electronic hardware images for a 2026 tech marketplace.
        - User Context: "${description}"
        - Condition Mode: ${listingMode}
        
        INSTRUCTIONS:
        1. If mode is 'harvest' or 'repair', identify 3-5 specific harvestable components (e.g. Motherboard, Battery, Screen).
        2. If mode is 'working' or 'untested', treat the entire unit as one primary item but still list its main internal specs if visible.
        3. Provide prices in PHP based on the Bohol/Cebu salvage market.

        Return ONLY a JSON array of objects: [{name, health, condition, price}]. No markdown.
      `;

      const result = await model.generateContent([prompt, ...imageParts]);
      const cleanJson = result.response.text().replace(/```json|```/g, "");
      setAiResults(JSON.parse(cleanJson));
      setStep(3);
    } catch (error) {
      console.error("AI Error:", error);
      alert("AI failed to scan.");
      setStep(1);
    }
  };

  const handleConfirmListing = async () => {
    setIsSubmitting(true);
    try {
      const imageStrings = await Promise.all(images.map(file => processImage(file)));
      const totalPrice = aiResults.reduce((sum, item) => sum + item.price, 0);
      const primaryItem = aiResults[0]?.name || "Electronic Unit";

      await addDoc(collection(db, "listings"), {
        sellerId: auth.currentUser?.uid,
        title: listingMode === 'working' ? primaryItem : `${listingMode.toUpperCase()}: ${primaryItem}`,
        description,
        location,
        category: selectedCategory,
        conditionMode: listingMode,
        price: totalPrice,
        components: aiResults,
        imageUrl: imageStrings[0] || "", 
        imageGallery: imageStrings,
        status: "ACTIVE",
        createdAt: serverTimestamp(),
      });

      setStep(4);
    } catch (error) {
      console.error("Save failed:", error);
      alert("Firestore Error!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl relative">
        
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
           <div className="flex gap-2">
             {[1,2,3,4].map(i => (
               <div key={i} className={`w-2 h-2 rounded-full ${step >= i ? 'bg-emerald-500' : 'bg-slate-200'}`} />
             ))}
           </div>
           <button onClick={handleClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar">
                <label className="shrink-0 w-28 h-28 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition">
                  <Camera size={24} className="text-slate-400"/>
                  <input type="file" hidden multiple onChange={handleImageChange} accept="image/*" />
                </label>
                {previews.map((src, i) => (
                  <div key={i} className="shrink-0 w-28 h-28 rounded-2xl relative group">
                    <img src={src} className="w-full h-full object-cover rounded-2xl" alt="Preview" />
                    <button onClick={() => {
                        setPreviews(prev => prev.filter((_, idx) => idx !== i));
                        setImages(prev => prev.filter((_, idx) => idx !== i));
                    }} className="absolute -top-2 -right-2 bg-white shadow-md p-1 rounded-full text-red-500"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>

              {/* 4-MODE CONDITION GRID */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'harvest', label: 'PARTS HARVEST', icon: <Cpu size={14} /> },
                  { id: 'untested', label: 'UNTESTED UNIT', icon: <Layers size={14} /> },
                  { id: 'working', label: 'TESTED / OK', icon: <CheckCircle size={14} /> },
                  { id: 'repair', label: 'FOR REPAIR', icon: <Wrench size={14} /> }
                ].map((opt) => (
                  <button 
                    key={opt.id} 
                    onClick={() => setListingMode(opt.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 font-black text-[10px] transition-all
                      ${listingMode === opt.id ? `bg-white border-slate-900 text-slate-900 shadow-md` : 'bg-slate-50 border-transparent text-slate-400'}`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location (e.g., Tagbilaran City)"
                />
                <button onClick={handleGPS} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                  {isLocating ? <Loader2 size={18} className="animate-spin" /> : <Settings size={18} />}
                </button>
              </div>

              <textarea 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none h-24"
                placeholder="Briefly describe the item (e.g. 'GPU with fan noise' or 'Switch with broken screen')..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <button onClick={runAnalysis} disabled={images.length === 0} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-emerald-600 transition disabled:bg-slate-200">
                START SCAN
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="py-20 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
              <p className="font-bold text-slate-900 uppercase tracking-tighter italic">Gemini 2.5 Harvesting Hardware Data...</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black italic">Review Manifest</h2>
              
              {/* UPDATED CATEGORY GRID */}
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-2 rounded-xl font-black text-[10px] border-2 transition-all
                      ${selectedCategory === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-transparent'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {aiResults.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50">
                    <div className="flex-1">
                      <input 
                        className="font-bold bg-transparent outline-none w-full text-slate-900"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...aiResults];
                          updated[i].name = e.target.value;
                          setAiResults(updated);
                        }}
                      />
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{item.health} • {item.condition}</p>
                    </div>
                    <div className="flex items-center bg-white px-3 py-1 rounded-lg shadow-sm border">
                      <span className="text-slate-400 font-bold mr-1">₱</span>
                      <input 
                        type="number"
                        className="w-16 bg-transparent font-black text-right outline-none text-emerald-600"
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
                {isSubmitting ? "POSTING..." : "CONFIRM LISTING"}
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-10 space-y-6">
              <CheckCircle2 size={64} className="text-emerald-500 mx-auto" strokeWidth={3} />
              <h2 className="text-2xl font-black italic">SUCCESS!</h2>
              <button onClick={handleClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold italic shadow-xl">BACK TO MARKET</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}