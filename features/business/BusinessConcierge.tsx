
import React, { useState, useRef, useEffect } from 'react';
import { Business } from '../../types';
import { askBusinessQuestion } from './conciergeService';

interface BusinessConciergeProps {
    business: Business;
}

interface ChatMessage {
    role: 'user' | 'ai';
    text: string;
}

export const BusinessConcierge: React.FC<BusinessConciergeProps> = ({ business }) => {
    const [chatQuestion, setChatQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isAsking, setIsAsking] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleAskConcierge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatQuestion.trim() || isAsking) return;

        const q = chatQuestion.trim();
        setChatQuestion('');
        setChatHistory(prev => [...prev, { role: 'user', text: q }]);
        setIsAsking(true);

        const answer = await askBusinessQuestion(business, q);
        
        setChatHistory(prev => [...prev, { role: 'ai', text: answer }]);
        setIsAsking(false);
    };

    return (
        <div className="flex flex-col border border-zinc-800 bg-black font-mono text-xs rounded-sm overflow-hidden shadow-lg h-[300px]">
            {/* Terminal Header */}
            <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-2 flex justify-between items-center select-none">
                <span className="text-zinc-400 text-[10px] tracking-widest uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    AI_CONCIERGE_V2.1
                </span>
                <span className="text-zinc-600 text-[9px]">SECURE_CHANNEL</span>
            </div>

            {/* Output Window */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#050505]">
                {chatHistory.length === 0 && (
                     <div className="opacity-50 space-y-1 text-green-900/80">
                         <p>{`> CONNECTING TO ${business.name.toUpperCase()} DATABASE...`}</p>
                         <p>{`> ACCESS GRANTED.`}</p>
                         <p>{`> WAITING FOR INPUT...`}</p>
                         <div className="mt-4 text-zinc-600">
                             Try: "Is it quiet?", "Do they have wifi?", "Best dish?"
                         </div>
                     </div>
                )}
                
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <span className="text-[8px] text-zinc-600 mb-1 uppercase tracking-wider">
                            {msg.role === 'user' ? 'USER_CMD' : 'SYSTEM_RESP'}
                        </span>
                        <div className={`
                            max-w-[90%] p-2 border-l-2
                            ${msg.role === 'user' 
                                ? 'border-zinc-500 text-zinc-300 bg-zinc-900/30' 
                                : 'border-primary text-primary bg-primary/5 shadow-[0_0_10px_rgba(249,115,22,0.1)]'}
                        `}>
                            <p className="leading-relaxed">{`> ${msg.text}`}</p>
                        </div>
                    </div>
                ))}
                
                {isAsking && (
                    <div className="flex items-start">
                        <span className="text-primary animate-pulse">{`> PROCESSING QUERY...`}</span>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Command Line Input */}
            <form onSubmit={handleAskConcierge} className="bg-zinc-900 p-2 flex items-center gap-2 border-t border-zinc-800">
                <span className="text-primary">{'>'}</span>
                <input 
                    type="text" 
                    value={chatQuestion}
                    onChange={(e) => setChatQuestion(e.target.value)}
                    placeholder="ENTER_COMMAND..."
                    className="flex-1 bg-transparent text-white outline-none placeholder:text-zinc-700 caret-primary"
                    autoComplete="off"
                />
                <button 
                    type="submit" 
                    disabled={!chatQuestion.trim() || isAsking}
                    className="text-[10px] text-zinc-500 hover:text-white uppercase disabled:opacity-30"
                >
                    [EXEC]
                </button>
            </form>
        </div>
    );
};
