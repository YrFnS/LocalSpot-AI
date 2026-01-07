
import React, { useEffect, useRef, useState } from 'react';
import { Business, Coordinates, Itinerary } from '../../types';

// Declare Leaflet global
declare const L: any;

interface RealMapProps {
  userLocation: Coordinates | null;
  businesses: Business[];
  onSelect: (id: string) => void;
  selectedId: string | null;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onRescan?: (customLocation?: Coordinates) => void;
  activeItinerary?: Itinerary | null;
}

export const RealMap: React.FC<RealMapProps> = ({
  userLocation,
  businesses,
  onSelect,
  selectedId,
  hoveredId,
  setHoveredId,
  onRescan,
  activeItinerary
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const itineraryLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const isFirstLoad = useRef(true);
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const defaultCenter = userLocation ? [userLocation.latitude, userLocation.longitude] : [37.7749, -122.4194];
    const initialZoom = 13;

    const map = L.map(mapRef.current, {
      zoomControl: false, // Custom controls
      attributionControl: false,
      center: defaultCenter,
      zoom: initialZoom,
      renderer: L.canvas()
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      subdomains: 'abcd',
    }).addTo(map);

    map.on('move', () => {
      const center = map.getCenter();
      setMapCenter({ latitude: center.lat, longitude: center.lng });
    });

    mapInstanceRef.current = map;
    itineraryLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync User Location Marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    const map = mapInstanceRef.current;

    const createPulseIcon = () => {
       return L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="relative flex items-center justify-center w-4 h-4">
              <span class="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_10px_rgba(249,115,22,0.8)]"></span>
            </div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
       });
    };

    if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.latitude, userLocation.longitude]);
    } else {
        userMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], {
            icon: createPulseIcon(),
            interactive: false,
            zIndexOffset: 1000
        }).addTo(map);
        
        if (isFirstLoad.current && businesses.length === 0) {
            map.flyTo([userLocation.latitude, userLocation.longitude], 14, { duration: 1.5 });
            isFirstLoad.current = false;
        }
    }
  }, [userLocation]);

  // Handle Itinerary Visualization
  useEffect(() => {
      if (!mapInstanceRef.current || !itineraryLayerRef.current) return;
      
      const layerGroup = itineraryLayerRef.current;
      layerGroup.clearLayers();

      if (!activeItinerary || activeItinerary.items.length === 0) return;

      const waypoints: any[] = [];
      const latLngs: any[] = [];

      activeItinerary.items.forEach((item, index) => {
          if (item.business?.location) {
              const latlng = [item.business.location.latitude, item.business.location.longitude];
              latLngs.push(latlng);
              
              // Waypoint Marker
              const icon = L.divIcon({
                  className: 'custom-div-icon',
                  html: `
                    <div class="relative group">
                        <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-primary px-2 py-0.5 rounded-sm text-[8px] font-mono text-primary whitespace-nowrap shadow-lg z-50">
                            WP-0${index + 1} // ${item.timeOffset}
                        </div>
                        <div class="w-6 h-6 bg-black border-2 border-primary flex items-center justify-center font-mono text-[10px] font-bold text-white shadow-[0_0_15px_rgba(249,115,22,0.6)]">
                            ${index + 1}
                        </div>
                        <div class="absolute top-6 left-1/2 -translate-x-1/2 h-4 w-px bg-primary/50"></div>
                    </div>
                  `,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
              });

              L.marker(latlng, { icon, zIndexOffset: 3000 }).addTo(layerGroup);
              waypoints.push(latlng);
          }
      });

      if (latLngs.length > 1) {
          // Tactical Flight Path Line
          L.polyline(latLngs, {
              color: '#f97316',
              weight: 2,
              opacity: 0.8,
              dashArray: '5, 10',
              lineCap: 'square'
          }).addTo(layerGroup);
          
          // Fit bounds to show entire route
          mapInstanceRef.current.fitBounds(L.latLngBounds(latLngs), { padding: [100, 100] });
      }

  }, [activeItinerary]);

  // Sync Business Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    Object.keys(markersRef.current).forEach(id => {
       if (!businesses.find(b => b.id === id)) {
           markersRef.current[id].remove();
           delete markersRef.current[id];
       }
    });

    businesses.forEach(b => {
        if (!b.location) return;

        // Skip markers if they are part of the active itinerary to avoid clutter (optional, but cleaner)
        // For now we keep them but maybe dim them?

        const isSelected = selectedId === b.id;
        const isHovered = hoveredId === b.id;
        const isInItinerary = activeItinerary?.items.some(i => i.business?.id === b.id);
        
        const createIcon = (selected: boolean, hovered: boolean, isRoute: boolean) => {
            const size = selected ? 40 : (hovered ? 30 : 16);
            
            let html = '';
            if (selected) {
                html = `
                  <div class="relative flex items-center justify-center w-full h-full transition-all duration-300">
                    <div class="absolute inset-0 border-2 border-primary rounded-full animate-[spin_4s_linear_infinite] opacity-50"></div>
                    <div class="absolute inset-1 border border-white rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
                    <div class="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_white]"></div>
                  </div>
                `;
            } else if (hovered) {
                html = `
                  <div class="relative flex items-center justify-center w-full h-full transition-all duration-300">
                     <div class="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                     <div class="w-2.5 h-2.5 bg-primary rounded-full border border-black shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                     <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/95 px-3 py-1.5 rounded-sm text-[10px] text-white font-mono whitespace-nowrap border border-primary/30 z-[3000] shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                        <span class="text-primary mr-2">⟫</span>${b.name}
                     </div>
                  </div>
                `;
            } else if (isRoute) {
                // Dim business marker if it has a route marker on top
                html = `<div class="w-2 h-2 bg-zinc-800 rounded-full opacity-0"></div>`;
            } else {
                html = `
                  <div class="w-full h-full bg-zinc-800 rounded-full border border-zinc-600 hover:bg-zinc-700 hover:border-primary/50 transition-all shadow-lg flex items-center justify-center">
                    <div class="w-1 h-1 bg-zinc-400 rounded-full"></div>
                  </div>
                `;
            }

            return L.divIcon({
                className: 'custom-div-icon',
                html: html,
                iconSize: [size, size],
                iconAnchor: [size/2, size/2]
            });
        };

        if (markersRef.current[b.id]) {
            const marker = markersRef.current[b.id];
            marker.setIcon(createIcon(isSelected, isHovered, !!isInItinerary));
            marker.setZIndexOffset(isSelected ? 2000 : (isHovered ? 1500 : 100));
        } else {
            const marker = L.marker([b.location.latitude, b.location.longitude], {
                icon: createIcon(isSelected, isHovered, !!isInItinerary)
            }).addTo(map);

            marker.on('click', () => onSelect(b.id));
            marker.on('mouseover', () => setHoveredId(b.id));
            marker.on('mouseout', () => setHoveredId(null));

            markersRef.current[b.id] = marker;
        }
    });

  }, [businesses, selectedId, hoveredId, onSelect, setHoveredId, activeItinerary]);

  // Fit Bounds Logic (only if no itinerary active)
  useEffect(() => {
      if (!mapInstanceRef.current || businesses.length === 0) return;
      if (selectedId || activeItinerary) return;

      const map = mapInstanceRef.current;
      const bounds = L.latLngBounds([]);
      
      if (userLocation) {
          bounds.extend([userLocation.latitude, userLocation.longitude]);
      }
      
      businesses.forEach(b => {
          if (b.location) bounds.extend([b.location.latitude, b.location.longitude]);
      });

      if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [80, 80], maxZoom: 16, animate: true });
      }

  }, [businesses, userLocation, selectedId]);

  // Fly to selected business
  useEffect(() => {
      if (!selectedId || !mapInstanceRef.current) return;
      const b = businesses.find(bz => bz.id === selectedId);
      if (b && b.location) {
          mapInstanceRef.current.flyTo([b.location.latitude, b.location.longitude], 16, {
              duration: 1.5,
              easeLinearity: 0.25
          });
      }
  }, [selectedId, businesses]);

  const handleRecenter = () => {
      if (userLocation && mapInstanceRef.current) {
           mapInstanceRef.current.flyTo([userLocation.latitude, userLocation.longitude], 15, { duration: 1 });
      }
  };

  const handleSearchThisArea = () => {
      if (onRescan && mapCenter) {
          onRescan(mapCenter);
      }
  };

  const handleZoom = (direction: 'in' | 'out') => {
      if (mapInstanceRef.current) {
          direction === 'in' ? mapInstanceRef.current.zoomIn() : mapInstanceRef.current.zoomOut();
      }
  };

  return (
    <div className="relative h-full w-full bg-[#09090b]">
        <div ref={mapRef} className="h-full w-full z-10 outline-none" />
        
        {/* Central Targeting Reticle */}
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center opacity-30">
            <div className="w-12 h-12 border border-white/50 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
            </div>
            <div className="absolute w-20 h-[1px] bg-white/30"></div>
            <div className="absolute h-20 w-[1px] bg-white/30"></div>
        </div>

        {/* Tactical Overlay Grid */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-10" 
             style={{ 
                 backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`, 
                 backgroundSize: '100px 100px' 
             }}>
        </div>
        
        {/* Active Mission HUD */}
        {activeItinerary && (
             <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-black/90 border-t-2 border-primary border-x border-b border-zinc-800 px-6 py-2 shadow-[0_0_30px_rgba(249,115,22,0.3)] flex flex-col items-center">
                 <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">ACTIVE MISSION</div>
                 <div className="text-sm font-bold text-white uppercase tracking-tight">{activeItinerary.title}</div>
                 <div className="flex gap-4 mt-1 text-[9px] font-mono text-primary">
                     <span>{activeItinerary.items.length} WAYPOINTS</span>
                     <span>EST. TIME: 4H</span>
                 </div>
             </div>
        )}
        
        {/* Search Area Button */}
        {!activeItinerary && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 transition-opacity">
                <button 
                    onClick={handleSearchThisArea}
                    className="bg-black/80 backdrop-blur-md border border-primary/40 hover:border-primary text-primary px-4 py-2 rounded-sm font-mono text-[10px] tracking-widest shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all hover:bg-primary/10 flex items-center gap-2 group clip-path-polygon"
                >
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    SEARCH_SECTOR
                </button>
            </div>
        )}

        {/* Top Right HUD: Coordinates & Rescan */}
        <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2 pointer-events-none">
            {mapCenter && (
                <div className="text-[9px] font-mono text-primary bg-black/90 px-3 py-1.5 border border-zinc-800 backdrop-blur-md flex flex-col items-end gap-0.5">
                    <span className="text-zinc-500 text-[8px] uppercase tracking-widest">RETICLE_COORDS</span>
                    <div>
                        {Math.abs(mapCenter.latitude).toFixed(4)}°N <span className="text-zinc-700 mx-1">/</span> {Math.abs(mapCenter.longitude).toFixed(4)}°W
                    </div>
                </div>
            )}
            
            <div className="flex gap-1 pointer-events-auto mt-2">
                <button 
                    onClick={handleRecenter}
                    className="w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-700 hover:border-white hover:bg-zinc-800 text-white transition-all shadow-lg"
                    title="Recenter Map"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
            </div>
        </div>

        {/* Bottom Right: Zoom Controls */}
        <div className="absolute bottom-8 right-8 z-30 flex flex-col gap-1">
             <button 
                onClick={() => handleZoom('in')}
                className="w-10 h-10 bg-black/80 backdrop-blur border border-zinc-700 hover:border-primary text-zinc-300 hover:text-primary transition-all flex items-center justify-center shadow-lg"
             >
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
             </button>
             <button 
                onClick={() => handleZoom('out')}
                className="w-10 h-10 bg-black/80 backdrop-blur border border-zinc-700 hover:border-primary text-zinc-300 hover:text-primary transition-all flex items-center justify-center shadow-lg"
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
             </div>
        </div>
    </div>
  );
};
