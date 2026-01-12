
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Business, Coordinates, WeatherState } from '../../types';
import { getIconForCondition } from '../../services/weatherService';

interface RadarMapProps {
  userLocation: Coordinates | null;
  businesses: Business[];
  onSelect: (id: string) => void;
  selectedId: string | null;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onRescan?: () => void;
  weather: WeatherState;
}

const RadarMap: React.FC<RadarMapProps> = ({ 
    userLocation, 
    businesses, 
    onSelect, 
    selectedId, 
    hoveredId, 
    setHoveredId, 
    onRescan,
    weather
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 60, y: 0 }); 
  const [rotation, setRotation] = useState(0); 
  const [zoom, setZoom] = useState(0.8);

  const ASSETS = {
      GRID_FLOOR: "https://images.unsplash.com/photo-1614728853913-1e32005e319a?q=80&w=2000&auto=format&fit=crop", 
      SKYBOX: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2000&auto=format&fit=crop", 
      RAIN_OVERLAY: "https://grainy-gradients.vercel.app/noise.svg"
  };

  const size = 1200; 
  const center = size / 2;

  // Cinematic Auto-Rotation
  useEffect(() => {
      let frame = 0;
      const animate = () => {
          if (!hoveredId && !selectedId) {
            setRotation(r => (r + 0.05) % 360);
          }
          frame = requestAnimationFrame(animate);
      };
      animate();
      return () => cancelAnimationFrame(frame);
  }, [hoveredId, selectedId]);

  // Interactive Parallax
  const handleMouseMove = (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; 
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      
      setTilt({ 
          x: 55 + (y * 20), 
          y: x * -15        
      });
  };

  const handleWheel = (e: React.WheelEvent) => {
      setZoom(z => Math.max(0.4, Math.min(1.5, z - e.deltaY * 0.001)));
  };

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
    return Math.max(0.01, maxDiff * 1.3);
  }, [userLocation, businesses]);

  const points = useMemo(() => {
    if (!userLocation) return [];
    return businesses.map((b) => {
      if (!b.location) return null;
      const dy = (userLocation.latitude - b.location.latitude) / dynamicRange;
      const dx = (b.location.longitude - userLocation.longitude) / dynamicRange;
      
      const x = center + dx * (size / 2);
      const y = center + dy * (size / 2); 
      
      const zHeight = b.rating ? (b.rating / 5) * 150 : 50; 

      return { ...b, cx: x, cy: y, z: zHeight };
    }).filter(Boolean) as (Business & { cx: number; cy: number; z: number })[];
  }, [userLocation, businesses, center, dynamicRange]);

  const getWeatherEffects = () => {
      switch(weather.condition) {
          case 'Rainy':
              return (
                  <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                      <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"></div>
                      <div className="absolute inset-0 opacity-30 animate-scan-vertical" 
                           style={{ 
                               backgroundImage: `linear-gradient(to bottom, transparent 90%, rgba(100, 150, 255, 0.4) 100%)`, 
                               backgroundSize: '100% 20px',
                               animationDuration: '0.5s'
                           }}></div>
                  </div>
              );
          case 'Foggy':
              return <div className="absolute inset-0 pointer-events-none z-40 bg-zinc-900/50 backdrop-blur-[2px]"></div>;
          case 'Sunny':
              return (
                <div className="absolute inset-0 pointer-events-none z-40 bg-gradient-to-tr from-orange-500/10 via-transparent to-blue-500/5 mix-blend-screen"></div>
              );
          default: return null;
      }
  };

  if (!userLocation) return <div className="bg-black w-full h-full flex items-center justify-center font-mono text-xs text-zinc-500">ACQUIRING SATELLITE FEED...</div>;

  return (
    <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        className="relative h-full w-full overflow-hidden bg-black select-none perspective-container cursor-move group/radar"
        style={{ perspective: '1200px' }}
    >
       {/* 1. Skybox & Weather Atmosphere */}
       <div 
         className="absolute inset-0 bg-cover bg-center opacity-60 pointer-events-none transition-transform duration-100 ease-linear"
         style={{ 
             backgroundImage: `url(${ASSETS.SKYBOX})`,
             transform: `scale(1.2) translate(${tilt.y}px, ${tilt.x * 0.5}px)` 
         }}
       ></div>
       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none"></div>
       {getWeatherEffects()}

       {/* 2. HUD Overlay */}
       <div className="absolute top-0 left-0 p-6 z-50 pointer-events-none mix-blend-screen">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 tracking-tighter">
                HOLO_DECK<span className="text-primary">.v4</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${weather.condition === 'Rainy' ? 'bg-blue-500' : 'bg-primary'}`}></div>
                <span className="font-mono text-[9px] text-zinc-400 tracking-widest uppercase">
                    ENV: {weather.condition} // {weather.temperature}°C // {points.length} SIGNALS
                </span>
            </div>
       </div>

       {/* 3. The 3D Scene */}
       <div 
         className="absolute inset-0 flex items-center justify-center preserve-3d transition-transform duration-100 ease-linear"
         style={{ 
             transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${zoom})`,
             transformStyle: 'preserve-3d' 
         }}
       >
          {/* 4. Floor Plate */}
          <div 
            className="relative rounded-full preserve-3d"
            style={{ 
                width: `${size}px`, 
                height: `${size}px`,
                transform: `rotateZ(${rotation}deg)`,
                boxShadow: `0 0 100px ${weather.condition === 'Rainy' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(249, 115, 22, 0.1)'}, inset 0 0 100px rgba(0,0,0,0.8)`
            }}
          >
              <div 
                  className="absolute inset-0 rounded-full opacity-40 mix-blend-screen"
                  style={{ 
                      backgroundImage: `url(${ASSETS.GRID_FLOOR})`,
                      backgroundSize: 'cover',
                      filter: 'grayscale(100%) contrast(150%) brightness(0.5)'
                  }}
              ></div>
              
              {/* Radar Sweep */}
              <div 
                className="absolute inset-0 rounded-full animate-[spin_6s_linear_infinite]"
                style={{ 
                    background: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, ${weather.condition === 'Rainy' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(249, 115, 22, 0.1)'} 320deg, ${weather.condition === 'Rainy' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(249, 115, 22, 0.6)'} 360deg)`,
                }}
              ></div>

              {/* Rings */}
              {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                  <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                       style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }}>
                       <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-mono text-white/30 bg-black px-1">
                           {(scale * 5).toFixed(1)}KM
                       </span>
                  </div>
              ))}

              {/* User Center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 preserve-3d">
                   <div className={`absolute inset-0 rounded-full animate-ping ${weather.condition === 'Rainy' ? 'bg-blue-500/20' : 'bg-primary/20'}`}></div>
                   <div className={`absolute inset-0 border rounded-full shadow-[0_0_30px_currentColor] ${weather.condition === 'Rainy' ? 'border-blue-500/50 text-blue-500' : 'border-primary/50 text-primary'}`}></div>
                   <div 
                        className={`absolute bottom-1/2 left-1/2 w-0.5 h-[1000px] bg-gradient-to-t from-current via-transparent to-transparent origin-bottom ${weather.condition === 'Rainy' ? 'text-blue-500' : 'text-primary'}`}
                        style={{ transform: 'rotateX(-90deg)' }}
                   ></div>
              </div>

              {/* 5. Business Markers */}
              {points.map((p) => {
                  const isSelected = selectedId === p.id;
                  const isHovered = hoveredId === p.id;
                  
                  // Billboarding to face camera
                  const billboard = `rotateZ(${-rotation}deg) rotateX(${-tilt.x}deg) rotateY(${-tilt.y}deg)`;
                  
                  return (
                      <div 
                        key={p.id}
                        className="absolute w-0 h-0 preserve-3d"
                        style={{ 
                            left: `${p.cx}px`, 
                            top: `${p.cy}px`,
                            zIndex: isSelected ? 1000 : 10
                        }}
                        onClick={(e) => { e.stopPropagation(); onSelect(p.id); }}
                        onMouseEnter={() => setHoveredId(p.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                          {/* Stalk */}
                          <div 
                             className={`absolute bottom-0 left-0 w-[1px] origin-bottom transition-all duration-300 ${isSelected ? 'bg-white shadow-[0_0_10px_white]' : 'bg-zinc-700/50'}`}
                             style={{ 
                                 height: `${p.z}px`, 
                                 transform: 'rotateX(-90deg)' 
                             }}
                          ></div>

                          {/* Ground Projections */}
                          <div className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300 ${isSelected ? 'border-white w-12 h-12 opacity-100' : 'border-zinc-700 w-4 h-4 opacity-50'}`}></div>
                          {isSelected && (
                              <div className="absolute -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-dashed border-white/20 rounded-full animate-[spin_4s_linear_infinite]"></div>
                          )}

                          {/* The Card */}
                          <div 
                             className="absolute top-0 left-0 transition-transform duration-500 ease-out"
                             style={{ 
                                 transform: `rotateX(-90deg) translateZ(${p.z}px) ${billboard} scale(${isSelected ? 1.5 : 1})` 
                             }}
                          >
                              <div className={`
                                  relative flex flex-col items-center justify-end
                                  w-24 h-32 rounded-sm overflow-hidden border transition-all duration-300 group/card cursor-pointer
                                  ${isSelected 
                                    ? 'border-white bg-black/90 shadow-[0_0_50px_rgba(255,255,255,0.3)]' 
                                    : (isHovered ? 'border-primary bg-black/80 shadow-[0_0_30px_rgba(249,115,22,0.4)]' : 'border-zinc-700/50 bg-black/60 opacity-80 hover:opacity-100')}
                              `}>
                                  
                                  {p.photos?.[0] ? (
                                      <img 
                                        src={p.photos[0].name} 
                                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isSelected ? 'grayscale-0' : 'grayscale'}`}
                                        alt=""
                                      />
                                  ) : (
                                      <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                                          <div className="w-8 h-8 border border-zinc-700 rounded-full"></div>
                                      </div>
                                  )}
                                  
                                  <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-white/10 pointer-events-none"></div>
                                  
                                  {/* Weather Effect on Card */}
                                  {weather.condition === 'Rainy' && <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay"></div>}

                                  <div className="relative z-10 w-full bg-black/90 backdrop-blur-md p-2 border-t border-white/10">
                                      <div className="flex justify-between items-center mb-1">
                                          <div className="flex gap-0.5">
                                              {[...Array(5)].map((_,i) => (
                                                  <div key={i} className={`w-1 h-1 rounded-full ${i < (p.rating||0) ? 'bg-primary' : 'bg-zinc-800'}`}></div>
                                              ))}
                                          </div>
                                      </div>
                                      <div className="text-[8px] font-bold text-white uppercase leading-tight line-clamp-2">{p.name}</div>
                                  </div>
                              </div>
                              
                              {/* Selection Triangle */}
                              {isSelected && (
                                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white animate-bounce"></div>
                              )}
                          </div>
                      </div>
                  );
              })}
          </div>
       </div>

       {/* Control Deck */}
       {onRescan && (
           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
               <button 
                  onClick={onRescan}
                  className="group relative px-8 py-3 bg-black/80 backdrop-blur-xl border border-primary/30 text-primary font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-primary/10 transition-all overflow-hidden clip-path-polygon"
               >
                   <span className="relative z-10 flex items-center gap-3">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
                       INITIATE_DEEP_SCAN
                   </span>
                   <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
               </button>
           </div>
       )}
    </div>
  );
};

export default RadarMap;
