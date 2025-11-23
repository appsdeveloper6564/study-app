import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Ghost } from 'lucide-react';

const CustomNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after a small delay to mimic a real ad/notification
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] animate-fade-in-left max-w-sm w-full md:w-[350px]">
      <div className="relative bg-[#0f172a] text-white rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
        
        {/* Notification Badge */}
        <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg z-20 border-2 border-[#0f172a]">
          1
        </div>

        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-1 right-1 text-slate-400 hover:text-white transition-colors z-10 p-1"
        >
          <X size={14} />
        </button>

        <div className="flex items-stretch">
          {/* Left Image Section (Monster) */}
          <div className="w-24 bg-[#16a34a] flex items-center justify-center p-2 shrink-0 relative overflow-hidden">
             {/* Monster-like visual using Ghost icon + effects */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
             <Ghost size={40} className="text-white drop-shadow-lg relative z-10" strokeWidth={2.5} />
             <div className="absolute bottom-0 w-full text-center text-[9px] font-black text-green-900 uppercase tracking-tighter bg-white/20 py-0.5">
               ADZILLA
             </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-3 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-orange-500 text-[9px] font-bold px-1.5 py-0.5 rounded text-white uppercase">
                ADS
              </div>
              <span className="text-[10px] text-slate-400">Sponsored</span>
            </div>

            <h3 className="font-black text-sm leading-tight mb-1 text-white">
              Huge memecoin monster is here!
            </h3>
            <p className="text-xs text-slate-300 mb-2 leading-snug">
              AdZilla Alert! Buy Now!
            </p>

            <div className="flex gap-2 mt-auto">
              <a 
                href="https://youtube.com/@mafiatechpro?si=CtHV8-5g16ZJWYj_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-white text-slate-900 text-xs font-bold py-1.5 px-3 rounded hover:bg-slate-100 transition-colors text-center flex items-center justify-center gap-1"
              >
                Click Here <ExternalLink size={10} />
              </a>
              <button 
                onClick={() => setIsVisible(false)}
                className="px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-white transition-colors"
              >
                Hide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomNotification;