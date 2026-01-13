
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
    const [bearing, setBearing] = useState(-15);

    // Flyover State
    const [isFlying, setIsFlying] = useState(false);
    const flyInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // Inject Weather Animation Styles - REMOVED

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
                'osm': {
                    type: 'raster',
                    tiles: [
                        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    ],
                    tileSize: 256,
                    attribution: '&copy; OpenStreetMap Contributors'
                }
            },
            layers: [
                {
                    id: 'osm-tiles',
                    type: 'raster',
                    source: 'osm',
                    minzoom: 0,
                    maxzoom: 19
                }
            ]
        };

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: mapStyle as any,
            center: defaultCenter,
            zoom: 14,
            pitch: 0,
            bearing: 0,
            attributionControl: false
        });

        map.on('move', () => {
            const center = map.getCenter();
            setMapCenter({ latitude: center.lat, longitude: center.lng });
            setPitch(map.getPitch());
            setBearing(map.getBearing());
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

    return (
        <div className="relative h-full w-full bg-[#09090b] group/map overflow-hidden">
            {/* Map Canvas */}
            <div ref={mapContainer} className="h-full w-full outline-none filter contrast-125 saturate-0" />

            {/* Atmospheric Overlays */}

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
