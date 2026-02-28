"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface QuestState {
  capturedImages: Record<number, string>; // step: imageUrl (단순 URL 구조)
  startTime: number | null;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setCapturedImage: (step: number, imageUrl: string) => void;
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
      setCapturedImage: (step, imageUrl) => 
        set((state) => ({
          capturedImages: { ...state.capturedImages, [step]: imageUrl }
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
