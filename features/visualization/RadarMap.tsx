
import React, { useMemo, useState, useRef } from 'react';
import { Business, Coordinates } from '../../types';

interface RadarMapProps {
  userLocation: Coordinates | null;
  businesses: Business[];
  onSelect: (id: string) => void;
  selectedId: string | null;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onRescan?: () => void;
}

const RadarMap: React.FC<RadarMapProps> = ({ 
    userLocation, 
    businesses, 
    onSelect, 
    selectedId, 
    hoveredId, 
    setHoveredId, 
    onRescan 
}) => {
  const size = 800; // Large internal coordinate system
  const center = size / 2;
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Mouse Move Parallax Effect
  const handleMouseMove = (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      // Calculate tilt (-8deg to 8deg) for subtle 3D effect
      setTilt({ 
          x: (0.5 - y) * 16, 
          y: (x - 0.5) * 16 
      });
  };

  const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
  };

  // Calculate dynamic range based on furthest business
  const dynamicRange = useMemo(() => {
    if (!userLocation || businesses.length === 0) return 0.03;
    let maxDiff = 0;
    businesses.forEach(b => {
        if (b.location) {
            const dy = Math.abs(userLocation.latitude - b.location.latitude);
            const dx = Math.abs(userLocation.longitude - b.location.longitude);
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > maxDiff) maxDiff = dist;
        }
    });
    return Math.max(0.01, maxDiff * 1.2);
  }, [userLocation, businesses]);

  const points = useMemo(() => {
    if (!userLocation) return [];
    return businesses.map((b) => {
      if (!b.location) return null;
      const dy = (userLocation.latitude - b.location.latitude) / dynamicRange;
      const dx = (b.location.longitude - userLocation.longitude) / dynamicRange;
      // Invert Y for screen coords
      const x = center + dx * (size / 2);
      const y = center + dy * (size / 2); 
      return { ...b, cx: x, cy: y };
    }).filter(Boolean) as (Business & { cx: number; cy: number })[];
  }, [userLocation, businesses, center, dynamicRange]);

  // Identify the category of the currently hovered item to highlight similar ones
  const hoveredType = useMemo(() => {
      if (!hoveredId) return null;
      const match = businesses.find(b => b.id === hoveredId);
      return match?.types?.[0] || null;
  }, [hoveredId, businesses]);

  if (!userLocation) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background text-zinc-500 font-mono text-sm animate-pulse">
        [ INITIALIZING GEOSPATIAL UPLINK ]
      </div>
    );
  }

  return (
    <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-full w-full overflow-hidden bg-[#050505] select-none perspective-container group"
        style={{ perspective: '1200px' }}
    >
       {/* 3D Plane Wrapper */}
       <div 
         className="absolute inset-0 transition-transform duration-300 ease-out preserve-3d"
         style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
       >
          {/* Background Grid & Decor */}
          <svg className="absolute inset-0 h-full w-full opacity-30 pointer-events-none" viewBox={`0 0 ${size} ${size}`}>
             <defs>
                <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#09090b" stopOpacity="0" />
                </radialGradient>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5"/>
                </pattern>
             </defs>
             <rect width={size} height={size} fill="url(#radarGradient)" />
             <rect width={size} height={size} fill="url(#grid)" />
             
             {/* Concentric Rings with Tactical Dashes */}
             {[0.15, 0.3, 0.45, 0.6, 0.75].map((r, i) => (
                 <circle 
                    key={i} 
                    cx={center} 
                    cy={center} 
                    r={size * r} 
                    fill="none" 
                    stroke={i % 2 === 0 ? "#f97316" : "#3b82f6"} 
                    strokeWidth={0.5} 
                    strokeOpacity={0.2}
                    strokeDasharray="10 5"
                    className={i === 2 ? "animate-[spin_20s_linear_infinite]" : ""}
                    style={{ transformOrigin: 'center' }}
                 />
             ))}
             
             {/* Crosshairs */}
             <line x1={center} y1="0" x2={center} y2={size} stroke="#fff" strokeWidth="0.5" opacity="0.1" />
             <line x1="0" y1={center} x2={size} y2={center} stroke="#fff" strokeWidth="0.5" opacity="0.1" />
          </svg>

          {/* Active Scanning Sweep */}
          <div className="absolute inset-0 pointer-events-none animate-radar-spin origin-center opacity-60">
             <div className="h-[50%] w-full top-0 bg-gradient-to-l from-transparent via-primary/10 to-transparent absolute" style={{ transformOrigin: 'bottom center', transform: 'rotate(-90deg)' }}></div>
             <div className="absolute top-[50%] left-[50%] w-[50%] h-[2px] bg-gradient-to-r from-primary to-transparent origin-left shadow-[0_0_20px_rgba(249,115,22,0.8)]"></div>
          </div>

          {/* Interactive Data Layer */}
          <svg className="absolute inset-0 h-full w-full preserve-3d" viewBox={`0 0 ${size} ${size}`}>
            
            {/* User Location */}
            <g className="animate-pulse">
                <circle cx={center} cy={center} r="4" fill="#fff" />
                <circle cx={center} cy={center} r="30" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.5" />
                <text x={center + 10} y={center + 4} fill="#f97316" fontSize="10" fontFamily="JetBrains Mono" opacity="0.7">YOU</text>
            </g>

            {/* Business Nodes */}
            {points.map((p) => {
              const isSelected = selectedId === p.id;
              const isHovered = hoveredId === p.id;
              const isRelated = hoveredType && p.types?.[0] === hoveredType;
              const isDimmed = (hoveredId && !isHovered && !isRelated);

              return (
                <g 
                    key={p.id} 
                    onClick={() => onSelect(p.id)}
                    onMouseEnter={() => setHoveredId(p.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="cursor-pointer transition-all duration-300"
                    style={{ 
                        opacity: isDimmed ? 0.2 : 1,
                        transformBox: 'fill-box', 
                        transformOrigin: 'center'
                    }}
                >
                    {/* Targeting Reticle */}
                    {(isSelected || isHovered) && (
                        <g className="animate-[spin_4s_linear_infinite]" style={{ transformOrigin: `${p.cx}px ${p.cy}px` }}>
                            <rect x={p.cx - 15} y={p.cy - 15} width="30" height="30" fill="none" stroke={isSelected ? "#fff" : "#f97316"} strokeWidth="1" strokeDasharray="10 20" />
                        </g>
                    )}
                    
                    {/* Node Body */}
                    <circle 
                        cx={p.cx} 
                        cy={p.cy} 
                        r={isSelected ? 6 : (isHovered ? 5 : 3)} 
                        fill={isSelected ? '#ffffff' : (isRelated ? '#f97316' : '#3b82f6')} 
                        stroke="#000"
                        strokeWidth="1"
                        className="transition-all duration-300"
                    />

                    {/* Connecting Line to Center (only when hovered) */}
                    {(isHovered || isSelected) && (
                        <line 
                            x1={center} y1={center} x2={p.cx} y2={p.cy} 
                            stroke={isSelected ? "#fff" : "#f97316"} 
                            strokeWidth="0.5" 
                            strokeDasharray="4 4" 
                            opacity="0.4" 
                        />
                    )}

                    {/* Label */}
                    {(isSelected || isHovered) && (
                        <g>
                            <rect x={p.cx + 12} y={p.cy - 14} width="120" height="28" fill="rgba(0,0,0,0.9)" stroke={isSelected ? "#fff" : "#f97316"} strokeWidth="1" />
                            <text x={p.cx + 18} y={p.cy} fill="#fff" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                                {p.name.length > 15 ? p.name.substring(0,14) + '..' : p.name}
                            </text>
                            <text x={p.cx + 18} y={p.cy + 10} fill="#aaa" fontSize="8" fontFamily="JetBrains Mono">
                                DIST: {p.distanceMeters ? (p.distanceMeters/1000).toFixed(1) : '?'}KM
                            </text>
                            <line x1={p.cx} y1={p.cy} x2={p.cx+12} y2={p.cy} stroke={isSelected ? "#fff" : "#f97316"} strokeWidth="1" />
                        </g>
                    )}
                </g>
              );
            })}
          </svg>
       </div>
      
      {/* HUD Elements */}
      <div className="absolute bottom-4 left-4 font-mono text-[9px] text-zinc-500 flex flex-col gap-1 pointer-events-none">
         <div className="flex items-center gap-2 text-primary">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            <span>SYSTEM ONLINE</span>
         </div>
         <div className="text-zinc-600 flex justify-between w-48 border-b border-zinc-800 pb-1">
             <span>RANGE_MAX</span>
             <span>{(dynamicRange * 111).toFixed(2)}KM</span>
         </div>
         <div className="text-zinc-600 flex justify-between w-48">
             <span>GYRO_STAB</span>
             <span>{tilt.x.toFixed(1)} / {tilt.y.toFixed(1)}</span>
         </div>
      </div>

      {onRescan && (
        <button 
            onClick={onRescan}
            className="absolute top-4 right-4 bg-black/80 backdrop-blur border border-primary/50 text-primary hover:bg-primary/10 px-4 py-2 rounded-none text-[10px] font-mono tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(249,115,22,0.3)] z-10 clip-path-polygon"
        >
            [ RE-SCAN SECTOR ]
        </button>
      )}
    </div>
  );
};

export default RadarMap;
