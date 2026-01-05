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
      <div className="bg-green-900/10 border border-green-500/20 rounded p-6 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(34,197,94,0.5)]">
           <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-green-400 font-bold font-mono tracking-widest text-sm mb-1">CONFIRMED</h3>
        <p className="text-zinc-400 text-xs">Table for {guests} at {selectedSlot}</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded p-4">
      <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest">RESERVE A TABLE</h3>
          <div className="flex items-center gap-2 bg-zinc-800 rounded px-2 py-1">
             <button 
                onClick={() => setGuests(Math.max(1, guests - 1))}
                className="text-zinc-400 hover:text-white"
             >-</button>
             <span className="text-xs font-mono text-white w-4 text-center">{guests}</span>
             <button 
                 onClick={() => setGuests(Math.min(10, guests + 1))}
                 className="text-zinc-400 hover:text-white"
             >+</button>
             <span className="text-[10px] text-zinc-500 ml-1">PPL</span>
          </div>
      </div>

      <div className="mb-4">
         <p className="text-[10px] text-zinc-500 mb-2 font-mono">AVAILABLE TODAY</p>
         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {slots.map((slot, idx) => (
                <button
                   key={idx}
                   disabled={!slot.available}
                   onClick={() => setSelectedSlot(slot.time)}
                   className={`
                      px-3 py-2 rounded text-xs font-mono transition-all duration-200 whitespace-nowrap border
                      ${!slot.available 
                          ? 'opacity-30 cursor-not-allowed border-transparent bg-zinc-900 text-zinc-500 line-through' 
                          : selectedSlot === slot.time
                              ? 'bg-primary text-black border-primary shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                              : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600'}
                   `}
                >
                   {slot.time}
                </button>
            ))}
         </div>
      </div>

      <button
         onClick={handleBook}
         disabled={!selectedSlot || isProcessing}
         className={`
            w-full py-3 rounded text-xs font-bold font-mono tracking-wider transition-all
            ${!selectedSlot 
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-zinc-200'}
         `}
      >
         {isProcessing ? 'PROCESSING...' : selectedSlot ? `CONFIRM ${selectedSlot}` : 'SELECT A TIME'}
      </button>
    </div>
  );
};