
import React, { useEffect, useRef, useState } from 'react';
import { Business, Coordinates, Itinerary, WeatherState } from '../../types';
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
  weather: WeatherState;
}

export const RealMap: React.FC<RealMapProps> = ({
  userLocation,
  businesses,
  onSelect,
  selectedId,
  hoveredId,
  setHoveredId,
  onRescan,
  activeItinerary,
  weather
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  
  // Local View State for UI
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(null);
  const [pitch, setPitch] = useState(45);
  const [bearing, setBearing] = useState(-15);
  
  // Flyover State
  const [isFlying, setIsFlying] = useState(false);
  const flyInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Inject Weather Animation Styles
  useEffect(() => {
      const styleId = 'map-weather-fx';
      if (document.getElementById(styleId)) return;

      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @keyframes rain-fall {
            0% { background-position: 0 0; }
            100% { background-position: 0 100vh; }
        }
        .rain-near {
            background-image: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.25));
            background-size: 1px 60px;
            animation: rain-fall 0.3s linear infinite;
        }
        .rain-far {
            background-image: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.1));
            background-size: 1px 30px;
            animation: rain-fall 0.5s linear infinite;
        }
        
        @keyframes fog-drift {
            0% { background-position: 0 0; }
            100% { background-position: 500px 0; }
        }
        .fog-overlay {
            background-image: url('https://grainy-gradients.vercel.app/noise.svg');
            opacity: 0.2;
            animation: fog-drift 60s linear infinite;
        }

        @keyframes pulse-glow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
        }
        .sun-flare {
            background: radial-gradient(circle at 80% 20%, rgba(255,200,100,0.4) 0%, transparent 60%);
            animation: pulse-glow 10s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);
      return () => {
          const el = document.getElementById(styleId);
          if(el) el.remove();
      };
  }, []);

  // --- Map Initialization ---
  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;
    
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
                   'raster-saturation': -0.9,
                   'raster-contrast': 0.1,
                   'raster-brightness-min': 0.05,
                   'raster-fade-duration': 0
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

    map.on('move', () => {
      const center = map.getCenter();
      setMapCenter({ latitude: center.lat, longitude: center.lng });
      setPitch(map.getPitch());
      setBearing(map.getBearing());
    });

    map.on('load', () => {
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
                'line-width': 12,
                'line-blur': 12,
                'line-opacity': 0.4
            }
        });
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

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
                  bearing: (idx * 45) % 360, 
                  speed: 0.8,
                  curve: 1.2,
                  essential: true
              });
              onSelect(item.business.id);
          }
      };

      flyToStep(0);
      step++;

      flyInterval.current = setInterval(() => {
          flyToStep(step);
          step++;
      }, 6000);
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

  const renderWeatherEffects = () => {
      switch(weather.condition) {
          case 'Rainy':
              return (
                  <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                      <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply transition-colors duration-1000"></div>
                      <div className="absolute inset-0 rain-near opacity-60 mix-blend-screen"></div>
                      <div className="absolute inset-0 rain-far opacity-40 mix-blend-screen" style={{ backgroundPosition: '50% 0' }}></div>
                      {/* Vignette for gloomy feel */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]"></div>
                  </div>
              );
          case 'Foggy':
              return (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                      <div className="absolute inset-0 bg-zinc-400/10 backdrop-blur-[3px] transition-all duration-1000"></div>
                      <div className="absolute inset-0 fog-overlay mix-blend-soft-light"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-zinc-900/80"></div>
                  </div>
              );
          case 'Night':
              return (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                      <div className="absolute inset-0 bg-blue-950/60 mix-blend-multiply transition-colors duration-1000"></div>
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
                  </div>
              );
          case 'Sunny':
              return (
                  <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                      <div className="absolute inset-0 bg-orange-500/5 mix-blend-overlay transition-colors duration-1000"></div>
                      <div className="absolute inset-0 sun-flare mix-blend-screen pointer-events-none"></div>
                      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.1),transparent)]"></div>
                  </div>
              );
          case 'Cloudy':
              return (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                      <div className="absolute inset-0 bg-zinc-500/20 mix-blend-multiply transition-colors duration-1000"></div>
                  </div>
              );
          default:
              return null;
      }
  };

  return (
    <div className="relative h-full w-full bg-[#09090b] group/map overflow-hidden">
        {/* Map Canvas */}
        <div ref={mapContainer} className="h-full w-full outline-none filter contrast-125 saturate-0" />
        
        {/* Atmospheric Overlays */}
        {renderWeatherEffects()}
        <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>
        <div className="absolute inset-0 pointer-events-none z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
        <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] opacity-20"></div>
        
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.7)]"></div>

        <MapUI 
            activeItinerary={activeItinerary || null}
            mapCenter={mapCenter}
            pitch={pitch}
            bearing={bearing}
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
