
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSoundFX } from '../../hooks/useSoundFX';

interface VisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (base64: string) => void;
  isAnalyzing: boolean;
}

export const VisionModal: React.FC<VisionModalProps> = ({ isOpen, onClose, onAnalyze, isAnalyzing }) => {
  const [mode, setMode] = useState<'CAMERA' | 'UPLOAD' | 'PREVIEW'>('CAMERA');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hudText, setHudText] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { playShutter, playScan, playClick, playError } = useSoundFX();

  // Initialize Camera on Open
  useEffect(() => {
    if (isOpen && mode === 'CAMERA') {
        startCamera();
    }
    return () => stopCamera();
  }, [isOpen, mode]);

  // HUD Animation Loop
  useEffect(() => {
      if (isOpen) {
          const sysLogs = [
              "OPTICAL_SENSORS_ACTIVE", "CALIBRATING_ISO", "VIBE_DETECTION_ON", 
              "SEARCHING_PATTERNS", "LUMINANCE_CHECK", "VECTOR_ALIGNMENT",
              "NEURAL_LINK_STABLE", "GRID_LOCKED"
          ];
          let i = 0;
          const interval = setInterval(() => {
              const log = sysLogs[Math.floor(Math.random() * sysLogs.length)];
              const val = Math.random().toFixed(4);
              setHudText(prev => [`${log} // ${val}`, ...prev.slice(0, 6)]);
          }, 150);
          return () => clearInterval(interval);
      }
  }, [isOpen]);

  const startCamera = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
          });
          setCameraStream(stream);
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
          setCameraError(null);
      } catch (e) {
          console.error("Camera failed", e);
          setCameraError("CAMERA_OFFLINE_OR_DENIED");
          setMode('UPLOAD');
          playError();
      }
  };

  const stopCamera = () => {
      if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
      }
  };

  const captureImage = () => {
      if (!videoRef.current) return;
      playShutter();
      
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setPreviewImage(dataUrl);
          setMode('PREVIEW');
          stopCamera();
          
          // Trigger Analysis
          const base64 = dataUrl.split(',')[1];
          onAnalyze(base64);
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          playScan();
          const reader = new FileReader();
          reader.onload = (ev) => {
              const result = ev.target?.result as string;
              setPreviewImage(result);
              setMode('PREVIEW');
              const base64 = result.split(',')[1];
              onAnalyze(base64);
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
        
        {/* Main Viewfinder Area */}
        <div className="relative w-full h-full flex flex-col overflow-hidden">
            
            {/* Background Feed */}
            <div className="absolute inset-0 bg-[#050505]">
                {mode === 'CAMERA' && (
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover opacity-80"
                    />
                )}
                {(mode === 'PREVIEW' && previewImage) && (
                    <img 
                        src={previewImage} 
                        className="w-full h-full object-cover opacity-60 filter grayscale-[0.3]" 
                        alt="Captured"
                    />
                )}
                
                {/* Scanlines & Grain */}
                <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]"></div>
            </div>

            {/* Tactical HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none p-4 md:p-8 flex flex-col justify-between">
                
                {/* HUD Header */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 bg-primary rounded-sm animate-pulse shadow-[0_0_10px_#f97316]"></div>
                             <span className="font-mono text-xs text-white font-bold tracking-[0.2em]">VISION_LENS_V2</span>
                        </div>
                        <div className="text-[9px] font-mono text-zinc-400">
                            {mode === 'CAMERA' ? 'LIVE_FEED :: 1080p' : (mode === 'PREVIEW' ? 'STATIC_ANALYSIS' : 'MANUAL_OVERRIDE')}
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => { stopCamera(); onClose(); }} 
                        className="pointer-events-auto p-2 hover:bg-red-950/50 hover:text-red-500 text-zinc-500 transition-colors border border-transparent hover:border-red-900"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Central Focus Brackets */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-64 border border-white/20">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                    
                    {/* Center Point */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white/80"></div>
                    
                    {/* Scanning Laser */}
                    {isAnalyzing && (
                        <div className="absolute left-0 right-0 h-[2px] bg-primary shadow-[0_0_15px_#f97316] animate-scan-vertical top-0"></div>
                    )}

                    {/* Analysis Text */}
                    {isAnalyzing && (
                        <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 text-[9px] font-mono text-primary animate-pulse">
                            ANALYZING_VISUAL_DATA...
                        </div>
                    )}
                </div>

                {/* HUD Footer & Controls */}
                <div className="flex justify-between items-end">
                    {/* System Logs */}
                    <div className="hidden md:flex flex-col gap-0.5 text-[9px] font-mono text-green-500/80 w-64">
                        {hudText.map((log, i) => (
                            <div key={i} style={{ opacity: 1 - i * 0.15 }}>{`> ${log}`}</div>
                        ))}
                    </div>

                    {/* Shutter Button */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-4">
                        {mode === 'CAMERA' && (
                            <button 
                                onClick={captureImage}
                                className="w-16 h-16 rounded-full border-2 border-white/80 flex items-center justify-center hover:bg-white/10 transition-colors group"
                            >
                                <div className="w-12 h-12 bg-white rounded-full group-active:scale-90 transition-transform duration-100"></div>
                            </button>
                        )}
                        {mode === 'UPLOAD' && (
                            <div 
                                onClick={() => inputRef.current?.click()}
                                className="px-6 py-3 bg-zinc-900 border border-zinc-700 hover:border-primary text-zinc-300 hover:text-white cursor-pointer font-mono text-xs uppercase tracking-widest transition-all"
                            >
                                SELECT_SOURCE_FILE
                            </div>
                        )}
                        {mode === 'PREVIEW' && !isAnalyzing && (
                            <button 
                                onClick={() => { setMode('CAMERA'); setPreviewImage(null); startCamera(); }}
                                className="px-6 py-2 bg-zinc-900/80 text-zinc-400 hover:text-white font-mono text-[10px] uppercase border border-zinc-800"
                            >
                                RESET_SENSOR
                            </button>
                        )}
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex flex-col items-end gap-2 pointer-events-auto">
                        <button 
                            onClick={() => { 
                                if (mode === 'CAMERA') { stopCamera(); setMode('UPLOAD'); } 
                                else { setMode('CAMERA'); startCamera(); }
                            }}
                            className="text-[9px] font-mono text-zinc-400 hover:text-white uppercase border-b border-transparent hover:border-zinc-500"
                        >
                            {mode === 'CAMERA' ? 'SWITCH_TO_UPLOAD' : 'SWITCH_TO_CAMERA'}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Hidden Input for Upload */}
            <input 
                ref={inputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload} 
            />
        </div>
    </div>
  );
};
