
import React, { useState } from 'react';
import { VibeState } from '../../types';

interface VibeSynthesizerProps {
    isOpen: boolean;
    onClose: () => void;
    onSynthesize: (vibes: VibeState) => void;
    isProcessing: boolean;
}

export const VibeSynthesizer: React.FC<VibeSynthesizerProps> = ({ isOpen, onClose, onSynthesize, isProcessing }) => {
    const [vibes, setVibes] = useState<VibeState>({
        entropy: 30,
        grit: 20,
        epoch: 50,
        obscurity: 60
    });

    const handleSliderChange = (key: keyof VibeState, value: number) => {
        setVibes(prev => ({ ...prev, [key]: value }));
    };

    if (!isOpen) return null;

    const renderSlider = (label: string, key: keyof VibeState, minLabel: string, maxLabel: string) => {
        const val = vibes[key];
        return (
            <div className="space-y-2 mb-6">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">{label}</label>
                    <span className="text-xs font-mono text-primary">{val}%</span>
                </div>
                <div className="relative h-6 flex items-center">
                    {/* Track */}
                    <div className="absolute inset-x-0 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-zinc-700 to-primary/80" 
                            style={{ width: `${val}%` }}
                        ></div>
                    </div>
                    {/* Input */}
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={val} 
                        onChange={(e) => handleSliderChange(key, parseInt(e.target.value))}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                    {/* Thumb visual */}
                    <div 
                        className="absolute w-4 h-4 bg-zinc-200 border-2 border-primary rounded-sm shadow-[0_0_10px_rgba(249,115,22,0.5)] pointer-events-none transition-all duration-75"
                        style={{ left: `calc(${val}% - 8px)` }}
                    ></div>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-zinc-600 uppercase">
                    <span>{minLabel}</span>
                    <span>{maxLabel}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-[#09090b] border-l border-zinc-800 shadow-2xl z-[100] flex flex-col animate-in slide-in-from-right duration-300">
             {/* Header */}
             <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><path d="M12 3v18"></path><path d="M6 8v8"></path><path d="M18 8v8"></path><path d="M2 12h20"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold tracking-[0.1em] text-white font-mono uppercase">VIBE SYNTHESIZER</h2>
                        <div className="text-[9px] text-zinc-500 font-mono tracking-widest">PARAMETRIC SEARCH ENGINE</div>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-900 rounded transition-colors"
                >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>

            {/* Controls */}
            <div className="flex-1 p-8 overflow-y-auto relative">
                
                <div className="mb-8 p-4 bg-zinc-900/50 rounded border border-zinc-800">
                    <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                        <span className="text-primary font-bold">What is this?</span><br/>
                        Adjust the sliders below to fine-tune your search query based on abstract qualities. The AI will translate these parameters into specific search terms.
                    </p>
                </div>

                <div className="relative z-10 space-y-8">
                    {renderSlider('Entropy', 'entropy', 'Serene', 'Chaotic')}
                    {renderSlider('Grit', 'grit', 'Polished', 'Raw')}
                    {renderSlider('Epoch', 'epoch', 'Historic', 'Future')}
                    {renderSlider('Obscurity', 'obscurity', 'Mainstream', 'Secret')}
                </div>
            </div>

            {/* Action Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur">
                <button
                    onClick={() => onSynthesize(vibes)}
                    disabled={isProcessing}
                    className={`
                        w-full py-4 bg-primary hover:bg-orange-500 text-black font-bold font-mono uppercase tracking-[0.2em] transition-all
                        flex items-center justify-center gap-3 relative overflow-hidden group
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    {isProcessing ? (
                        <>
                            <span className="w-2 h-2 bg-black rounded-full animate-bounce"></span>
                            SYNTHESIZING...
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
                            GENERATE QUERY
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
