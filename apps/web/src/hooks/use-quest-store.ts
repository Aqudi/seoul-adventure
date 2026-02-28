"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CapturedData {
  imageUrl: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface QuestState {
  capturedImages: Record<number, CapturedData>; // step: { imageUrl, location }
  startTime: number | null;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setCapturedData: (step: number, data: CapturedData) => void;
  startQuest: () => void;
  resetQuest: () => void;
}

export const useQuestStore = create<QuestState>()(
  persist(
    (set) => ({
      capturedImages: {},
      startTime: null,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setCapturedData: (step, data) => 
        set((state) => ({
          capturedImages: { ...state.capturedImages, [step]: data }
        })),
      startQuest: () => set({ 
        startTime: Date.now(),
        capturedImages: {} 
      }),
      resetQuest: () => set({ 
        startTime: null, 
        capturedImages: {} 
      }),
    }),
    {
      name: 'quest-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
