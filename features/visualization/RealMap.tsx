
import React, { useEffect, useRef, useState } from 'react';
import { Business, Coordinates, Itinerary } from '../../types';
import * as maplibregl from 'maplibre-gl';
import { MapUI } from './map/MapUI';
import { 
    useBusinessMarkers, 
    useUserMarker, 
    useRouteLayer, 
    useMapCamera 
} from './map/useMapLogic';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  
  // Local View State for UI
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(null);
  const [pitch, setPitch] = useState(45);
  
  // Flyover State
  const [isFlying, setIsFlying] = useState(false);
  const flyInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Map Initialization ---
  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;
    
    // Safety check for maplibregl availability
    if (!maplibregl.Map) {
        console.error("MapLibre GL not loaded correctly");
        return;
    }

    const defaultCenter: [number, number] = userLocation ? [userLocation.longitude, userLocation.latitude] : [-122.4194, 37.7749];

    const mapStyle = {
        version: 8,
        sources: {
            'carto-dark': {
                type: 'raster',
                tiles: [
                    "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
                    "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
                    "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
                    "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"
                ],
                tileSize: 256,
                attribution: '&copy; OpenStreetMap &copy; CARTO'
            }
        },
        layers: [
            {
                id: 'base-tiles',
                type: 'raster',
                source: 'carto-dark',
                minzoom: 0,
                maxzoom: 22,
                paint: {
                   'raster-saturation': -0.8,
                   'raster-contrast': 0.2
                }
            }
        ]
    };

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle as any,
      center: defaultCenter,
      zoom: 14,
      pitch: 45,
      bearing: -15,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({
        visualizePitch: true,
        showCompass: true,
        showZoom: false
    }), 'bottom-right');

    map.on('move', () => {
      const center = map.getCenter();
      setMapCenter({ latitude: center.lat, longitude: center.lng });
      setPitch(map.getPitch());
    });

    map.on('load', () => {
        // Source/Layers setup
        map.addSource('route', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] }
        });

        map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
                'line-color': '#f97316',
                'line-width': 3,
                'line-dasharray': [2, 1],
                'line-opacity': 0.8
            }
        });
        
        map.addLayer({
            id: 'route-glow',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
                'line-color': '#f97316',
                'line-width': 10,
                'line-blur': 10,
                'line-opacity': 0.3
            }
        });
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []); // Run once on mount

  // --- Logic Hooks ---
  useUserMarker(mapInstance.current, userLocation);
  useBusinessMarkers(mapInstance.current, businesses, selectedId, hoveredId, onSelect, setHoveredId, activeItinerary);
  useRouteLayer(mapInstance.current, activeItinerary);
  useMapCamera(mapInstance.current, selectedId, businesses);

  // --- Flyover Logic ---
  const stopFlyover = () => {
      if (flyInterval.current) {
          clearInterval(flyInterval.current);
          flyInterval.current = null;
      }
      setIsFlying(false);
  };

  const startFlyover = () => {
      if (!mapInstance.current || !activeItinerary || activeItinerary.items.length === 0) return;
      
      setIsFlying(true);
      let step = 0;
      const items = activeItinerary.items;

      const flyToStep = (idx: number) => {
          if (idx >= items.length) {
              stopFlyover();
              return;
          }
          const item = items[idx];
          if (item.business?.location) {
              mapInstance.current?.flyTo({
                  center: [item.business.location.longitude, item.business.location.latitude],
                  zoom: 17,
                  pitch: 65,
                  bearing: (idx * 45) % 360, // Rotate viewing angle for each stop
                  speed: 0.8,
                  curve: 1.2,
                  essential: true
              });
              onSelect(item.business.id); // Open detail/select
          }
      };

      // Initial Fly
      flyToStep(0);
      step++;

      // Schedule next steps (Allow time for flight + viewing)
      flyInterval.current = setInterval(() => {
          flyToStep(step);
          step++;
      }, 6000); // 6 seconds per stop
  };

  // --- Handlers ---
  const handleZoom = (dir: 'in' | 'out') => {
      if (!mapInstance.current) return;
      dir === 'in' ? mapInstance.current.zoomIn() : mapInstance.current.zoomOut();
  };

  const handlePitch = () => {
       if (!mapInstance.current) return;
       const current = mapInstance.current.getPitch();
       mapInstance.current.easeTo({ pitch: current > 30 ? 0 : 60 });
  };

  const handleRecenter = () => {
      if (!mapInstance.current || !userLocation) return;
      mapInstance.current.flyTo({ 
          center: [userLocation.longitude, userLocation.latitude], 
          zoom: 14,
          pitch: 45,
          bearing: 0
      });
  };

  const handleSearchThisArea = () => {
    if (onRescan && mapCenter) {
        onRescan(mapCenter);
    }
  };

  return (
    <div className="relative h-full w-full bg-[#09090b] group/map">
        <div ref={mapContainer} className="h-full w-full outline-none" />
        
        <MapUI 
            activeItinerary={activeItinerary || null}
            mapCenter={mapCenter}
            pitch={pitch}
            userLocation={userLocation}
            onSearchThisArea={handleSearchThisArea}
            onRecenter={handleRecenter}
            onPitchToggle={handlePitch}
            onZoom={handleZoom}
            isFlying={isFlying}
            onToggleFlyover={isFlying ? stopFlyover : startFlyover}
        />
    </div>
  );
};
