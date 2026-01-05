
import React, { useEffect, useRef } from 'react';
import { Business, Coordinates } from '../../types';

// Declare Leaflet global
declare const L: any;

interface RealMapProps {
  userLocation: Coordinates | null;
  businesses: Business[];
  onSelect: (id: string) => void;
  selectedId: string | null;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onRescan?: () => void;
}

export const RealMap: React.FC<RealMapProps> = ({
  userLocation,
  businesses,
  onSelect,
  selectedId,
  hoveredId,
  setHoveredId,
  onRescan
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const userMarkerRef = useRef<any>(null);
  const isFirstLoad = useRef(true);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Default to SF if no user location yet, will fly to user later
    const defaultCenter = userLocation ? [userLocation.latitude, userLocation.longitude] : [37.7749, -122.4194];
    const initialZoom = 13;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      center: defaultCenter,
      zoom: initialZoom,
      renderer: L.canvas()
    });

    // CartoDB Dark Matter Tiles (Free, Dark Mode)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      subdomains: 'abcd',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Attribution
    L.control.attribution({ position: 'bottomleft', prefix: false }).addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>').addTo(map);

    mapInstanceRef.current = map;

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
        
        // Initial fly to user if just loaded
        if (isFirstLoad.current && businesses.length === 0) {
            map.flyTo([userLocation.latitude, userLocation.longitude], 14, { duration: 1.5 });
            isFirstLoad.current = false;
        }
    }
  }, [userLocation]);

  // Sync Business Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove old markers that are not in current list
    Object.keys(markersRef.current).forEach(id => {
       if (!businesses.find(b => b.id === id)) {
           markersRef.current[id].remove();
           delete markersRef.current[id];
       }
    });

    businesses.forEach(b => {
        if (!b.location) return;

        const isSelected = selectedId === b.id;
        const isHovered = hoveredId === b.id;
        
        const createIcon = (selected: boolean, hovered: boolean) => {
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
                     <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 px-3 py-1 rounded text-[10px] text-white font-mono whitespace-nowrap border border-zinc-700 pointer-events-none z-50 shadow-xl">
                        ${b.name}
                     </div>
                  </div>
                `;
            } else {
                html = `
                  <div class="w-full h-full bg-zinc-800 rounded-full border border-zinc-500 hover:bg-zinc-600 transition-all shadow-lg"></div>
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
            // Update existing marker icon state
            const marker = markersRef.current[b.id];
            marker.setIcon(createIcon(isSelected, isHovered));
            marker.setZIndexOffset(isSelected ? 2000 : (isHovered ? 1500 : 100));
        } else {
            // Create new
            const marker = L.marker([b.location.latitude, b.location.longitude], {
                icon: createIcon(isSelected, isHovered)
            }).addTo(map);

            marker.on('click', () => {
                onSelect(b.id);
            });
            marker.on('mouseover', () => {
                setHoveredId(b.id);
            });
            marker.on('mouseout', () => {
                setHoveredId(null);
            });

            markersRef.current[b.id] = marker;
        }
    });

  }, [businesses, selectedId, hoveredId, onSelect, setHoveredId]);

  // Fit Bounds Logic
  useEffect(() => {
      if (!mapInstanceRef.current || businesses.length === 0) return;
      if (selectedId) return;

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

  return (
    <div className="relative h-full w-full bg-[#09090b]">
        <div ref={mapRef} className="h-full w-full z-10 outline-none" />
        
        {/* Tactical Overlay Grid */}
        <div className="absolute inset-0 pointer-events-none z-20 opacity-20" 
             style={{ 
                 backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`, 
                 backgroundSize: '100px 100px' 
             }}>
        </div>
        
        {/* Corner HUD */}
        <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2 pointer-events-none">
            <div className="text-[10px] font-mono text-zinc-500 bg-black/80 px-2 py-1 rounded border border-zinc-800 backdrop-blur-md">
                SATELLITE UPLINK: ACTIVE
            </div>
            {userLocation && (
                <div className="text-[10px] font-mono text-primary bg-black/80 px-2 py-1 rounded border border-zinc-800 backdrop-blur-md">
                    LAT: {userLocation.latitude.toFixed(4)} <span className="text-zinc-600">|</span> LNG: {userLocation.longitude.toFixed(4)}
                </div>
            )}
            
            <div className="flex gap-2 pointer-events-auto">
                {onRescan && (
                    <button 
                        onClick={onRescan}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 hover:border-primary p-2 rounded transition-all shadow-lg group flex items-center gap-2"
                        title="Re-Scan Sector"
                    >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:animate-spin"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                         <span className="text-[10px] font-mono hidden md:inline">SCAN</span>
                    </button>
                )}
                
                <button 
                    onClick={handleRecenter}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 hover:border-white p-2 rounded transition-all shadow-lg group"
                    title="Recenter Map"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="8" x2="12" y2="2"></line><line x1="12" y1="16" x2="12" y2="22"></line><line x1="8" y1="12" x2="2" y2="12"></line><line x1="16" y1="12" x2="22" y2="12"></line></svg>
                </button>
            </div>
        </div>
    </div>
  );
};
