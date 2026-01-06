
import React, { useState, useRef, useEffect } from 'react';
import { Business } from '../../types';
import { askBusinessQuestion } from '../../services/insightService';

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
        <div className="flex-1 min-h-[200px] flex flex-col bg-black/20 rounded border border-zinc-800/50 mb-4 overflow-hidden">
            <div className="p-2 border-b border-zinc-800/30 bg-zinc-900/50 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">AI CONCIERGE</span>
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                {chatHistory.length === 0 && (
                     <p className="text-xs text-zinc-600 italic text-center mt-4">
                         Ask me anything about {business.name}...<br/>
                         "Is it quiet?" • "Good for groups?"
                     </p>
                )}
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                            max-w-[85%] rounded-lg p-2 text-xs leading-relaxed
                            ${msg.role === 'user' ? 'bg-zinc-800 text-zinc-200 rounded-tr-none' : 'bg-primary/10 text-primary-100 border border-primary/20 rounded-tl-none'}
                        `}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isAsking && (
                    <div className="flex justify-start">
                         <div className="bg-primary/5 border border-primary/10 rounded-lg p-2 rounded-tl-none">
                             <div className="flex gap-1">
                                 <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                 <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                 <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                             </div>
                         </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleAskConcierge} className="p-2 bg-zinc-900 border-t border-zinc-800/50 flex gap-2">
                <input 
                    type="text" 
                    value={chatQuestion}
                    onChange={(e) => setChatQuestion(e.target.value)}
                    placeholder="Type a question..."
                    className="flex-1 bg-black/20 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-primary/50 placeholder:text-zinc-600"
                />
                <button 
                    type="submit" 
                    disabled={!chatQuestion.trim() || isAsking}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded text-[10px] font-mono uppercase disabled:opacity-50 transition-colors"
                >
                    ASK
                </button>
            </form>
        </div>
    );
};
