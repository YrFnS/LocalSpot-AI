
import React from 'react';
import { Business } from '../../types';

interface BusinessStatsGridProps {
  business: Business;
}

export const BusinessStatsGrid: React.FC<BusinessStatsGridProps> = ({ business }) => {
  const renderStars = (rating: number) => {
      const full = Math.floor(rating);
      const hasHalf = rating % 1 >= 0.5;
      return (
          <div className="flex justify-center gap-[1px] mt-1 h-1">
             {[...Array(5)].map((_, i) => (
                 <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < full ? 'bg-primary' : (i === full && hasHalf ? 'bg-primary/50' : 'bg-zinc-800')}`}></div>
             ))}
          </div>
      );
  };

  const renderPrice = (level: string = '$') => {
      const max = 4;
      const current = level.length;
      return (
          <div className="flex justify-center gap-[2px] mt-1 font-mono text-[9px]">
             {[...Array(max)].map((_, i) => (
                 <span key={i} className={i < current ? 'text-white' : 'text-zinc-800'}>$</span>
             ))}
          </div>
      );
  };

  const renderDistance = (meters: number = 0) => {
      // Inverse logic: closer = more bars
      const km = meters / 1000;
      const strength = km < 1 ? 4 : (km < 5 ? 3 : (km < 10 ? 2 : 1));
      return (
          <div className="flex justify-center items-end gap-[2px] mt-1 h-2">
              {[1, 2, 3, 4].map((bar) => (
                  <div key={bar} className={`w-1 ${bar <= strength ? 'bg-white' : 'bg-zinc-800'}`} style={{ height: `${bar * 25}%` }}></div>
              ))}
          </div>
      );
  };

  return (
    <div className="grid grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 shadow-sm">
        {/* Rating Block */}
        <div className="bg-[#09090b] p-3 text-center group hover:bg-zinc-900 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
            </div>
            <div className="text-[8px] text-zinc-500 font-mono uppercase mb-1 tracking-wider">RATING</div>
            <div className="text-xl font-bold text-white group-hover:text-primary transition-colors leading-none">
                {business.rating?.toFixed(1) || 'N/A'}
            </div>
            {business.rating && renderStars(business.rating)}
        </div>

        {/* Cost Block */}
        <div className="bg-[#09090b] p-3 text-center group hover:bg-zinc-900 transition-colors">
            <div className="text-[8px] text-zinc-500 font-mono uppercase mb-1 tracking-wider">COST</div>
            <div className="text-xl font-bold text-white leading-none">{business.priceLevel || '-'}</div>
            {renderPrice(business.priceLevel)}
        </div>

        {/* Proximity Block */}
        <div className="bg-[#09090b] p-3 text-center group hover:bg-zinc-900 transition-colors">
            <div className="text-[8px] text-zinc-500 font-mono uppercase mb-1 tracking-wider">PROXIMITY</div>
            <div className="text-xl font-bold text-white leading-none">
                {business.distanceMeters ? `${(business.distanceMeters/1000).toFixed(1)}k` : '-'}
            </div>
            {renderDistance(business.distanceMeters)}
        </div>
    </div>
  );
};
