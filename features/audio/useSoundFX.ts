
import { useCallback, useRef } from 'react';
import { getAudioContext } from './audioUtils';

// Procedural Audio Engine for UI Sound Effects
export const useSoundFX = () => {
    const ctxRef = useRef<AudioContext | null>(null);

    const getContext = useCallback(() => {
        if (!ctxRef.current) {
            ctxRef.current = getAudioContext();
        }
        if (ctxRef.current.state === 'suspended') {
            ctxRef.current.resume();
        }
        return ctxRef.current;
    }, []);

    const playTone = useCallback((freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
        try {
            const ctx = getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio context might be blocked or failed
        }
    }, [getContext]);

    // UI Sounds

    // 1. Hover (Subtle blip)
    const playHover = useCallback(() => {
        playTone(800, 'sine', 0.05, 0.02);
    }, [playTone]);

    // 2. Click/Select (Mechanical chirp)
    const playClick = useCallback(() => {
        playTone(1200, 'square', 0.05, 0.05);
        setTimeout(() => playTone(600, 'sawtooth', 0.05, 0.05), 50);
    }, [playTone]);

    // 3. Scan/Search (Rising sweep)
    const playScan = useCallback(() => {
        try {
            const ctx = getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
            
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {}
    }, [getContext]);

    // 4. Success (Major arpeggio)
    const playSuccess = useCallback(() => {
        const ctx = getContext();
        const now = ctx.currentTime;
        const play = (f: number, t: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(f, t);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.2);
        };
        play(523.25, now);
        play(659.25, now + 0.1);
        play(783.99, now + 0.2);
    }, [getContext]);

    // 5. Error (Low buzz)
    const playError = useCallback(() => {
        playTone(150, 'sawtooth', 0.3, 0.1);
    }, [playTone]);

    // 6. Navigation (Tab switch)
    const playNav = useCallback(() => {
         try {
            const ctx = getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(2000, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
         } catch(e) {}
    }, [getContext]);

    // 7. Shutter (Camera snap)
    const playShutter = useCallback(() => {
        try {
            const ctx = getContext();
            const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < output.length; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const noiseGain = ctx.createGain();
            
            noiseGain.gain.setValueAtTime(0.5, ctx.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            
            noise.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noise.start();
        } catch(e) {}
    }, [getContext]);

    return { playHover, playClick, playScan, playSuccess, playError, playNav, playShutter };
};
