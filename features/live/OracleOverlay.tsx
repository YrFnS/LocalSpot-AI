
import React, { useEffect, useRef } from 'react';

interface OracleOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  isSpeaking: boolean;
  volume: number; // 0 to ~1
}

export const OracleOverlay: React.FC<OracleOverlayProps> = ({ isOpen, onClose, isConnected, isSpeaking, volume }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation Loop
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

      // --- Background Grid ---
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      // Perspective grid logic simplified for 2D canvas
      for(let x = 0; x < width; x+=gridSize) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for(let y = 0; y < height; y+=gridSize) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // --- The Eye Core ---
      const baseRadius = 80;
      const pulse = isSpeaking ? 20 * Math.sin(time * 15) : volume * 150; 
      const radius = baseRadius + pulse;

      // Outer Aura
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

      // Mechanical Rings
      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Ring 1 (Slow Rotate)
      ctx.rotate(time * 0.1);
      ctx.strokeStyle = isSpeaking ? 'rgba(249, 115, 22, 0.6)' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 1.4, 0, Math.PI * 1.5);
      ctx.stroke();
      
      // Ring 2 (Fast Rotate Counter)
      ctx.rotate(-time * 0.3);
      ctx.strokeStyle = isSpeaking ? 'rgba(249, 115, 22, 0.4)' : 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 20]);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 1.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Ring 3 (Static Bracket)
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 2.2, -0.5, 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 2.2, Math.PI - 0.5, Math.PI + 0.5);
      ctx.stroke();

      // --- Waveform Visualization (Audio Reactive) ---
      if (isConnected) {
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
                  
                  const y = centerY + Math.sin(i * 0.02 + time * (2 + j) + j) * waveHeight;
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
  }, [isOpen, isConnected, isSpeaking, volume]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl animate-in fade-in duration-500 flex flex-col items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
        
        {/* AR Overlay UI */}
        <div className="absolute inset-0 pointer-events-none p-6 md:p-12 flex flex-col justify-between">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
                 <div className="flex flex-col gap-1">
                     <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-yellow-500 animate-pulse'}`}></div>
                         <span className="font-mono text-xs text-zinc-400 tracking-widest">NEURAL_UPLINK_ESTABLISHED</span>
                     </div>
                     <span className="font-mono text-[9px] text-zinc-600">LATENCY: 12ms // PACKET_LOSS: 0%</span>
                 </div>
                 <div className="text-right">
                     <span className="font-mono text-xs text-primary tracking-[0.2em] font-bold">GEMINI_LIVE_V2</span>
                     <div className="flex justify-end mt-1 gap-1">
                         {[1,2,3,4].map(i => <div key={i} className={`w-1 h-3 bg-primary/50 ${i <= volume * 10 ? 'opacity-100' : 'opacity-20'}`}></div>)}
                     </div>
                 </div>
            </div>

            {/* Center Status */}
            <div className="relative z-10 flex flex-col items-center gap-2 mt-[20vh]">
                 <div className={`
                    text-4xl md:text-6xl font-black tracking-tighter uppercase transition-colors duration-300
                    ${isSpeaking ? 'text-white drop-shadow-[0_0_20px_rgba(249,115,22,0.8)]' : 'text-zinc-600'}
                 `}>
                    {isSpeaking ? 'TRANSMITTING' : (isConnected ? 'LISTENING' : 'CONNECTING')}
                 </div>
                 <div className="h-px w-32 bg-zinc-800 relative overflow-hidden">
                     <div className="absolute inset-0 bg-primary/50 w-1/2 animate-[scan-vertical_1s_linear_infinite_reverse]" style={{ transform: 'translateX(-100%)' }}></div>
                 </div>
                 <p className="font-mono text-xs text-zinc-500 animate-pulse">
                     {isSpeaking ? '>> INCOMING_VOICE_DATA' : '>> AWAITING_USER_INPUT'}
                 </p>
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-center items-end relative pointer-events-auto">
                 <button 
                    onClick={onClose}
                    className="group relative px-8 py-3 bg-red-950/20 border border-red-900/50 hover:bg-red-900/40 hover:border-red-500 transition-all rounded-sm overflow-hidden"
                 >
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                     <span className="relative z-10 font-mono text-xs font-bold text-red-500 group-hover:text-red-300 tracking-[0.2em]">TERMINATE UPLINK</span>
                     
                     {/* Corner accents */}
                     <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500/50"></div>
                     <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500/50"></div>
                 </button>
            </div>
        </div>
        
        {/* Floating Code Snippets */}
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
    </div>
  );
};
