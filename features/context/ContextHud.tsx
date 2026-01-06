
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

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const conditions: WeatherCondition[] = ['Sunny', 'Rainy', 'Cloudy', 'Foggy', 'Night'];

  const cycleWeather = () => {
      const currentIndex = conditions.indexOf(weather.condition);
      const nextIndex = (currentIndex + 1) % conditions.length;
      onWeatherToggle(conditions[nextIndex]);
  };

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-zinc-950/40 border-l border-r border-zinc-800 backdrop-blur-sm h-full select-none">
        {/* Time Module */}
        <div className="flex flex-col items-end">
            <span className="text-xs font-mono font-bold text-zinc-300">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">
                LOCAL TIME
            </span>
        </div>

        <div className="w-[1px] h-6 bg-zinc-800"></div>

        {/* Location Module */}
        <div className="hidden md:flex flex-col">
             <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-tight truncate max-w-[120px]">
                {locationName}
             </span>
             <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">
                SECTOR
             </span>
        </div>

        <div className="hidden md:block w-[1px] h-6 bg-zinc-800"></div>

        {/* Weather Module */}
        <button 
            onClick={cycleWeather}
            className="flex items-center gap-3 group hover:bg-zinc-900/50 rounded px-2 py-1 transition-colors"
            title="Click to Simulate Weather Conditions"
        >
            <span className="text-xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-300">
                {getIconForCondition(weather.condition)}
            </span>
            <div className="flex flex-col items-start">
                <span className={`text-[10px] font-mono font-bold uppercase transition-colors ${weather.condition === 'Rainy' ? 'text-blue-400' : (weather.condition === 'Sunny' ? 'text-orange-400' : 'text-zinc-300')}`}>
                    {weather.condition} • {weather.temperature}°
                </span>
            </div>
        </button>
    </div>
  );
};
