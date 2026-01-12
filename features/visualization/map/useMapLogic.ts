
import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { Business, Coordinates, Itinerary } from '../../../types';

/**
 * Manages the User Location Marker (The pulsing dot)
 */
export const useUserMarker = (
    mapInstance: maplibregl.Map | null, 
    userLocation: Coordinates | null
) => {
    const userMarkerRef = useRef<maplibregl.Marker | null>(null);

    useEffect(() => {
        if (!mapInstance || !maplibregl.Marker) return;
        
        // If userLocation is null, we can't place the marker yet.
        // But if we had one and lost it (rare), we should remove it.
        if (!userLocation) {
            if (userMarkerRef.current) {
                userMarkerRef.current.remove();
                userMarkerRef.current = null;
            }
            return;
        }
        
        // If marker exists, just update position
        if (userMarkerRef.current) {
            userMarkerRef.current.setLngLat([userLocation.longitude, userLocation.latitude]);
            return;
        }

        // Create new marker
        const el = document.createElement('div');
        el.className = 'user-marker';
        el.innerHTML = `
          <div class="relative flex items-center justify-center w-6 h-6">
             <div class="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
             <div class="relative w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_#f97316]"></div>
          </div>
        `;

        userMarkerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat([userLocation.longitude, userLocation.latitude])
            .addTo(mapInstance);

    }, [mapInstance, userLocation]);
};

/**
 * Manages Business Markers on the map
 */
export const useBusinessMarkers = (
    mapInstance: maplibregl.Map | null,
    businesses: Business[],
    selectedId: string | null,
    hoveredId: string | null,
    onSelect: (id: string) => void,
    setHoveredId: (id: string | null) => void,
    activeItinerary?: Itinerary | null
) => {
    const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});

    useEffect(() => {
        if (!mapInstance || !maplibregl.Marker) return;

        // Cleanup removed businesses
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
            const isInItinerary = activeItinerary?.items.some(i => i.business?.id === b.id);
            const markerKey = b.id;

            // Initialize Marker if needed
            let el = document.getElementById(`marker-${b.id}`);
            if (!el) {
                el = document.createElement('div');
                el.id = `marker-${b.id}`;
                el.className = 'marker-container cursor-pointer transition-all duration-300 ease-out will-change-transform';
                el.onclick = (e) => {
                    e.stopPropagation();
                    onSelect(b.id);
                };
                el.onmouseenter = () => setHoveredId(b.id);
                el.onmouseleave = () => setHoveredId(null);
                
                markersRef.current[markerKey] = new maplibregl.Marker({ element: el, anchor: 'center' })
                    .setLngLat([b.location.longitude, b.location.latitude])
                    .addTo(mapInstance);
            }

            // Update Style & HTML
            const size = isSelected ? 48 : (isHovered ? 36 : 24);
            const zIndex = isSelected ? 50 : (isHovered ? 40 : 10);
            el.style.zIndex = zIndex.toString();
            el.style.width = `${size}px`;
            el.style.height = `${size}px`;

            if (isSelected) {
                el.innerHTML = `
                    <div class="relative w-full h-full flex items-center justify-center">
                        <div class="absolute inset-0 border-2 border-primary rounded-full animate-[spin_4s_linear_infinite] opacity-50"></div>
                        <div class="absolute inset-1 border border-white rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
                        <div class="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_white]"></div>
                        <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 border border-primary/50 px-2 py-0.5 text-[8px] font-mono text-primary uppercase tracking-widest shadow-lg">
                            TARGET LOCKED
                        </div>
                    </div>
                `;
            } else if (isHovered) {
                 el.innerHTML = `
                    <div class="relative w-full h-full flex items-center justify-center">
                        <div class="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                        <div class="w-3 h-3 bg-primary rounded-full border border-black shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                        <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 px-3 py-1 rounded-sm text-[10px] text-white font-mono whitespace-nowrap border border-primary/30 z-50">
                            ${b.name}
                        </div>
                    </div>
                 `;
            } else if (isInItinerary) {
                 const idx = activeItinerary?.items.findIndex(i => i.business?.id === b.id) ?? 0;
                 el.innerHTML = `
                     <div class="w-full h-full bg-black border-2 border-primary flex items-center justify-center font-mono text-[10px] font-bold text-primary shadow-[0_0_10px_rgba(249,115,22,0.4)]">
                        ${idx + 1}
                     </div>
                 `;
            } else {
                 el.innerHTML = `
                    <div class="w-full h-full bg-zinc-800 rounded-full border border-zinc-600 hover:border-white transition-colors shadow-lg flex items-center justify-center group-hover:scale-110">
                        <div class="w-1.5 h-1.5 bg-zinc-400 rounded-full"></div>
                    </div>
                 `;
            }
        });

    }, [mapInstance, businesses, selectedId, hoveredId, activeItinerary]);
};

/**
 * Manages the Itinerary Route Line
 */
export const useRouteLayer = (
    mapInstance: maplibregl.Map | null,
    activeItinerary?: Itinerary | null
) => {
    useEffect(() => {
        if (!mapInstance || !activeItinerary) return;
        
        const source = mapInstance.getSource('route') as any;
        if (!source) return;

        if (activeItinerary.items.length === 0) {
            source.setData({ type: 'FeatureCollection', features: [] });
            return;
        }

        const coords = activeItinerary.items
            .filter(i => i.business?.location)
            .map(i => [i.business!.location!.longitude, i.business!.location!.latitude]);

        const geoJson = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: coords
                    }
                }
            ]
        };

        source.setData(geoJson as any);

        // Fit bounds to route
        if (coords.length > 1) {
            const bounds = new maplibregl.LngLatBounds();
            coords.forEach(c => bounds.extend(c as [number, number]));
            mapInstance.fitBounds(bounds, { padding: 100, pitch: 40 });
        }

    }, [mapInstance, activeItinerary]);
};

/**
 * Manages Camera FlyTo operations
 */
export const useMapCamera = (
    mapInstance: maplibregl.Map | null,
    selectedId: string | null,
    businesses: Business[]
) => {
    useEffect(() => {
        if (selectedId && mapInstance) {
            const b = businesses.find(x => x.id === selectedId);
            if (b && b.location) {
                mapInstance.flyTo({
                    center: [b.location.longitude, b.location.latitude],
                    zoom: 16,
                    pitch: 60,
                    bearing: Math.random() * 40 - 20,
                    speed: 1.2,
                    curve: 1.5
                });
            }
        }
    }, [selectedId, mapInstance, businesses]);
};
