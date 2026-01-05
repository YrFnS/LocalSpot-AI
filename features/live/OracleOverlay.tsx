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

  // Animation Loop for the "Eye"
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

      // Base Circle
      const baseRadius = 100;
      // Pulse effect based on volume or speaking state
      const pulse = isSpeaking ? 20 * Math.sin(time * 10) : volume * 100; 
      const radius = baseRadius + pulse;

      // Draw "The Eye" Aura
      const gradient = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.5, centerX, centerY, radius * 1.5);
      if (isSpeaking) {
          gradient.addColorStop(0, '#f97316'); // Primary Orange
          gradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.2)');
          gradient.addColorStop(1, 'transparent');
      } else if (isConnected) {
          gradient.addColorStop(0, '#3b82f6'); // Blue (Listening)
          gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)');
          gradient.addColorStop(1, 'transparent');
      } else {
          gradient.addColorStop(0, '#71717a'); // Gray (Connecting)
          gradient.addColorStop(1, 'transparent');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner Core
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.8 + (pulse * 0.2), 0, Math.PI * 2);
      ctx.strokeStyle = isSpeaking ? '#fff' : (isConnected ? '#93c5fd' : '#52525b');
      ctx.lineWidth = 2;
      ctx.stroke();

      // Orbital Rings
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.2);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 1.2, 0, Math.PI * 1.5);
      ctx.strokeStyle = isSpeaking ? 'rgba(249, 115, 22, 0.5)' : 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-time * 0.3);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 1.4, 0, Math.PI * 1.2);
      ctx.strokeStyle = isSpeaking ? 'rgba(249, 115, 22, 0.3)' : 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
      
      // Waveform lines if speaking
      if (isSpeaking || volume > 0.05) {
          ctx.beginPath();
          ctx.strokeStyle = isSpeaking ? '#fdba74' : '#60a5fa';
          ctx.lineWidth = 2;
          for (let i = 0; i < 360; i+=10) {
              const rad = i * (Math.PI / 180);
              const len = (Math.sin(time * 5 + i) * 10) + (volume * 50);
              const x1 = centerX + Math.cos(rad) * radius;
              const y1 = centerY + Math.sin(rad) * radius;
              const x2 = centerX + Math.cos(rad) * (radius + len);
              const y2 = centerY + Math.sin(rad) * (radius + len);
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
          }
          ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Resize handler
    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    render();

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, isConnected, isSpeaking, volume]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl animate-in fade-in duration-500 flex flex-col items-center justify-center">
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center gap-8">
            <div className="text-center space-y-2">
                <h2 className={`text-2xl font-mono tracking-[0.2em] font-bold ${isSpeaking ? 'text-primary' : (isConnected ? 'text-blue-400' : 'text-zinc-500')}`}>
                    {isConnected ? (isSpeaking ? 'ORACLE SPEAKING' : 'LISTENING...') : 'CONNECTING...'}
                </h2>
                <p className="text-zinc-500 text-xs font-mono uppercase">
                    GEMINI LIVE AUDIO STREAM // 24kHz
                </p>
            </div>
        </div>

        <button 
            onClick={onClose}
            className="absolute bottom-12 p-4 rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-white hover:bg-zinc-800 transition-all"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    </div>
  );
};