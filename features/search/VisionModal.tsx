
import React, { useState, useRef, useCallback } from 'react';

interface VisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (base64: string) => void;
  isAnalyzing: boolean;
}

export const VisionModal: React.FC<VisionModalProps> = ({ isOpen, onClose, onAnalyze, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setPreview(result);
            // Convert to base64 pure string (remove header)
            const base64 = result.split(',')[1];
            onAnalyze(base64);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
    }
  }, [onAnalyze]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
       <div className="relative w-full max-w-lg mx-4">
           {/* Close Button */}
           <button 
             onClick={onClose}
             className="absolute -top-12 right-0 text-zinc-500 hover:text-white transition-colors"
           >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
           </button>

           <div className={`
              relative overflow-hidden rounded-lg bg-zinc-950 border-2 transition-all duration-300
              ${dragActive ? 'border-primary scale-105' : 'border-zinc-800'}
              ${preview ? 'h-[400px]' : 'h-[300px]'}
           `}>
               
               {/* Content */}
               {!preview ? (
                   <div 
                        className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                   >
                       <input 
                         ref={inputRef} 
                         type="file" 
                         className="hidden" 
                         accept="image/*" 
                         onChange={handleChange} 
                        />
                       
                       <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-6 group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all">
                           <svg className="w-8 h-8 text-zinc-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                               <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                           </svg>
                       </div>
                       
                       <h3 className="text-lg font-bold text-white tracking-tight mb-2">GEMINI LENS</h3>
                       <p className="text-zinc-500 text-xs font-mono text-center max-w-[250px]">
                           DRAG IMAGE OR CLICK TO SCAN<br/>
                           <span className="opacity-50">ANALYZING AESTHETICS & CONTEXT</span>
                       </p>
                       
                       {/* Decoration Lines */}
                       <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-zinc-700"></div>
                       <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-zinc-700"></div>
                       <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-zinc-700"></div>
                       <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-zinc-700"></div>
                   </div>
               ) : (
                   <div className="absolute inset-0">
                       <img src={preview} alt="Scan Target" className="w-full h-full object-cover opacity-60" />
                       
                       {/* Scanner Overlay */}
                       <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary/20 animate-pulse"></div>
                       
                       {/* Laser Scan Line */}
                       <div className="absolute left-0 right-0 h-[2px] bg-primary shadow-[0_0_20px_rgba(249,115,22,1)] animate-scan-vertical"></div>
                       
                       {/* HUD Text */}
                       <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                           <div className="flex items-center gap-3 mb-2">
                               <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                               <span className="text-primary font-mono text-xs tracking-[0.2em] font-bold">
                                   {isAnalyzing ? 'ANALYZING VISUAL DATA...' : 'SCAN COMPLETE'}
                               </span>
                           </div>
                           <div className="font-mono text-[10px] text-zinc-400 space-y-1">
                               <p>{`> EXTRACTING VIBE SIGNATURE`}</p>
                               <p className="opacity-70">{`> MATCHING LOCAL ENTITIES`}</p>
                           </div>
                       </div>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};
