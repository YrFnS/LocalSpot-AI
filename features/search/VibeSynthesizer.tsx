
import React, { useState, useEffect, useRef } from 'react';
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
    
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleSliderChange = (key: keyof VibeState, value: number) => {
        setVibes(prev => ({ ...prev, [key]: value }));
    };

    // Dynamic Waveform Visualization
    useEffect(() => {
        if (!isOpen || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frameId = 0;
        let time = 0;

        const render = () => {
            time += 0.05;
            const w = canvas.width;
            const h = canvas.height;
            const cy = h / 2;

            ctx.clearRect(0, 0, w, h);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#f97316'; // Primary
            ctx.beginPath();

            // Generate wave based on vibe parameters
            // Entropy = Noise/Jitter
            // Grit = Jaggedness
            // Epoch = Frequency
            // Obscurity = Amplitude variability

            const amplitude = 30 + (vibes.obscurity / 100) * 20;
            const frequency = 0.02 + (vibes.epoch / 100) * 0.08;
            const jitter = (vibes.entropy / 100) * 10;
            const jaggedness = (vibes.grit / 100);

            for (let x = 0; x < w; x++) {
                // Base Sine
                let y = cy + Math.sin(x * frequency + time) * amplitude;
                
                // Add Jitter (Entropy)
                y += (Math.random() - 0.5) * jitter;

                // Add Jaggedness (Grit) - triangular modulation
                if (jaggedness > 0) {
                     y += (Math.random() > 0.5 ? 1 : -1) * jaggedness * 5;
                }

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            
            ctx.stroke();

            // Gradient fill below
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.closePath();
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, 'rgba(249, 115, 22, 0.1)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fill();

            frameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(frameId);
    }, [isOpen, vibes]);

    if (!isOpen) return null;

    const renderSlider = (label: string, key: keyof VibeState, minLabel: string, maxLabel: string) => {
        const val = vibes[key];
        return (
            <div className="space-y-3 mb-8 group">
                <div className="flex justify-between items-end">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">
                        {label}_MOD
                    </label>
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-1 rounded">{val.toString().padStart(3, '0')}%</span>
                </div>
                
                <div className="relative h-8 flex items-center">
                    {/* Tick Marks */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 flex justify-between px-1 opacity-30 pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="w-[1px] h-2 bg-zinc-600"></div>
                        ))}
                    </div>

                    {/* Track */}
                    <div className="absolute inset-x-0 h-[2px] bg-zinc-800"></div>
                    <div 
                        className="absolute h-[2px] bg-primary shadow-[0_0_10px_rgba(249,115,22,0.8)]" 
                        style={{ width: `${val}%` }}
                    ></div>

                    {/* Input */}
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={val} 
                        onChange={(e) => handleSliderChange(key, parseInt(e.target.value))}
                        className="absolute inset-0 w-full opacity-0 cursor-ew-resize z-20"
                    />

                    {/* Thumb visual */}
                    <div 
                        className="absolute w-2 h-4 bg-zinc-200 border border-black shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none transition-all duration-75 z-10"
                        style={{ left: `calc(${val}% - 4px)` }}
                    ></div>
                </div>

                <div className="flex justify-between text-[8px] font-mono text-zinc-600 uppercase tracking-tight">
                    <span>{minLabel}</span>
                    <span>{maxLabel}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-[#09090b] border-l border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[100] flex flex-col animate-in slide-in-from-right duration-300">
             {/* Header */}
             <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><path d="M12 3v18"></path><path d="M6 8v8"></path><path d="M18 8v8"></path><path d="M2 12h20"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold tracking-[0.1em] text-white font-mono uppercase">VIBE SYNTH</h2>
                        <div className="text-[9px] text-zinc-500 font-mono tracking-widest">SIGNAL MODULATOR</div>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-900 rounded transition-colors"
                >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>

            {/* Signal Visualizer */}
            <div className="h-32 bg-black border-b border-zinc-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <canvas ref={canvasRef} width={420} height={128} className="w-full h-full"></canvas>
                <div className="absolute top-2 left-2 text-[8px] font-mono text-zinc-600">OUTPUT_WAVEFORM</div>
            </div>

            {/* Controls */}
            <div className="flex-1 p-8 overflow-y-auto relative bg-zinc-950/50">
                <div className="relative z-10 space-y-2">
                    {renderSlider('Entropy', 'entropy', 'Order / Minimal', 'Chaos / Loud')}
                    {renderSlider('Grit', 'grit', 'Polished / Luxury', 'Raw / Industrial')}
                    {renderSlider('Epoch', 'epoch', 'Historic / Retro', 'Future / Neon')}
                    {renderSlider('Obscurity', 'obscurity', 'Mainstream', 'Underground')}
                </div>
            </div>

            {/* Action Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur">
                <button
                    onClick={() => onSynthesize(vibes)}
                    disabled={isProcessing}
                    className={`
                        w-full py-4 bg-primary hover:bg-orange-500 text-black font-bold font-mono uppercase tracking-[0.2em] transition-all
                        flex items-center justify-center gap-3 relative overflow-hidden group clip-path-polygon
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    {isProcessing ? (
                        <>
                            <span className="w-2 h-2 bg-black rounded-full animate-bounce"></span>
                            TUNING...
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
                            INITIATE SCAN
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
