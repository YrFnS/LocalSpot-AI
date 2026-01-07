
import React, { useState, useRef, useCallback, useEffect } from 'react';

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
  const [hudText, setHudText] = useState<string[]>([]);

  // Simulate scrolling data stream
  useEffect(() => {
      if (preview && !isAnalyzing) {
          const codes = ["INIT_SEQ_99", "CALIBRATING_OPTICS", "LIGHT_LVL_OK", "SPECTRUM_ANALYSIS"];
          let i = 0;
          const interval = setInterval(() => {
              setHudText(prev => [codes[i % codes.length] + `... [${Math.random().toFixed(2)}]`, ...prev.slice(0, 5)]);
              i++;
          }, 200);
          return () => clearInterval(interval);
      } else if (isAnalyzing) {
          const codes = ["EXTRACTING_FEATURES", "MATCHING_PATTERNS", "QUERYING_VECTOR_DB", "SYNTHESIZING_RESULTS"];
          let i = 0;
          const interval = setInterval(() => {
              setHudText(prev => [codes[i % codes.length] + `...`, ...prev.slice(0, 5)]);
              i++;
          }, 300);
          return () => clearInterval(interval);
      }
  }, [preview, isAnalyzing]);

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
            setHudText([]);
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
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300">
       <div className="relative w-full max-w-2xl mx-4">
           
           {/* HUD Frames */}
           <div className="absolute -top-8 -left-8 w-16 h-16 border-t-2 border-l-2 border-primary/50"></div>
           <div className="absolute -top-8 -right-8 w-16 h-16 border-t-2 border-r-2 border-primary/50"></div>
           <div className="absolute -bottom-8 -left-8 w-16 h-16 border-b-2 border-l-2 border-primary/50"></div>
           <div className="absolute -bottom-8 -right-8 w-16 h-16 border-b-2 border-r-2 border-primary/50"></div>

           <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-primary font-mono text-xs tracking-[0.3em] uppercase bg-black px-4 py-1 border border-primary/30">
               OPTIC_ANALYSIS_MOD
           </div>

           {/* Close Button */}
           <button 
             onClick={onClose}
             className="absolute -top-12 -right-4 text-zinc-500 hover:text-red-500 transition-colors z-50 p-2"
           >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
           </button>

           <div className={`
              relative overflow-hidden bg-black border border-zinc-800 transition-all duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)]
              ${dragActive ? 'border-primary shadow-[0_0_30px_rgba(249,115,22,0.3)]' : ''}
              ${preview ? 'h-[500px]' : 'h-[300px]'}
           `}>
               {/* Scan Grid Overlay (Global) */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.05)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

               {/* Content */}
               {!preview ? (
                   <div 
                        className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group z-10"
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
                       
                       <div className="w-24 h-24 relative mb-6">
                           <div className="absolute inset-0 border border-zinc-700 rounded-full animate-[spin_10s_linear_infinite]"></div>
                           <div className="absolute inset-2 border border-zinc-800 rounded-full animate-[spin_5s_linear_infinite_reverse]"></div>
                           <div className="absolute inset-0 flex items-center justify-center">
                               <svg className="w-8 h-8 text-zinc-500 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                                   <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                   <circle cx="12" cy="13" r="3"></circle>
                               </svg>
                           </div>
                       </div>
                       
                       <h3 className="text-sm font-bold text-white tracking-[0.2em] mb-2 uppercase">Input Visual Data</h3>
                       <p className="text-zinc-600 text-[10px] font-mono text-center max-w-[250px] uppercase">
                           Drop file to initiate scan
                       </p>
                   </div>
               ) : (
                   <div className="absolute inset-0 flex">
                       <div className="relative flex-1 bg-black overflow-hidden">
                           <img src={preview} alt="Scan Target" className="w-full h-full object-contain opacity-80" />
                           
                           {/* Moving Laser Line */}
                           <div className="absolute left-0 right-0 h-[1px] bg-primary shadow-[0_0_20px_rgba(249,115,22,1)] animate-scan-vertical top-0"></div>
                           
                           {/* Face/Object Detection Box Simulation */}
                           <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-primary/30 animate-pulse">
                               <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-primary"></div>
                               <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-primary"></div>
                               <div className="absolute top-0 right-0 p-1 bg-primary/20 text-[8px] font-mono text-primary">TARGET_LOCK</div>
                           </div>
                       </div>

                       {/* Sidebar Data Stream */}
                       <div className="w-48 border-l border-zinc-800 bg-zinc-950 p-4 font-mono text-[9px] flex flex-col">
                           <div className="text-primary mb-4 border-b border-zinc-800 pb-2">
                               STATUS: {isAnalyzing ? <span className="animate-blink">PROCESSING</span> : 'LOCKED'}
                           </div>
                           
                           <div className="flex-1 overflow-hidden relative">
                               <div className="absolute bottom-0 left-0 right-0 space-y-1">
                                   {hudText.map((text, i) => (
                                       <div key={i} className="text-zinc-500 opacity-80">
                                           {`> ${text}`}
                                       </div>
                                   ))}
                               </div>
                           </div>

                           <div className="mt-4 pt-4 border-t border-zinc-800 text-zinc-600">
                               <div className="flex justify-between">
                                   <span>CONFIDENCE</span>
                                   <span>98.4%</span>
                               </div>
                               <div className="flex justify-between">
                                   <span>VIBE_SIG</span>
                                   <span>DETECTED</span>
                               </div>
                           </div>
                       </div>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};
