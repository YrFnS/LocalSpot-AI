import React, { useMemo } from 'react';
import { Business, Coordinates } from '../../types';

interface RadarMapProps {
  userLocation: Coordinates | null;
  businesses: Business[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

const RadarMap: React.FC<RadarMapProps> = ({ userLocation, businesses, onSelect, selectedId }) => {
  const size = 600; // SVG canvas size
  const center = size / 2;
  const range = 0.03; // ~3km approx degrees delta

  const points = useMemo(() => {
    if (!userLocation) return [];
    return businesses.map((b) => {
      if (!b.location) return null;
      const dy = (userLocation.latitude - b.location.latitude) / range;
      const dx = (b.location.longitude - userLocation.longitude) / range;
      
      // Scale to canvas
      const x = center + dx * (size / 2);
      const y = center + dy * (size / 2); // Latitude increases upwards, SVG y increases downwards, need flip?
      // Normally lat increases North (up), y increases down. 
      // dy > 0 means user is North of business. Business should be below center.
      // If user=10, biz=9. dy=1/range. y = center + positive. Correct.

      return { ...b, cx: x, cy: y };
    }).filter(Boolean) as (Business & { cx: number; cy: number })[];
  }, [userLocation, businesses, center]);

  if (!userLocation) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background text-zinc-500 font-mono text-sm">
        [ AWAITING GEOSPATIAL DATA ]
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-background select-none">
       {/* Background Grid */}
      <svg className="absolute inset-0 h-full w-full opacity-20 pointer-events-none" viewBox={`0 0 ${size} ${size}`}>
         <defs>
            <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#09090b" stopOpacity="0" />
            </radialGradient>
         </defs>
         <rect width={size} height={size} fill="url(#radarGradient)" />
         <circle cx={center} cy={center} r={size * 0.15} fill="none" stroke="#3b82f6" strokeWidth="0.5" />
         <circle cx={center} cy={center} r={size * 0.3} fill="none" stroke="#3b82f6" strokeWidth="0.5" />
         <circle cx={center} cy={center} r={size * 0.45} fill="none" stroke="#3b82f6" strokeWidth="0.5" />
         <line x1={center} y1="0" x2={center} y2={size} stroke="#3b82f6" strokeWidth="0.5" />
         <line x1="0" y1={center} x2={size} y2={center} stroke="#3b82f6" strokeWidth="0.5" />
      </svg>

      {/* Scanning Line Animation */}
      <div className="absolute inset-0 pointer-events-none animate-radar-spin origin-center">
         <div className="h-1/2 w-full bg-gradient-to-t from-accent/20 to-transparent bottom-1/2 absolute" style={{clipPath: 'polygon(50% 100%, 0 0, 100% 0)'}}></div>
      </div>

      {/* Interactive Layer */}
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${size} ${size}`}>
        {/* User Dot */}
        <circle cx={center} cy={center} r="6" fill="#f97316" className="animate-pulse">
            <title>You are here</title>
        </circle>
        <circle cx={center} cy={center} r="12" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.5" />

        {/* Business Dots */}
        {points.map((p) => (
          <g 
            key={p.id} 
            onClick={() => onSelect(p.id)}
            className="cursor-pointer transition-all duration-300 hover:opacity-100"
            style={{ opacity: selectedId === p.id ? 1 : 0.7 }}
          >
            <circle 
                cx={p.cx} 
                cy={p.cy} 
                r={selectedId === p.id ? 8 : 4} 
                fill={selectedId === p.id ? '#ffffff' : '#3b82f6'} 
                stroke="rgba(0,0,0,0.5)"
                strokeWidth="1"
            />
            <text 
                x={p.cx} 
                y={p.cy - 12} 
                textAnchor="middle" 
                fill={selectedId === p.id ? '#ffffff' : '#a1a1aa'} 
                fontSize="10"
                fontFamily="JetBrains Mono"
                className="pointer-events-none drop-shadow-md bg-black"
            >
                {selectedId === p.id ? p.name.toUpperCase() : ''}
            </text>
          </g>
        ))}
      </svg>
      
      <div className="absolute bottom-4 left-4 font-mono text-xs text-zinc-500">
         RADAR_VIEW // SCANNING AREA
      </div>
    </div>
  );
};

export default RadarMap;
