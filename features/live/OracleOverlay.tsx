
import React, { useEffect, useRef, useState } from 'react';
import { LiveTranscript } from '../../hooks/useLiveSession';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  // Animation Loop (HUD)
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // --- Background Grid (Only if not in vision mode) ---
      if (!visionMode) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.lineWidth = 1;
          const gridSize = 50;
          for(let x = 0; x < width; x+=gridSize) {
              ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
          }
          for(let y = 0; y < height; y+=gridSize) {
              ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
          }
      }

      // --- The Eye / Target Reticle ---
      // In Vision Mode, the eye becomes a target reticle
      const baseRadius = visionMode ? 100 : 80;
      const pulse = isSpeaking ? 20 * Math.sin(time * 15) : volume * 150; 
      const radius = baseRadius + (visionMode ? 0 : pulse);

      if (!visionMode) {
          // Standard "Hal 9000" Eye
          const gradient = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.5, centerX, centerY, radius * 2);
          if (isSpeaking) {
              gradient.addColorStop(0, '#f97316'); // Orange
              gradient.addColorStop(0.4, 'rgba(249, 115, 22, 0.3)');
              gradient.addColorStop(1, 'transparent');
          } else if (isConnected) {
              gradient.addColorStop(0, '#3b82f6'); // Blue
              gradient.addColorStop(0.4, 'rgba(59, 130, 246, 0.3)');
              gradient.addColorStop(1, 'transparent');
          } else {
              gradient.addColorStop(0, '#52525b'); // Zinc
              gradient.addColorStop(1, 'transparent');
          }

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius * 2, 0, Math.PI * 2);
          ctx.fill();
      } else {
          // AR Targeting Reticle
          ctx.strokeStyle = isSpeaking ? 'rgba(249, 115, 22, 0.8)' : 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 2;
          
          // Center Cross
          ctx.beginPath();
          ctx.moveTo(centerX - 10, centerY); ctx.lineTo(centerX + 10, centerY);
          ctx.moveTo(centerX, centerY - 10); ctx.lineTo(centerX, centerY + 10);
          ctx.stroke();

          // Bracket Corners
          const bracketSize = 100 + pulse * 0.2;
          ctx.beginPath();
          // TL
          ctx.moveTo(centerX - bracketSize, centerY - bracketSize + 20);
          ctx.lineTo(centerX - bracketSize, centerY - bracketSize);
          ctx.lineTo(centerX - bracketSize + 20, centerY - bracketSize);
          // TR
          ctx.moveTo(centerX + bracketSize - 20, centerY - bracketSize);
          ctx.lineTo(centerX + bracketSize, centerY - bracketSize);
          ctx.lineTo(centerX + bracketSize, centerY - bracketSize + 20);
          // BL
          ctx.moveTo(centerX - bracketSize, centerY + bracketSize - 20);
          ctx.lineTo(centerX - bracketSize, centerY + bracketSize);
          ctx.lineTo(centerX - bracketSize + 20, centerY + bracketSize);
          // BR
          ctx.moveTo(centerX + bracketSize - 20, centerY + bracketSize);
          ctx.lineTo(centerX + bracketSize, centerY + bracketSize);
          ctx.lineTo(centerX + bracketSize, centerY + bracketSize - 20);
          ctx.stroke();
      }

      // --- Waveform Visualization ---
      // Move to bottom in Vision Mode
      if (isConnected) {
          const waveY = visionMode ? height - 100 : centerY;
          const waveCount = 4;
          for(let j=0; j<waveCount; j++) {
             ctx.beginPath();
             const waveColor = isSpeaking ? `rgba(255, 150, 50, ${0.5 - j*0.1})` : `rgba(100, 150, 255, ${0.5 - j*0.1})`;
             ctx.strokeStyle = waveColor;
             ctx.lineWidth = 2;
             
             for (let i = 0; i < width; i+=5) {
                  const distFromCenter = Math.abs(i - centerX);
                  const envelope = Math.max(0, 1 - distFromCenter / (width/2));
                  const waveHeight = (volume * 100 + 10) * envelope;
                  
                  const y = waveY + Math.sin(i * 0.02 + time * (2 + j) + j) * waveHeight;
                  if (i===0) ctx.moveTo(i, y);
                  else ctx.lineTo(i, y);
             }
             ctx.stroke();
          }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    let animationFrameRef = { current: 0 };
    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    render();

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isOpen, isConnected, isSpeaking, volume, visionMode]);

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
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
        
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
