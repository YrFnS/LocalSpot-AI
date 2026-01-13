
import React from 'react';
import { Coordinates, Itinerary } from '../../../types';

interface MapUIProps {
  activeItinerary: Itinerary | null;
  mapCenter: Coordinates | null;
  pitch: number;
  bearing?: number;
  userLocation: Coordinates | null;
  onSearchThisArea: () => void;
  onRecenter: () => void;
  onPitchToggle: () => void;
  onZoom: (dir: 'in' | 'out') => void;
  isFlying?: boolean;
  onToggleFlyover?: () => void;
}

export const MapUI: React.FC<MapUIProps> = ({
  activeItinerary,
  mapCenter,
  pitch,
  bearing = 0,
  userLocation,
  onSearchThisArea,
  onRecenter,
  onPitchToggle,
  onZoom,
  isFlying,
  onToggleFlyover
}) => {
  return (
    <>
      {/* 1. Central Targeting Reticle (Crosshair) */}
      <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center opacity-0 group-hover/map:opacity-100 transition-opacity duration-500">
        <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Outer Ring */}
            <div className="absolute inset-0 border border-white/5 rounded-full scale-100 animate-[spin_10s_linear_infinite]"></div>
            
            {/* Inner Brackets */}
            <div className="w-12 h-12 relative opacity-50">
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
            </div>
            
            {/* Center Dot */}
            <div className="w-1 h-1 bg-primary rounded-full absolute"></div>
            
            {/* Axis Lines */}
            <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
        </div>
      </div>

      {/* 2. Tactical Overlay Grid (Decor) */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-5" 
           style={{ 
             backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`, 
             backgroundSize: '100px 100px' 
           }}>
      </div>
      
      {/* 3. Active Mission HUD (Top Center) */}
      {activeItinerary && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-top-4 duration-500">
            <div className="bg-black/80 backdrop-blur-md border-x border-b border-zinc-700/50 p-1 rounded-b-sm shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <div className="bg-zinc-900/50 border border-zinc-700 p-3 min-w-[280px]">
                    <div className="flex justify-between items-center mb-2 border-b border-zinc-700/50 pb-2">
                        <span className="text-[9px] font-mono text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                            MISSION_ACTIVE
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500">OP_ID: {activeItinerary.id?.substring(0,4)}</span>
                    </div>
                    
                    <div className="text-sm font-bold text-white uppercase tracking-tight mb-2 text-center">
                        {activeItinerary.title}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-px bg-zinc-800 mb-3">
                        <div className="bg-zinc-900 p-1.5 text-center">
                            <div className="text-[8px] text-zinc-500">WAYPOINTS</div>
                            <div className="text-[10px] text-white font-mono">{activeItinerary.items.length}</div>
                        </div>
                        <div className="bg-zinc-900 p-1.5 text-center">
                            <div className="text-[8px] text-zinc-500">EST_COST</div>
                            <div className="text-[10px] text-white font-mono">{activeItinerary.totalCostEstimate}</div>
                        </div>
                    </div>

                    {onToggleFlyover && (
                        <button 
                            onClick={onToggleFlyover}
                            className={`
                                w-full py-1.5 flex items-center justify-center gap-2 text-[9px] font-mono font-bold uppercase tracking-widest transition-all border
                                ${isFlying 
                                    ? 'bg-red-950/30 text-red-400 border-red-900 hover:bg-red-900/50' 
                                    : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'}
                            `}
                        >
                            {isFlying ? (
                                <>ABORT_SEQ</>
                            ) : (
                                <>INITIATE_FLYOVER</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
      
      {/* 4. Search Area Button (Floating) */}
      {!activeItinerary && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
          <button 
            onClick={onSearchThisArea}
            className="group relative px-5 py-2 bg-black/60 backdrop-blur-xl border border-zinc-700 hover:border-primary transition-all overflow-hidden rounded-full shadow-2xl"
          >
            <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <div className="relative flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                <span className="text-[10px] font-mono font-bold text-zinc-300 group-hover:text-white tracking-[0.2em] uppercase">
                    Scan_Sector
                </span>
            </div>
          </button>
        </div>
      )}

      {/* 5. Telemetry Deck (Top Right) */}
      <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2 pointer-events-none">
        {mapCenter && (
          <div className="flex flex-col items-end">
              <div className="bg-black/90 backdrop-blur-md border border-zinc-800 p-2 flex gap-4 text-[9px] font-mono shadow-xl rounded-sm">
                  <div className="flex flex-col items-end">
                      <span className="text-zinc-600 text-[8px] uppercase tracking-wider">LATITUDE</span>
                      <span className="text-primary font-bold">{mapCenter.latitude.toFixed(4)}</span>
                  </div>
                  <div className="w-px bg-zinc-800"></div>
                  <div className="flex flex-col items-end">
                      <span className="text-zinc-600 text-[8px] uppercase tracking-wider">LONGITUDE</span>
                      <span className="text-primary font-bold">{mapCenter.longitude.toFixed(4)}</span>
                  </div>
              </div>
              <div className="h-4 w-px bg-zinc-700 mr-4"></div>
          </div>
        )}
        
        <button 
          onClick={onRecenter}
          className="pointer-events-auto w-10 h-10 flex items-center justify-center bg-zinc-900 border border-zinc-700 hover:border-white hover:bg-zinc-800 text-white transition-all shadow-lg rounded-sm group"
          title="Recenter"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:rotate-90 transition-transform duration-500"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"/><path d="M8 12h8"/></svg>
        </button>
      </div>

      {/* 6. Control Stack (Bottom Right) */}
      <div className="absolute bottom-12 right-4 z-30 flex flex-col items-end">
        <div className="bg-[#09090b]/90 backdrop-blur-md border border-zinc-800 rounded-sm overflow-hidden flex flex-col shadow-2xl">
            <button 
            onClick={onPitchToggle}
            className="w-10 h-10 border-b border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center justify-center font-mono text-[10px] font-bold"
            title="Toggle 3D"
            >
            3D
            </button>
            <button 
            onClick={() => onZoom('in')}
            className="w-10 h-10 border-b border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
            >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <button 
            onClick={() => onZoom('out')}
            className="w-10 h-10 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
            >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
        </div>
      </div>
      
      {/* 7. Status Bar (Bottom Left) */}
      <div className="absolute bottom-12 left-6 z-30">
        <div className="flex items-end gap-2">
            <div className="h-16 w-1 bg-gradient-to-t from-primary via-primary/50 to-transparent"></div>
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-white tracking-[0.2em] uppercase">SAT_LINK_V4</span>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></span>
                </div>
                
                <div className="flex gap-4 text-[9px] font-mono text-zinc-500 uppercase bg-black/60 backdrop-blur-sm border-l-2 border-zinc-700 px-2 py-1">
                    <div className="flex gap-1">
                        <span>PITCH:</span>
                        <span className="text-zinc-300">{Math.round(pitch)}°</span>
                    </div>
                    <div className="flex gap-1">
                        <span>BEARING:</span>
                        <span className="text-zinc-300">{Math.round(bearing || 0)}°</span>
                    </div>
                    <div className="flex gap-1">
                        <span>SIG:</span>
                        <span className="text-primary">100%</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};
