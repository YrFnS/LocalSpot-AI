
import React, { useEffect, useRef, useState } from 'react';
import { LiveTranscript } from './useLiveSession';
import { OracleHUD } from './OracleHUD';

interface OracleOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  isSpeaking: boolean;
  volume: number;
  transcripts: LiveTranscript[];
  realtimeText: { role: 'user' | 'model', text: string } | null;
  onSendFrame?: (base64: string) => void;
}

export const OracleOverlay: React.FC<OracleOverlayProps> = ({ 
    isOpen, 
    onClose, 
    isConnected, 
    isSpeaking, 
    volume,
    transcripts,
    realtimeText,
    onSendFrame
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [visionMode, setVisionMode] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  
  // View State: FULL = Immersive Overlay, MINI = Bottom HUD
  const [viewState, setViewState] = useState<'FULL' | 'MINI'>('FULL');

  // Auto-scroll transcript
  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [transcripts, realtimeText, viewState]);

  // Video Stream Handling
  useEffect(() => {
      if (visionMode && isOpen && isConnected) {
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 1280, height: 720 } })
            .then(stream => {
                setVideoStream(stream);
                if (videoRef.current) videoRef.current.srcObject = stream;
            })
            .catch(err => {
                console.error("Camera access failed", err);
                setVisionMode(false);
            });
      } else {
          if (videoStream) {
              videoStream.getTracks().forEach(t => t.stop());
              setVideoStream(null);
          }
      }
      return () => {
          if (videoStream) videoStream.getTracks().forEach(t => t.stop());
      };
  }, [visionMode, isOpen, isConnected]);

  // Frame Capture Loop
  useEffect(() => {
      if (!visionMode || !isConnected || !onSendFrame || !videoRef.current) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const interval = setInterval(() => {
          if (videoRef.current && videoRef.current.readyState === 4) {
              canvas.width = videoRef.current.videoWidth * 0.5; // Scale down for bandwidth
              canvas.height = videoRef.current.videoHeight * 0.5;
              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              
              const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
              const base64 = dataUrl.split(',')[1];
              onSendFrame(base64);
          }
      }, 1000); // 1 FPS is sufficient for context

      return () => clearInterval(interval);
  }, [visionMode, isConnected, onSendFrame]);

  if (!isOpen) return null;

  // --- RENDER MODES ---

  const renderFullMode = () => (
    <div className={`absolute inset-0 pointer-events-auto flex flex-col items-center justify-center font-sans transition-all duration-500 ${visionMode ? 'bg-black' : 'bg-black/95 backdrop-blur-xl'}`}>
        
        {/* Full Video Feed */}
        {visionMode && (
            <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
        )}

        {/* HUD Layer */}
        <OracleHUD 
            isConnected={isConnected} 
            isSpeaking={isSpeaking} 
            volume={volume} 
            visionMode={visionMode} 
        />
        
        {/* Full UI Overlay */}
        <div className="absolute inset-0 pointer-events-none p-6 md:p-12 flex flex-col justify-between">
            {/* Top Bar */}
            <div className="flex justify-between items-start pointer-events-auto">
                 <div className="flex flex-col gap-1">
                     <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-yellow-500 animate-pulse'}`}></div>
                         <span className="font-mono text-xs text-zinc-400 tracking-widest">
                             {visionMode ? 'OPTICAL_SENSORS_ACTIVE' : 'NEURAL_UPLINK_ESTABLISHED'}
                         </span>
                     </div>
                     <span className="font-mono text-[9px] text-zinc-600">LATENCY: 12ms // MODE: IMMERSIVE</span>
                 </div>
                 
                 <div className="flex gap-2">
                     <button
                        onClick={() => setViewState('MINI')}
                        className="px-3 py-1.5 border border-zinc-800 bg-black/50 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[9px] font-mono uppercase tracking-widest rounded-sm transition-colors"
                     >
                        MINIMIZE_HUD
                     </button>
                     <button 
                        onClick={() => setVisionMode(!visionMode)}
                        className={`flex items-center gap-2 px-3 py-1.5 border rounded-sm transition-all uppercase text-[9px] font-mono font-bold tracking-wider ${visionMode ? 'bg-primary text-black border-primary' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'}`}
                     >
                         {visionMode ? 'VISION ON' : 'ENABLE VISION'}
                     </button>
                 </div>
            </div>

            {/* Transcript Log (Full History) */}
            <div className="absolute bottom-32 left-0 right-0 max-w-2xl mx-auto px-4 pointer-events-auto">
                <div 
                    ref={scrollRef}
                    className="h-48 overflow-y-auto custom-scrollbar flex flex-col gap-2 mask-linear-fade"
                    style={{ maskImage: 'linear-gradient(to bottom, transparent, black 20%)' }}
                >
                    {transcripts.map((t) => (
                        <div key={t.id} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                            <div className={`
                                max-w-[80%] px-3 py-2 rounded-sm border text-xs font-mono leading-relaxed backdrop-blur-sm
                                ${t.role === 'user' 
                                    ? 'bg-zinc-900/80 border-zinc-700 text-zinc-300' 
                                    : 'bg-primary/10 border-primary/30 text-primary-100'}
                            `}>
                                <span className="opacity-50 text-[9px] block mb-0.5 uppercase tracking-wider">
                                    {t.role === 'user' ? 'USER_INPUT' : 'ORACLE_RESP'}
                                </span>
                                {t.text}
                            </div>
                        </div>
                    ))}
                    
                    {realtimeText && (
                        <div className={`flex ${realtimeText.role === 'user' ? 'justify-end' : 'justify-start'} animate-pulse`}>
                            <div className={`
                                max-w-[80%] px-3 py-2 rounded-sm border text-xs font-mono leading-relaxed border-dashed backdrop-blur-sm
                                ${realtimeText.role === 'user' 
                                    ? 'border-zinc-500 text-zinc-400 bg-black/50' 
                                    : 'border-primary/50 text-primary bg-primary/5'}
                            `}>
                                {realtimeText.text}<span className="inline-block w-2 h-4 align-middle bg-current ml-1 animate-[blink_1s_infinite]"></span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-center items-end pointer-events-auto">
                 <button 
                    onClick={onClose}
                    className="group relative px-8 py-3 bg-red-950/20 border border-red-900/50 hover:bg-red-900/40 hover:border-red-500 transition-all rounded-sm overflow-hidden backdrop-blur-md"
                 >
                     <span className="relative z-10 font-mono text-xs font-bold text-red-500 group-hover:text-red-300 tracking-[0.2em]">TERMINATE UPLINK</span>
                 </button>
            </div>
        </div>
    </div>
  );

  const renderMiniMode = () => (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-4 md:p-6 z-50">
        
        {/* Floating Captions (Just the latest) */}
        {(realtimeText || transcripts.length > 0) && (
            <div className="mb-4 self-center w-full max-w-lg pointer-events-none flex flex-col items-center gap-2">
                {realtimeText && (
                    <div className="px-4 py-2 bg-black/80 backdrop-blur-md border border-primary/30 text-primary text-sm font-mono shadow-2xl rounded-sm animate-in slide-in-from-bottom-2">
                        <span className="opacity-50 mr-2 text-[10px] uppercase">{realtimeText.role === 'user' ? 'YOU:' : 'ORACLE:'}</span>
                        {realtimeText.text}
                    </div>
                )}
                {!realtimeText && transcripts.length > 0 && (
                    <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-zinc-800 text-zinc-300 text-xs font-mono shadow-xl rounded-sm opacity-80">
                         {transcripts[transcripts.length - 1].text}
                    </div>
                )}
            </div>
        )}

        {/* Tactical HUD Bar */}
        <div className="pointer-events-auto relative w-full max-w-3xl mx-auto h-20 bg-[#09090b]/90 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.5)] flex items-center overflow-hidden animate-in slide-in-from-bottom-10">
            
            {/* Left: Status */}
            <div className="h-full px-6 flex flex-col justify-center border-r border-zinc-800 bg-black/20 shrink-0">
                 <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                     <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-widest">LIVE</span>
                 </div>
                 <span className="text-[9px] font-mono text-zinc-600 uppercase mt-1">TACTICAL_HUD</span>
            </div>

            {/* Center: Waveform Visualization */}
            <div className="flex-1 h-full relative">
                <OracleHUD 
                    isConnected={isConnected} 
                    isSpeaking={isSpeaking} 
                    volume={volume} 
                    visionMode={false} // Always render classic wave in HUD
                />
            </div>

            {/* Right: Vision Preview (PiP) */}
            {visionMode && (
                <div className="absolute bottom-2 right-44 w-24 h-16 bg-black border border-primary/30 rounded overflow-hidden shadow-lg group">
                    <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline 
                        muted
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute top-0 right-0 bg-primary px-1 text-[8px] text-black font-bold">CAM</div>
                </div>
            )}

            {/* Far Right: Controls */}
            <div className="h-full px-4 flex items-center gap-2 border-l border-zinc-800 bg-black/20 shrink-0">
                <button 
                    onClick={() => setVisionMode(!visionMode)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${visionMode ? 'bg-primary text-black border-primary' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'}`}
                    title="Toggle Vision"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>

                <button 
                    onClick={() => setViewState('FULL')}
                    className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-all"
                    title="Maximize"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                </button>

                <div className="w-px h-8 bg-zinc-700 mx-1"></div>

                <button 
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-red-900/20 border border-red-900/50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                    title="Disconnect"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
        {viewState === 'FULL' ? renderFullMode() : renderMiniMode()}
    </div>
  );
};
