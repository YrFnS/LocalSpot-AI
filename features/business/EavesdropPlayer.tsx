
import React, { useState, useRef, useEffect } from 'react';
import { Business } from '../../types';
import { generateConversationAudio } from '../../services/geminiService';
import { getAudioContext, decodeAudioData } from '../../utils/audioUtils';

interface EavesdropPlayerProps {
    business: Business;
}

export const EavesdropPlayer: React.FC<EavesdropPlayerProps> = ({ business }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number>(0);

    const handleEavesdrop = async () => {
        if (isPlaying) {
            stopAudio();
            return;
        }

        setIsLoading(true);
        const buffer = await generateConversationAudio(business);
        
        if (buffer) {
            await playAudio(buffer);
        }
        setIsLoading(false);
    };

    const playAudio = async (arrayBuffer: ArrayBuffer) => {
        const ctx = getAudioContext();
        // Create Analyser
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const audioBuffer = await decodeAudioData(new Uint8Array(arrayBuffer), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        
        source.connect(analyser);
        analyser.connect(ctx.destination);
        
        source.onended = () => {
            setIsPlaying(false);
            stopVisualizer();
        };

        source.start();
        setAudioSource(source);
        setIsPlaying(true);
        startVisualizer();
    };

    const stopAudio = () => {
        if (audioSource) {
            audioSource.stop();
            setAudioSource(null);
        }
        setIsPlaying(false);
        stopVisualizer();
    };

    const startVisualizer = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const analyser = analyserRef.current;
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / bufferLength) * 2;
            let barHeight;
            let x = 0;

            for(let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
                
                // Color gradient based on height
                const r = barHeight + 25 * (i/bufferLength);
                const g = 250 * (i/bufferLength);
                const b = 50;
                
                ctx.fillStyle = `rgba(249, 115, 22, ${barHeight / 100})`; // Primary Orange opacity
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        };
        draw();
    };

    const stopVisualizer = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        // Clear canvas
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioSource) audioSource.stop();
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    return (
        <div className="relative overflow-hidden rounded-lg bg-black border border-zinc-800 p-4 mb-6 group">
            {/* Holographic BG */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleEavesdrop}
                        disabled={isLoading}
                        className={`
                            w-10 h-10 rounded-full flex items-center justify-center border transition-all
                            ${isLoading ? 'border-zinc-700 bg-zinc-900' : 
                              isPlaying ? 'border-red-500 text-red-500 bg-red-900/20' : 'border-primary text-primary bg-primary/10 hover:bg-primary/20'}
                        `}
                    >
                        {isLoading ? (
                            <span className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></span>
                        ) : isPlaying ? (
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                        ) : (
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        )}
                    </button>
                    <div>
                        <h3 className="text-xs font-bold text-white tracking-widest uppercase">EAVESDROP</h3>
                        <p className="text-[10px] text-zinc-500 font-mono">
                            {isLoading ? 'TUNING IN...' : isPlaying ? 'LIVE FEED ACTIVE' : 'LISTEN TO LOCALS'}
                        </p>
                    </div>
                </div>

                {/* Visualizer Canvas */}
                <div className="w-32 h-8 relative">
                    <canvas ref={canvasRef} width={128} height={32} className="w-full h-full"></canvas>
                    {!isPlaying && !isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                            <div className="w-full h-[1px] bg-zinc-600"></div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Status Line */}
            {isPlaying && (
                <div className="mt-2 pt-2 border-t border-zinc-900 flex justify-between items-center animate-in fade-in">
                    <span className="text-[9px] font-mono text-primary flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                        ALEX & JAMIE CHATTING
                    </span>
                    <span className="text-[9px] font-mono text-zinc-600">Simulated Conversation</span>
                </div>
            )}
        </div>
    );
};
