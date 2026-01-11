
import React from 'react';
import { Business } from '../../types';

interface BusinessStatsGridProps {
  business: Business;
}

export const BusinessStatsGrid: React.FC<BusinessStatsGridProps> = ({ business }) => {
  return (
    <div className="grid grid-cols-3 gap-px bg-zinc-800 border border-zinc-800">
        <div className="bg-[#09090b] p-3 text-center group hover:bg-zinc-900 transition-colors">
            <div className="text-[9px] text-zinc-500 font-mono uppercase mb-1">RATING</div>
            <div className="text-xl font-bold text-white group-hover:text-primary transition-colors">{business.rating?.toFixed(1) || 'N/A'}</div>
        </div>
        <div className="bg-[#09090b] p-3 text-center group hover:bg-zinc-900 transition-colors">
            <div className="text-[9px] text-zinc-500 font-mono uppercase mb-1">COST</div>
            <div className="text-xl font-bold text-white">{business.priceLevel || '-'}</div>
        </div>
        <div className="bg-[#09090b] p-3 text-center group hover:bg-zinc-900 transition-colors">
            <div className="text-[9px] text-zinc-500 font-mono uppercase mb-1">PROXIMITY</div>
            <div className="text-xl font-bold text-white">{business.distanceMeters ? `${(business.distanceMeters/1000).toFixed(1)}k` : '-'}</div>
        </div>
    </div>
  );
};
