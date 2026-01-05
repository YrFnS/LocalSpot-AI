
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

  // Generate connection lines for the active cluster
  const clusterLines = useMemo(() => {
      // Priority: Hovered > Selected
      const targetId = hoveredId || selectedId;
      if (!targetId) return [];

      const targetBiz = businesses.find(b => b.id === targetId);
      if (!targetBiz || !targetBiz.types?.[0]) return [];
      
      const targetType = targetBiz.types[0];
      const typePoints = points.filter(p => p.types?.[0] === targetType);
      
      // If we have less than 2 points, no lines needed
      if (typePoints.length < 2) return [];

      const origin = typePoints.find(p => p.id === targetId);
      if (!origin) return [];

      // Draw lines from origin to all other points of same type
      return typePoints.filter(p => p.id !== origin.id).map(p => ({
          x1: origin.cx,
          y1: origin.cy,
          x2: p.cx,
          y2: p.cy,
          id: p.id
      }));
  }, [points, hoveredId, selectedId, businesses]);

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
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#09090b" stopOpacity="0" />
                </radialGradient>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="0.5"/>
                </pattern>
             </defs>
             <rect width={size} height={size} fill="url(#radarGradient)" />
             <rect width={size} height={size} fill="url(#grid)" />
             
             {/* Concentric Rings */}
             {[0.15, 0.3, 0.45, 0.6, 0.75].map((r, i) => (
                 <circle 
                    key={i} 
                    cx={center} 
                    cy={center} 
                    r={size * r} 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth={0.5} 
                    strokeOpacity={0.1 + (i * 0.05)}
                    strokeDasharray={i % 2 === 0 ? "4 4" : "none"}
                 />
             ))}
             
             {/* Crosshairs */}
             <line x1={center} y1="0" x2={center} y2={size} stroke="#3b82f6" strokeWidth="0.5" opacity="0.3" />
             <line x1="0" y1={center} x2={size} y2={center} stroke="#3b82f6" strokeWidth="0.5" opacity="0.3" />
          </svg>

          {/* Scanning Effect */}
          <div className="absolute inset-0 pointer-events-none animate-radar-spin origin-center opacity-40">
             <div className="h-[50%] w-full top-0 bg-gradient-to-l from-transparent via-primary/5 to-transparent absolute" style={{ transformOrigin: 'bottom center', transform: 'rotate(-90deg)' }}></div>
             <div className="absolute top-[50%] left-[50%] w-[50%] h-[1px] bg-gradient-to-r from-primary/50 to-transparent origin-left shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
          </div>

          {/* Interactive Data Layer */}
          <svg className="absolute inset-0 h-full w-full preserve-3d" viewBox={`0 0 ${size} ${size}`}>
            {/* Semantic Cluster Lines */}
            {clusterLines.map((line, i) => (
                <line
                    key={`line-${i}`}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="#f97316"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                    className="animate-pulse"
                />
            ))}

            {/* User Location */}
            <g className="animate-pulse">
                <circle cx={center} cy={center} r="4" fill="#f97316" />
                <circle cx={center} cy={center} r="20" fill="none" stroke="#f97316" strokeWidth="0.5" opacity="0.5" />
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
                        opacity: isDimmed ? 0.3 : 1,
                        transformBox: 'fill-box', 
                        transformOrigin: 'center'
                    }}
                >
                    {/* Ripple Ring for Selected/Hovered */}
                    {(isSelected || isHovered) && (
                        <circle cx={p.cx} cy={p.cy} r="20" fill="none" stroke={isSelected ? "#fff" : "#f97316"} strokeWidth="0.5" className="animate-ping" opacity="0.5" />
                    )}
                    
                    {/* Node Body */}
                    <circle 
                        cx={p.cx} 
                        cy={p.cy} 
                        r={isSelected || isHovered ? 6 : 3} 
                        fill={isSelected ? '#ffffff' : (isRelated ? '#f97316' : '#3b82f6')} 
                        stroke="#000"
                        strokeWidth="1"
                        className="transition-all duration-300 ease-out"
                    />

                    {/* Dynamic Label */}
                    {(isSelected || isHovered) && (
                        <g>
                            <rect x={p.cx + 10} y={p.cy - 12} width="110" height="24" fill="rgba(0,0,0,0.85)" rx="2" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            <text 
                                x={p.cx + 15} 
                                y={p.cy + 4} 
                                fill="#fff" 
                                fontSize="10"
                                fontFamily="JetBrains Mono"
                                fontWeight="bold"
                            >
                                {p.name.length > 15 ? p.name.substring(0,14) + '..' : p.name}
                            </text>
                             <line x1={p.cx} y1={p.cy} x2={p.cx+10} y2={p.cy} stroke="#fff" strokeWidth="1" />
                        </g>
                    )}
                </g>
              );
            })}
          </svg>
       </div>
      
      {/* HUD Overlay Elements */}
      <div className="absolute bottom-4 left-4 font-mono text-[10px] text-zinc-500 flex flex-col gap-1 pointer-events-none">
         <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span>LIVE MONITORING</span>
         </div>
         <div className="text-zinc-600">
             RANGE: {(dynamicRange * 111).toFixed(2)}KM
         </div>
         <div className="text-zinc-600">
             TILT: {tilt.x.toFixed(1)}°X / {tilt.y.toFixed(1)}°Y
         </div>
      </div>

      {onRescan && (
        <button 
            onClick={onRescan}
            className="absolute top-4 right-4 bg-zinc-900/90 backdrop-blur border border-zinc-700 hover:border-primary text-zinc-300 hover:text-white px-4 py-2 rounded-sm text-[10px] font-mono tracking-widest transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center gap-2 z-10"
        >
            <span className="w-1.5 h-1.5 bg-primary rounded-none animate-spin"></span>
            RE-SCAN SECTOR
        </button>
      )}
    </div>
  );
};

export default RadarMap;
