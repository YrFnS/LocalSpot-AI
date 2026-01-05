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
        <div className="mb-8 p-4 bg-yellow-900/10 border border-yellow-900/30 rounded">
            <h3 className="text-xs font-mono text-yellow-600 uppercase tracking-widest mb-2">MY NOTES</h3>
            <textarea 
                value={note}
                onChange={handleNoteChange}
                placeholder="Add personal notes here (e.g. 'Great wifi, try the matcha latte')..."
                className="w-full bg-transparent text-sm text-yellow-100 placeholder:text-yellow-900/40 outline-none resize-none min-h-[60px] mb-4"
            />
            
            <div className="border-t border-yellow-900/20 pt-3">
                 <h3 className="text-xs font-mono text-yellow-600 uppercase tracking-widest mb-2">MY COLLECTIONS</h3>
                 <div className="flex flex-wrap gap-2 mb-2">
                     {userTags.map(tag => (
                         <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-200 text-xs border border-yellow-500/20 rounded">
                             {tag}
                             <button 
                                onClick={() => onRemoveTag && onRemoveTag(businessId, tag)}
                                className="hover:text-yellow-100"
                             >
                                 ×
                             </button>
                         </span>
                     ))}
                 </div>
                 <form onSubmit={handleAddTag} className="flex gap-2">
                     <input 
                        type="text" 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add tag (e.g. Work, Date)..."
                        className="flex-1 bg-zinc-900/50 border border-zinc-800 text-xs text-white px-2 py-1 rounded outline-none focus:border-yellow-700"
                     />
                     <button type="submit" className="text-xs font-mono text-yellow-600 hover:text-yellow-500">
                         + ADD
                     </button>
                 </form>
            </div>
        </div>
    );
};