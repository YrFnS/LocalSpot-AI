
import { useState, useEffect } from 'react';
import { Business } from '../../types';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Business[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('ls_favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  const saveToStorage = (favs: Business[]) => {
    setFavorites(favs);
    localStorage.setItem('ls_favorites', JSON.stringify(favs));
  };

  const toggleFavorite = (business: Business) => {
    const exists = favorites.find(b => b.id === business.id);
    let newFavs;
    if (exists) {
      newFavs = favorites.filter(b => b.id !== business.id);
    } else {
      newFavs = [...favorites, { ...business, userNote: '', userTags: [] }];
    }
    saveToStorage(newFavs);
  };

  const updateNote = (id: string, note: string) => {
    const newFavs = favorites.map(b => 
      b.id === id ? { ...b, userNote: note } : b
    );
    saveToStorage(newFavs);
  };

  const addTag = (id: string, tag: string) => {
    const newFavs = favorites.map(b => {
      if (b.id === id) {
        const currentTags = b.userTags || [];
        if (!currentTags.includes(tag)) {
          return { ...b, userTags: [...currentTags, tag] };
        }
      }
      return b;
    });
    saveToStorage(newFavs);
  };

  const removeTag = (id: string, tag: string) => {
    const newFavs = favorites.map(b => {
      if (b.id === id) {
        return { ...b, userTags: (b.userTags || []).filter(t => t !== tag) };
      }
      return b;
    });
    saveToStorage(newFavs);
  };

  const isFavorite = (id: string) => favorites.some(b => b.id === id);
  const getFavorite = (id: string) => favorites.find(b => b.id === id);

  return { favorites, toggleFavorite, isFavorite, updateNote, addTag, removeTag, getFavorite };
};
