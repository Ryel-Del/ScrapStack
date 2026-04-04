import React from 'react';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Progress Steps */}
      <div className="max-w-xl mx-auto pt-12 flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
        {[
          { step: 1, label: 'Upload', active: true },
          { step: 2, label: 'Scan', active: false },
          { step: 3, label: 'Results', active: false },
          { step: 4, label: 'Post', active: false },
        ].map((item) => (
          <div key={item.step} className="flex flex-col items-center bg-slate-50 px-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${item.active ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
              {item.step}
            </div>
            <span className="text-xs font-semibold text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Main Upload Card */}
      <div className="max-w-2xl mx-auto mt-12 bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </div>
        
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Snap Your Scrap</h2>
        <p className="text-slate-500 text-sm mb-8">Upload a photo of your broken device. Our AI will<br/>analyze which components are likely salvageable.</p>

        {/* Dropzone */}
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-16 mb-6 hover:border-emerald-400 transition-colors cursor-pointer group">
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 text-slate-300 group-hover:text-emerald-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>
            <p className="text-lg font-bold text-slate-700">Click to upload or drag and drop</p>
            <p className="text-xs text-slate-400 mt-1 uppercase">PNG, JPG up to 10MB</p>
          </div>
        </div>

        <textarea 
          placeholder="Describe item for more accurate assessment..." 
          className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none h-24 mb-6"
        ></textarea>

        <button className="w-full bg-[#4a4a4a] hover:bg-black text-white font-bold py-4 rounded-xl text-lg tracking-widest transition shadow-lg">
          ANALYZE
        </button>

        <div className="flex justify-center space-x-8 mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
          <span className="flex items-center"><span className="text-emerald-500 mr-1">✔</span> Auto-detection</span>
          <span className="flex items-center"><span className="text-emerald-500 mr-1">✔</span> Market Pricing</span>
          <span className="flex items-center"><span className="text-emerald-500 mr-1">✔</span> Instant Listing</span>
        </div>
      </div>
    </div>
  );
}