
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
}

export const RealMap: React.FC<RealMapProps> = ({
  userLocation,
  businesses,
  onSelect,
  selectedId,
  hoveredId,
  setHoveredId
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const userMarkerRef = useRef<any>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const defaultCenter = [37.7749, -122.4194];
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

  // Sync User Location
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    const map = mapInstanceRef.current;

    const createPulseIcon = () => {
       return L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="relative flex items-center justify-center w-4 h-4">
              <span class="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
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
            interactive: false
        }).addTo(map);
        
        // Only pan to user if no businesses selected
        if (!selectedId && businesses.length === 0) {
            map.flyTo([userLocation.latitude, userLocation.longitude], 14, { duration: 1.5 });
        }
    }
  }, [userLocation]);

  // Sync Markers
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

    const bounds = L.latLngBounds([]);
    if (userLocation) bounds.extend([userLocation.latitude, userLocation.longitude]);

    businesses.forEach(b => {
        if (!b.location) return;

        bounds.extend([b.location.latitude, b.location.longitude]);

        const isSelected = selectedId === b.id;
        const isHovered = hoveredId === b.id;
        
        const createIcon = (selected: boolean, hovered: boolean) => {
            const size = selected ? 32 : (hovered ? 24 : 12);
            // Dynamic color/size based on state
            let html = '';
            
            if (selected) {
                html = `
                  <div class="relative flex items-center justify-center w-full h-full">
                    <div class="absolute inset-0 border border-white rounded-full animate-[spin_3s_linear_infinite]"></div>
                    <div class="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                `;
            } else if (hovered) {
                html = `
                  <div class="relative flex items-center justify-center w-full h-full">
                     <div class="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                     <div class="w-2 h-2 bg-white rounded-full border border-zinc-900"></div>
                     <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-black px-2 py-0.5 rounded text-[8px] text-white font-mono whitespace-nowrap border border-zinc-700 pointer-events-none">
                        ${b.name.substring(0, 15)}
                     </div>
                  </div>
                `;
            } else {
                html = `
                  <div class="w-full h-full bg-zinc-600 rounded-full border border-black hover:bg-zinc-400 transition-colors"></div>
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
            marker.setZIndexOffset(isSelected ? 1000 : (isHovered ? 500 : 0));
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

    // Fit bounds if businesses change significantly or first load
    // We avoid refitting on every small state change to keep map stable
    if (businesses.length > 0 && !selectedId) {
        // Simple debounce or check if bounds changed significantly could be added here
        // For now, only fit if we haven't manually moved much, or just rely on user navigation
        // Let's only fit on initial search results load
        // map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

  }, [businesses, selectedId, hoveredId]);

  // Fly to selected
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
        <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-1 pointer-events-none">
            <div className="text-[10px] font-mono text-zinc-500 bg-black/80 px-2 py-1 rounded border border-zinc-800">
                SATELLITE UPLINK: ACTIVE
            </div>
            <div className="text-[10px] font-mono text-primary bg-black/80 px-2 py-1 rounded border border-zinc-800">
                LAT: {userLocation?.latitude.toFixed(4)} // LNG: {userLocation?.longitude.toFixed(4)}
            </div>
        </div>
    </div>
  );
};
