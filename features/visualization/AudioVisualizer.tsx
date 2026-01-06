
import React from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying }) => {
  return (
    <div className="flex items-center gap-1 h-5 px-2 bg-black/20 rounded border border-zinc-800/50">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={`w-0.5 bg-primary transition-all duration-75 ease-in-out ${isPlaying ? 'animate-pulse' : 'h-1 opacity-20'}`}
          style={{
            height: isPlaying ? `${Math.max(20, Math.random() * 100)}%` : '20%',
            animationDelay: `${i * 0.05}s`
          }}
        />
      ))}
      {isPlaying && (
          <span className="ml-1 text-[8px] font-mono text-primary uppercase animate-pulse">
            TX_ACTIVE
          </span>
      )}
    </div>
  );
};
