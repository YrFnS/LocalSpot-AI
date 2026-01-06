
import React, { useState } from 'react';
import { BookingSlot } from '../../types';

interface BookingWidgetProps {
  slots: BookingSlot[];
  onBook: (slot: BookingSlot, guests: number) => void;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({ slots, onBook }) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [step, setStep] = useState<'SELECT' | 'CONFIRM' | 'SUCCESS'>('SELECT');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBook = async () => {
    if (!selectedSlot) return;
    
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setStep('SUCCESS');
    
    const slot = slots.find(s => s.time === selectedSlot);
    if (slot) onBook(slot, guests);
  };

  if (step === 'SUCCESS') {
    return (
      <div className="bg-green-950/20 border border-green-500/30 p-6 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(34,197,94,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]"></div>
        <div className="w-16 h-16 border-2 border-green-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(34,197,94,0.4)] relative">
            <div className="absolute inset-1 border border-green-500/50 rounded-full animate-ping"></div>
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-green-400 font-bold font-mono tracking-[0.2em] text-sm mb-2">ACCESS GRANTED</h3>
        <div className="h-px w-12 bg-green-500/50 mb-2"></div>
        <p className="text-green-300/70 text-xs font-mono uppercase">
            Slot Confirmed: {selectedSlot}<br/>
            Pax: {guests} Unit{guests > 1 ? 's' : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#09090b] border border-zinc-800 p-0 relative overflow-hidden group">
      {/* Header */}
      <div className="bg-zinc-900/50 p-3 border-b border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-sm animate-pulse"></div>
              <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">RESERVATION PROTOCOL</h3>
          </div>
          
          {/* Guest Counter */}
          <div className="flex items-center gap-1 border border-zinc-700 bg-zinc-800 rounded-sm overflow-hidden">
             <button 
                onClick={() => setGuests(Math.max(1, guests - 1))}
                className="px-2 py-0.5 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors border-r border-zinc-700"
             >-</button>
             <span className="text-[10px] font-mono text-white w-8 text-center bg-zinc-900 py-0.5">{guests.toString().padStart(2, '0')}</span>
             <button 
                 onClick={() => setGuests(Math.min(10, guests + 1))}
                 className="px-2 py-0.5 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors border-l border-zinc-700"
             >+</button>
          </div>
      </div>

      <div className="p-4">
         <div className="flex justify-between items-end mb-3">
             <span className="text-[9px] text-zinc-600 font-mono uppercase">AVAILABLE VECTORS</span>
             <span className="text-[9px] text-primary font-mono animate-pulse">LIVE</span>
         </div>
         
         <div className="grid grid-cols-4 gap-2 mb-6">
            {slots.map((slot, idx) => (
                <button
                   key={idx}
                   disabled={!slot.available}
                   onClick={() => setSelectedSlot(slot.time)}
                   className={`
                      relative px-1 py-2 text-[10px] font-mono transition-all duration-200 border
                      ${!slot.available 
                          ? 'opacity-20 cursor-not-allowed border-transparent bg-zinc-900 text-zinc-500 decoration-zinc-600 line-through' 
                          : selectedSlot === slot.time
                              ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(249,115,22,0.4)] font-bold'
                              : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-500 hover:text-white hover:bg-zinc-800'}
                   `}
                >
                   {slot.time}
                   {selectedSlot === slot.time && (
                       <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-white shadow-sm"></div>
                   )}
                </button>
            ))}
         </div>

        <button
            onClick={handleBook}
            disabled={!selectedSlot || isProcessing}
            className={`
                w-full py-3 relative overflow-hidden group/btn
                ${!selectedSlot 
                    ? 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-zinc-200'}
            `}
        >
            <div className={`text-[10px] font-bold font-mono tracking-[0.2em] uppercase flex items-center justify-center gap-2 relative z-10`}>
                {isProcessing ? (
                    <>
                        <span className="w-2 h-2 bg-black rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-black rounded-full animate-bounce delay-75"></span>
                        <span className="w-2 h-2 bg-black rounded-full animate-bounce delay-150"></span>
                    </>
                ) : selectedSlot ? (
                    <>
                        <span>INITIATE BOOKING</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </>
                ) : (
                    'SELECT TIME SLOT'
                )}
            </div>
            
            {/* Scanline effect on button */}
            {selectedSlot && !isProcessing && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out"></div>
            )}
        </button>
      </div>
      
      {/* Decorative corners */}
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-zinc-600"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-zinc-600"></div>
    </div>
  );
};
