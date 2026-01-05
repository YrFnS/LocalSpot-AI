import React from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying }) => {
  if (!isPlaying) return null;

  return (
    <div className="flex items-end justify-center gap-1 h-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-primary animate-pulse"
          style={{
            height: '100%',
            animationDuration: `${0.4 + i * 0.1}s`,
            animationDelay: `${i * 0.05}s`
          }}
        />
      ))}
      <span className="ml-2 text-[10px] font-mono text-primary uppercase animate-pulse">
        Audio Active
      </span>
    </div>
  );
};