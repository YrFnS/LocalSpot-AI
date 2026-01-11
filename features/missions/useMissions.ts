
import { useState, useEffect } from 'react';
import { Itinerary } from '../../types';

export const useMissions = () => {
  const [missions, setMissions] = useState<Itinerary[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('ls_missions');
    if (stored) {
      try {
        setMissions(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse missions", e);
      }
    }
  }, []);

  const saveToStorage = (newMissions: Itinerary[]) => {
    setMissions(newMissions);
    localStorage.setItem('ls_missions', JSON.stringify(newMissions));
  };

  const saveMission = (itinerary: Itinerary) => {
    const newMission = {
        ...itinerary,
        id: itinerary.id || Math.random().toString(36).substr(2, 9),
        createdAt: Date.now()
    };
    
    // Check if exists to avoid dupes if clicked twice rapidly
    const exists = missions.find(m => m.title === newMission.title && m.items.length === newMission.items.length);
    if (exists) return;

    const newMissions = [newMission, ...missions];
    saveToStorage(newMissions);
  };

  const deleteMission = (id: string) => {
    const newMissions = missions.filter(m => m.id !== id);
    saveToStorage(newMissions);
  };

  return { missions, saveMission, deleteMission };
};
