
import React from 'react';
import { Coordinates, Itinerary } from '../../../types';

interface MapUIProps {
  activeItinerary: Itinerary | null;
  mapCenter: Coordinates | null;
  pitch: number;
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
      {/* Central Targeting Reticle */}
      <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center opacity-0 group-hover/map:opacity-40 transition-opacity duration-500">
        <div className="w-12 h-12 border border-white/50 rounded-full flex items-center justify-center relative">
          <div className="absolute inset-0 border-t-2 border-b-2 border-primary animate-spin"></div>
          <div className="w-1 h-1 bg-primary rounded-full"></div>
        </div>
        <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
      </div>

      {/* Tactical Overlay Grid */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-5" 
           style={{ 
             backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`, 
             backgroundSize: '100px 100px' 
           }}>
      </div>
      
      {/* Active Mission HUD */}
      {activeItinerary && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-black/90 border-t-2 border-primary border-x border-b border-zinc-800 px-6 py-2 shadow-[0_0_30px_rgba(249,115,22,0.3)] flex flex-col items-center animate-in slide-in-from-top-4">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">ACTIVE MISSION</div>
          <div className="text-sm font-bold text-white uppercase tracking-tight">{activeItinerary.title}</div>
          <div className="flex gap-4 mt-1 text-[9px] font-mono text-primary">
            <span>{activeItinerary.items.length} WAYPOINTS</span>
            <span>EST. TIME: 4H</span>
          </div>

          {onToggleFlyover && (
              <button 
                onClick={onToggleFlyover}
                className={`
                    mt-2 flex items-center gap-2 px-3 py-1 rounded-sm text-[9px] font-mono font-bold uppercase tracking-widest transition-all
                    ${isFlying 
                        ? 'bg-red-900/50 text-red-400 border border-red-500/30 hover:bg-red-900' 
                        : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'}
                `}
              >
                  {isFlying ? (
                      <>
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-sm"></span>
                        ABORT_PLAYBACK
                      </>
                  ) : (
                      <>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        INITIATE_FLYOVER
                      </>
                  )}
              </button>
          )}
        </div>
      )}
      
      {/* Search Area Button */}
      {!activeItinerary && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 transition-opacity">
          <button 
            onClick={onSearchThisArea}
            className="bg-black/80 backdrop-blur-md border border-primary/40 hover:border-primary text-primary px-4 py-2 rounded-sm font-mono text-[10px] tracking-widest shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all hover:bg-primary/10 flex items-center gap-2 group clip-path-polygon"
          >
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            SEARCH_SECTOR
          </button>
        </div>
      )}

      {/* Top Right HUD: Coordinates & Recenter */}
      <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2 pointer-events-none">
        {mapCenter && (
          <div className="text-[9px] font-mono text-primary bg-black/90 px-3 py-1.5 border border-zinc-800 backdrop-blur-md flex flex-col items-end gap-0.5 animate-in fade-in">
            <span className="text-zinc-500 text-[8px] uppercase tracking-widest">RETICLE_COORDS</span>
            <div>
              {Math.abs(mapCenter.latitude).toFixed(4)}°N <span className="text-zinc-700 mx-1">/</span> {Math.abs(mapCenter.longitude).toFixed(4)}°W
            </div>
          </div>
        )}
        
        <button 
          onClick={onRecenter}
          className="w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-700 hover:border-white hover:bg-zinc-800 text-white transition-all shadow-lg pointer-events-auto"
          title="Recenter Map"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
      </div>

      {/* Bottom Right: Controls */}
      <div className="absolute bottom-12 right-4 z-30 flex flex-col gap-1">
        <button 
          onClick={onPitchToggle}
          className="w-8 h-8 bg-black/80 backdrop-blur border border-zinc-700 hover:border-primary text-zinc-300 hover:text-primary transition-all flex items-center justify-center shadow-lg font-mono text-[10px] font-bold"
          title="Toggle 3D Pitch"
        >
          3D
        </button>
        <div className="h-px bg-zinc-800 w-full my-1"></div>
        <button 
          onClick={() => onZoom('in')}
          className="w-8 h-8 bg-black/80 backdrop-blur border border-zinc-700 hover:border-primary text-zinc-300 hover:text-primary transition-all flex items-center justify-center shadow-lg"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <button 
          onClick={() => onZoom('out')}
          className="w-8 h-8 bg-black/80 backdrop-blur border border-zinc-700 hover:border-primary text-zinc-300 hover:text-primary transition-all flex items-center justify-center shadow-lg"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
      
      {/* Bottom Left: Mode Indicator */}
      <div className="absolute bottom-12 left-6 z-30 flex items-center gap-3">
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-primary to-transparent"></div>
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-bold text-white tracking-[0.2em] uppercase">SATELLITE_LINK</span>
          <span className="text-[9px] font-mono text-zinc-500 uppercase">SIGNAL_STRENGTH: 100%</span>
          <span className="text-[9px] font-mono text-primary/70 uppercase">PITCH: {Math.round(pitch)}°</span>
        </div>
      </div>
    </>
  );
};
