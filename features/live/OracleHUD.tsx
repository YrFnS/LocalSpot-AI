
import React, { useEffect, useRef } from 'react';

interface OracleHUDProps {
  isConnected: boolean;
  isSpeaking: boolean;
  volume: number;
  visionMode: boolean;
}

export const OracleHUD: React.FC<OracleHUDProps> = ({
  isConnected,
  isSpeaking,
  volume,
  visionMode
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize Observer to handle dynamic container sizing (Full vs Mini)
    const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            const { width, height } = entry.contentRect;
            canvas.width = width;
            canvas.height = height;
        }
    });
    resizeObserver.observe(container);

    let time = 0;

    const render = () => {
      time += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const isMini = height < 200; // Detection for Mini HUD mode

      ctx.clearRect(0, 0, width, height);

      // --- Background Grid (Only if not in vision mode & not mini) ---
      if (!visionMode && !isMini) {
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
      // Scale down significantly if in Mini mode
      const baseRadius = isMini ? (height * 0.3) : (visionMode ? 100 : 80);
      const pulse = isSpeaking ? 20 * Math.sin(time * 15) : volume * (isMini ? 50 : 150); 
      const radius = Math.max(5, baseRadius + (visionMode ? 0 : (isMini ? pulse * 0.2 : pulse)));

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
          ctx.lineWidth = isMini ? 1 : 2;
          
          // Center Cross
          ctx.beginPath();
          const crossSize = isMini ? 5 : 10;
          ctx.moveTo(centerX - crossSize, centerY); ctx.lineTo(centerX + crossSize, centerY);
          ctx.moveTo(centerX, centerY - crossSize); ctx.lineTo(centerX, centerY + crossSize);
          ctx.stroke();

          // Bracket Corners (Only in Full Mode or if huge volume)
          if (!isMini) {
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
      }

      // --- Waveform Visualization ---
      if (isConnected) {
          const waveY = visionMode && !isMini ? height - 100 : centerY;
          const waveCount = isMini ? 2 : 4;
          
          for(let j=0; j<waveCount; j++) {
             ctx.beginPath();
             const waveColor = isSpeaking ? `rgba(255, 150, 50, ${0.5 - j*0.1})` : `rgba(100, 150, 255, ${0.5 - j*0.1})`;
             ctx.strokeStyle = waveColor;
             ctx.lineWidth = isMini ? 1 : 2;
             
             // In Mini mode, widen the wave to fill the horizontal bar
             const step = isMini ? 2 : 5;
             
             for (let i = 0; i < width; i+=step) {
                  const distFromCenter = Math.abs(i - centerX);
                  const envelope = Math.max(0, 1 - distFromCenter / (width/2));
                  const baseHeight = isMini ? (volume * 40 + 5) : (volume * 100 + 10);
                  const waveHeight = baseHeight * envelope;
                  
                  const y = waveY + Math.sin(i * 0.02 + time * (2 + j) + j) * waveHeight;
                  if (i===0) ctx.moveTo(i, y);
                  else ctx.lineTo(i, y);
             }
             ctx.stroke();
          }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
        resizeObserver.disconnect();
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isConnected, isSpeaking, volume, visionMode]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
        <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
