
import React, { useState, useEffect } from 'react';
import { WeatherState, WeatherCondition } from '../../types';
import { getIconForCondition } from '../../services/weatherService';

interface ContextHudProps {
  weather: WeatherState;
  onWeatherToggle: (condition: WeatherCondition) => void;
  locationName?: string;
}

export const ContextHud: React.FC<ContextHudProps> = ({ weather, onWeatherToggle, locationName = "San Francisco, CA" }) => {
  const [time, setTime] = useState(new Date());
  const [netStatus, setNetStatus] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    // Simulate network blink
    const netTimer = setInterval(() => setNetStatus(prev => !prev), 2000);
    return () => {
        clearInterval(timer);
        clearInterval(netTimer);
    };
  }, []);

  const conditions: WeatherCondition[] = ['Sunny', 'Rainy', 'Cloudy', 'Foggy', 'Night'];

  const cycleWeather = () => {
      const currentIndex = conditions.indexOf(weather.condition);
      const nextIndex = (currentIndex + 1) % conditions.length;
      onWeatherToggle(conditions[nextIndex]);
  };

  return (
    <div className="flex items-stretch gap-0 px-0 bg-black/20 border-l border-r border-zinc-800/50 backdrop-blur-sm h-full select-none text-[10px] font-mono group relative overflow-hidden">
        
        {/* Scan line overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>

        {/* Network Status */}
        <div className="flex items-center px-4 border-r border-zinc-800/50 gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${netStatus ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-green-900'} transition-colors duration-500`}></div>
            <span className="text-zinc-500 hidden xl:inline">NET_OK</span>
        </div>

        {/* Time Module */}
        <div className="flex flex-col justify-center px-4 border-r border-zinc-800/50 min-w-[90px]">
            <span className="font-bold text-zinc-300 leading-none">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-zinc-600 uppercase text-[8px] leading-none mt-1">
                SYS_LOCAL
            </span>
        </div>

        {/* Location Module - Marquee effect on hover? */}
        <div className="hidden md:flex flex-col justify-center px-4 border-r border-zinc-800/50 max-w-[200px] relative">
             <span className="font-bold text-zinc-400 uppercase truncate">
                {locationName}
             </span>
             <span className="text-zinc-600 uppercase text-[8px] leading-none mt-1 flex justify-between">
                <span>SECTOR_07</span>
                <span className="text-primary">GPS_LOCKED</span>
             </span>
        </div>

        {/* Weather Module - Interactive */}
        <button 
            onClick={cycleWeather}
            className="flex items-center gap-3 px-4 hover:bg-zinc-800/50 transition-colors relative"
            title="Cycle Environment Simulation"
        >
            <span className="text-lg filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                {getIconForCondition(weather.condition)}
            </span>
            <div className="flex flex-col items-start">
                <span className={`font-bold uppercase leading-none ${weather.condition === 'Rainy' ? 'text-blue-400' : (weather.condition === 'Sunny' ? 'text-orange-400' : 'text-zinc-300')}`}>
                    {weather.condition}
                </span>
                <span className="text-zinc-500 text-[9px] mt-0.5">
                    TEMP: {weather.temperature}°C
                </span>
            </div>
            
            {/* Interactive hint */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </button>
    </div>
  );
};
