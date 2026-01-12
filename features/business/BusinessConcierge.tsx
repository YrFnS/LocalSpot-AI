
import React, { useState, useRef, useEffect } from 'react';
import { Business } from '../../types';
import { askBusinessQuestion } from './conciergeService';

interface BusinessConciergeProps {
    business: Business;
}

interface ChatMessage {
    role: 'user' | 'ai';
    text: string;
    timestamp: number;
}

export const BusinessConcierge: React.FC<BusinessConciergeProps> = ({ business }) => {
    const [chatQuestion, setChatQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isAsking, setIsAsking] = useState(false);
    const [streamedText, setStreamedText] = useState('');
    const [connectionStatus, setConnectionStatus] = useState<'IDLE' | 'CONNECTING' | 'CONNECTED'>('IDLE');
    
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, streamedText, isAsking]);

    // Initialize Connection Effect
    useEffect(() => {
        setConnectionStatus('CONNECTING');
        const timer = setTimeout(() => {
            setConnectionStatus('CONNECTED');
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    // Streaming Logic for AI response
    useEffect(() => {
        const lastMsg = chatHistory[chatHistory.length - 1];
        if (lastMsg?.role === 'ai' && streamedText !== lastMsg.text) {
            let i = streamedText.length;
            if (i < lastMsg.text.length) {
                const timeout = setTimeout(() => {
                    setStreamedText(lastMsg.text.substring(0, i + 1));
                }, 20); // Typing speed
                return () => clearTimeout(timeout);
            }
        }
    }, [chatHistory, streamedText]);

    const handleAskConcierge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatQuestion.trim() || isAsking) return;

        const q = chatQuestion.trim();
        setChatQuestion('');
        setChatHistory(prev => [...prev, { role: 'user', text: q, timestamp: Date.now() }]);
        setIsAsking(true);
        setStreamedText(''); // Reset stream for next answer

        const answer = await askBusinessQuestion(business, q);
        
        setChatHistory(prev => [...prev, { role: 'ai', text: answer, timestamp: Date.now() }]);
        setIsAsking(false);
    };

    return (
        <div className="flex flex-col border border-zinc-800 bg-[#020202] font-mono text-xs rounded-sm overflow-hidden shadow-lg h-[340px] relative group">
            {/* Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] pointer-events-none z-20 opacity-20"></div>

            {/* Terminal Header */}
            <div className="bg-zinc-950 border-b border-zinc-800 px-3 py-2 flex justify-between items-center select-none z-30">
                <span className="text-zinc-400 text-[10px] tracking-widest uppercase flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : (connectionStatus === 'CONNECTING' ? 'bg-yellow-500 animate-pulse' : 'bg-red-900')}`}></span>
                    AI_CONCIERGE_LINK
                </span>
                <span className="text-zinc-600 text-[9px] uppercase">{connectionStatus}</span>
            </div>

            {/* Output Window */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black relative z-10">
                {connectionStatus === 'CONNECTING' && (
                    <div className="text-[10px] text-zinc-500 space-y-1">
                        <p>{'>'} INITIALIZING HANDSHAKE...</p>
                        <p>{'>'} VERIFYING ENCRYPTION KEYS...</p>
                    </div>
                )}

                {connectionStatus === 'CONNECTED' && chatHistory.length === 0 && (
                     <div className="opacity-60 space-y-2 text-emerald-900/80 animate-in fade-in slide-in-from-left-2 duration-700">
                         <p className="text-emerald-500">{`> CONNECTED TO ${business.name.toUpperCase()} DATABASE.`}</p>
                         <p className="text-zinc-500">{`> AGENT READY. AWAITING QUERY...`}</p>
                         
                         <div className="mt-6 grid grid-cols-2 gap-2">
                             {["Best time to visit?", "Is it loud?", "Parking info?", "Wifi available?"].map(hint => (
                                 <button 
                                    key={hint}
                                    onClick={() => setChatQuestion(hint)}
                                    className="text-[9px] text-zinc-600 border border-zinc-800 p-2 text-left hover:border-emerald-500/30 hover:text-emerald-400 transition-colors"
                                 >
                                     {hint}
                                 </button>
                             ))}
                         </div>
                     </div>
                )}
                
                {chatHistory.map((msg, idx) => {
                    const isLastAi = msg.role === 'ai' && idx === chatHistory.length - 1;
                    const textToShow = isLastAi ? streamedText : msg.text;

                    return (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <span className="text-[8px] text-zinc-600 mb-1 uppercase tracking-wider flex items-center gap-1">
                                {msg.role === 'user' ? 'COMMAND_INPUT' : 'SYSTEM_RESPONSE'}
                                <span className="text-zinc-700">
                                    [{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]
                                </span>
                            </span>
                            <div className={`
                                max-w-[90%] p-3 border-l-2 relative
                                ${msg.role === 'user' 
                                    ? 'border-zinc-600 text-zinc-300 bg-zinc-900/30' 
                                    : 'border-emerald-500 text-emerald-400 bg-emerald-950/10 shadow-[0_0_15px_rgba(16,185,129,0.05)]'}
                            `}>
                                <p className="leading-relaxed whitespace-pre-wrap font-mono text-[11px]">
                                    {msg.role === 'ai' && <span className="text-emerald-600 mr-2">{'>'}</span>}
                                    {textToShow}
                                    {isLastAi && textToShow.length < msg.text.length && (
                                        <span className="inline-block w-2 h-4 bg-emerald-500 ml-1 animate-pulse align-middle"></span>
                                    )}
                                </p>
                            </div>
                        </div>
                    );
                })}
                
                {isAsking && (
                    <div className="flex items-start pl-2">
                        <span className="text-emerald-500 animate-pulse text-[10px]">{`> PROCESSING_QUERY`}</span>
                        <span className="animate-[bounce_1s_infinite] ml-1 text-emerald-500">.</span>
                        <span className="animate-[bounce_1s_infinite_100ms] ml-0.5 text-emerald-500">.</span>
                        <span className="animate-[bounce_1s_infinite_200ms] ml-0.5 text-emerald-500">.</span>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Command Line Input */}
            <form onSubmit={handleAskConcierge} className="bg-zinc-950 p-2 flex items-center gap-2 border-t border-zinc-800 relative z-30">
                <span className="text-emerald-500 font-bold">{'>'}</span>
                <input 
                    type="text" 
                    value={chatQuestion}
                    onChange={(e) => setChatQuestion(e.target.value)}
                    placeholder={connectionStatus === 'CONNECTED' ? "ENTER_COMMAND..." : "INITIALIZING..."}
                    className="flex-1 bg-transparent text-emerald-100 outline-none placeholder:text-zinc-800 caret-emerald-500 disabled:opacity-50"
                    autoComplete="off"
                    disabled={connectionStatus !== 'CONNECTED'}
                />
                <button 
                    type="submit" 
                    disabled={!chatQuestion.trim() || isAsking || connectionStatus !== 'CONNECTED'}
                    className="text-[9px] bg-zinc-900 hover:bg-emerald-900/30 text-zinc-500 hover:text-emerald-400 px-3 py-1 border border-zinc-800 hover:border-emerald-500/30 transition-all uppercase disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    EXECUTE
                </button>
            </form>
        </div>
    );
};
