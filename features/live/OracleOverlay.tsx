
import React, { useEffect, useRef, useState } from 'react';
import { LiveTranscript } from './useLiveSession';
import { OracleHUD } from './OracleHUD';

interface OracleOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  isSpeaking: boolean;
  volume: number;
  transcripts: LiveTranscript[];
  realtimeText: { role: 'user' | 'model', text: string } | null;
  onSendFrame?: (base64: string) => void;
}

export const OracleOverlay: React.FC<OracleOverlayProps> = ({ 
    isOpen, 
    onClose, 
    isConnected, 
    isSpeaking, 
    volume,
    transcripts,
    realtimeText,
    onSendFrame
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [visionMode, setVisionMode] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  // Auto-scroll transcript
  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [transcripts, realtimeText]);

  // Video Stream Handling
  useEffect(() => {
      if (visionMode && isOpen && isConnected) {
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 1280, height: 720 } })
            .then(stream => {
                setVideoStream(stream);
                if (videoRef.current) videoRef.current.srcObject = stream;
            })
            .catch(err => {
                console.error("Camera access failed", err);
                setVisionMode(false);
            });
      } else {
          if (videoStream) {
              videoStream.getTracks().forEach(t => t.stop());
              setVideoStream(null);
          }
      }
      return () => {
          if (videoStream) videoStream.getTracks().forEach(t => t.stop());
      };
  }, [visionMode, isOpen, isConnected]);

  // Frame Capture Loop
  useEffect(() => {
      if (!visionMode || !isConnected || !onSendFrame || !videoRef.current) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const interval = setInterval(() => {
          if (videoRef.current && videoRef.current.readyState === 4) {
              canvas.width = videoRef.current.videoWidth * 0.5; // Scale down for bandwidth
              canvas.height = videoRef.current.videoHeight * 0.5;
              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              
              const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
              const base64 = dataUrl.split(',')[1];
              onSendFrame(base64);
          }
      }, 1000); // 1 FPS is sufficient for context

      return () => clearInterval(interval);
  }, [visionMode, isConnected, onSendFrame]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] animate-in fade-in duration-500 flex flex-col items-center justify-center overflow-hidden font-sans ${visionMode ? 'bg-black' : 'bg-black/95 backdrop-blur-xl'}`}>
        
        {/* Video Feed Layer */}
        {visionMode && (
            <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
        )}

        {/* HUD Canvas Layer */}
        <OracleHUD 
            isConnected={isConnected} 
            isSpeaking={isSpeaking} 
            volume={volume} 
            visionMode={visionMode} 
        />
        
        {/* AR Overlay UI */}
        <div className="absolute inset-0 pointer-events-none p-6 md:p-12 flex flex-col justify-between">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
                 <div className="flex flex-col gap-1">
                     <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-yellow-500 animate-pulse'}`}></div>
                         <span className="font-mono text-xs text-zinc-400 tracking-widest">
                             {visionMode ? 'OPTICAL_SENSORS_ACTIVE' : 'NEURAL_UPLINK_ESTABLISHED'}
                         </span>
                     </div>
                     <span className="font-mono text-[9px] text-zinc-600">LATENCY: 12ms // PACKET_LOSS: 0%</span>
                 </div>
                 <div className="text-right flex flex-col items-end">
                     <span className="font-mono text-xs text-primary tracking-[0.2em] font-bold">GEMINI_LIVE_V2</span>
                     <div className="flex justify-end mt-1 gap-1">
                         {[1,2,3,4].map(i => <div key={i} className={`w-1 h-3 bg-primary/50 ${i <= volume * 10 ? 'opacity-100' : 'opacity-20'}`}></div>)}
                     </div>
                     
                     {/* Vision Toggle */}
                     <button 
                        onClick={() => setVisionMode(!visionMode)}
                        className={`pointer-events-auto mt-4 flex items-center gap-2 px-3 py-1.5 border rounded-sm transition-all uppercase text-[9px] font-mono font-bold tracking-wider ${visionMode ? 'bg-primary text-black border-primary' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'}`}
                     >
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                         {visionMode ? 'VISION ON' : 'ENABLE VISION'}
                     </button>
                 </div>
            </div>

            {/* Transcript Log */}
            <div className="absolute bottom-32 left-0 right-0 max-w-2xl mx-auto px-4 pointer-events-auto">
                <div 
                    ref={scrollRef}
                    className="h-48 overflow-y-auto custom-scrollbar flex flex-col gap-2 mask-linear-fade"
                    style={{ maskImage: 'linear-gradient(to bottom, transparent, black 20%)' }}
                >
                    {transcripts.map((t) => (
                        <div key={t.id} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                            <div className={`
                                max-w-[80%] px-3 py-2 rounded-sm border text-xs font-mono leading-relaxed backdrop-blur-sm
                                ${t.role === 'user' 
                                    ? 'bg-zinc-900/80 border-zinc-700 text-zinc-300' 
                                    : 'bg-primary/10 border-primary/30 text-primary-100'}
                            `}>
                                <span className="opacity-50 text-[9px] block mb-0.5 uppercase tracking-wider">
                                    {t.role === 'user' ? 'USER_INPUT' : 'ORACLE_RESP'}
                                </span>
                                {t.text}
                            </div>
                        </div>
                    ))}
                    
                    {realtimeText && (
                        <div className={`flex ${realtimeText.role === 'user' ? 'justify-end' : 'justify-start'} animate-pulse`}>
                            <div className={`
                                max-w-[80%] px-3 py-2 rounded-sm border text-xs font-mono leading-relaxed border-dashed backdrop-blur-sm
                                ${realtimeText.role === 'user' 
                                    ? 'border-zinc-500 text-zinc-400 bg-black/50' 
                                    : 'border-primary/50 text-primary bg-primary/5'}
                            `}>
                                {realtimeText.text}<span className="inline-block w-2 h-4 align-middle bg-current ml-1 animate-[blink_1s_infinite]"></span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-center items-end relative pointer-events-auto">
                 <button 
                    onClick={onClose}
                    className="group relative px-8 py-3 bg-red-950/20 border border-red-900/50 hover:bg-red-900/40 hover:border-red-500 transition-all rounded-sm overflow-hidden backdrop-blur-md"
                 >
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                     <span className="relative z-10 font-mono text-xs font-bold text-red-500 group-hover:text-red-300 tracking-[0.2em]">TERMINATE UPLINK</span>
                     
                     <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500/50"></div>
                     <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500/50"></div>
                 </button>
            </div>
        </div>
        
        {/* Floating Code Snippets (Decor) */}
        {!visionMode && (
            <>
                <div className="absolute left-10 top-1/2 -translate-y-1/2 font-mono text-[9px] text-green-500/20 hidden md:block select-none leading-tight">
                    {Array.from({length: 10}).map((_, i) => (
                        <div key={i}>{`0x${Math.floor(Math.random()*16777215).toString(16).toUpperCase()} :: SYNC_OK`}</div>
                    ))}
                </div>
                <div className="absolute right-10 top-1/2 -translate-y-1/2 font-mono text-[9px] text-primary/20 hidden md:block select-none leading-tight text-right">
                    {Array.from({length: 10}).map((_, i) => (
                        <div key={i}>{`BUFFER_SIZE :: ${Math.floor(Math.random()*4096)}`}</div>
                    ))}
                </div>
            </>
        )}
    </div>
  );
};
