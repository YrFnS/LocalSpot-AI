
import React, { useState, useEffect } from 'react';

interface UserAnnotationsProps {
    businessId: string;
    userNote?: string;
    userTags?: string[];
    onUpdateNote?: (id: string, note: string) => void;
    onAddTag?: (id: string, tag: string) => void;
    onRemoveTag?: (id: string, tag: string) => void;
}

export const UserAnnotations: React.FC<UserAnnotationsProps> = ({
    businessId,
    userNote,
    userTags = [],
    onUpdateNote,
    onAddTag,
    onRemoveTag
}) => {
    const [note, setNote] = useState(userNote || '');
    const [tagInput, setTagInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        setNote(userNote || '');
    }, [userNote]);

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newNote = e.target.value;
        setNote(newNote);
        if (onUpdateNote) {
            onUpdateNote(businessId, newNote);
        }
    };

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (tagInput.trim() && onAddTag) {
            onAddTag(businessId, tagInput.trim());
            setTagInput('');
        }
    };

    return (
        <div className="mb-8 border border-yellow-900/30 bg-[#090500]">
            <div className="bg-yellow-900/10 px-3 py-2 border-b border-yellow-900/20 flex justify-between items-center">
                 <h3 className="text-[10px] font-mono text-yellow-600 uppercase tracking-widest flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-pulse"></span>
                     FIELD AGENT LOG
                 </h3>
                 <span className="text-[8px] font-mono text-yellow-800 uppercase">CLASSIFIED: EYES ONLY</span>
            </div>
            
            <div className="p-3">
                <div className={`relative bg-yellow-950/10 border transition-colors ${isFocused ? 'border-yellow-700/50' : 'border-yellow-900/20'} mb-4`}>
                    <div className="absolute top-0 left-0 px-1 py-0.5 bg-yellow-900/20 text-[8px] font-mono text-yellow-700">ENTRY_01</div>
                    <textarea 
                        value={note}
                        onChange={handleNoteChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Input field observations..."
                        className="w-full bg-transparent text-xs font-mono text-yellow-200/90 placeholder:text-yellow-900/40 outline-none resize-none min-h-[80px] p-2 pt-6 leading-relaxed"
                    />
                    {/* Blinking cursor effect if empty */}
                    {!note && !isFocused && (
                        <div className="absolute top-6 left-2 w-2 h-4 bg-yellow-600/50 animate-pulse pointer-events-none"></div>
                    )}
                </div>
                
                <div className="border-t border-yellow-900/10 pt-3">
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="text-[9px] font-mono text-yellow-700 uppercase tracking-wider">KEYWORDS</h3>
                        <span className="text-[8px] font-mono text-yellow-800">{userTags.length} ASSIGNED</span>
                     </div>
                     
                     <div className="flex flex-wrap gap-2 mb-3">
                         {userTags.map(tag => (
                             <span key={tag} className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-mono border border-yellow-500/20 rounded-sm hover:bg-yellow-500/20 transition-colors">
                                 #{tag.toUpperCase()}
                                 <button 
                                    onClick={() => onRemoveTag && onRemoveTag(businessId, tag)}
                                    className="hover:text-yellow-200 ml-1 font-bold"
                                 >
                                     ×
                                 </button>
                             </span>
                         ))}
                         {userTags.length === 0 && (
                             <span className="text-[10px] font-mono text-yellow-900 italic">No keywords assigned.</span>
                         )}
                     </div>
                     
                     <form onSubmit={handleAddTag} className="flex gap-0 border border-yellow-900/20 rounded-sm overflow-hidden">
                         <span className="bg-yellow-900/10 text-yellow-700 px-2 py-1 text-xs font-mono flex items-center justify-center border-r border-yellow-900/20">+</span>
                         <input 
                            type="text" 
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="ADD_KEYWORD"
                            className="flex-1 bg-transparent text-[10px] font-mono text-yellow-200 px-2 py-1 outline-none placeholder:text-yellow-900/50 uppercase"
                         />
                         <button type="submit" disabled={!tagInput} className="px-3 bg-yellow-900/20 text-[9px] font-bold text-yellow-600 hover:bg-yellow-900/40 hover:text-yellow-400 transition-colors uppercase disabled:opacity-50">
                             APPEND
                         </button>
                     </form>
                </div>
            </div>
        </div>
    );
};
