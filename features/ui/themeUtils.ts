
export const THEMES: Record<string, string> = {
    default: 'from-orange-500/10 via-background to-background',
    coffee: 'from-amber-700/20 via-orange-900/10 to-background',
    food: 'from-red-900/20 via-orange-900/10 to-background',
    drinks: 'from-purple-900/20 via-blue-900/10 to-background',
    parks: 'from-emerald-900/20 via-green-900/10 to-background',
    art: 'from-pink-900/20 via-rose-900/10 to-background',
    shop: 'from-yellow-700/20 via-amber-900/10 to-background',
    music: 'from-indigo-900/20 via-violet-900/10 to-background'
};

export const getThemeForQuery = (query: string): string => {
    const q = query.toLowerCase();
    for (const key of Object.keys(THEMES)) {
        if (q.includes(key)) {
            return THEMES[key];
        }
    }
    return THEMES.default;
};
