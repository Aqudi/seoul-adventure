"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface QuestState {
  capturedImages: Record<number, string>; // { step: imageUrl }
  setCapturedImage: (step: number, imageUrl: string) => void;
  resetQuest: () => void;
}

export const useQuestStore = create<QuestState>()(
  persist(
    (set) => ({
      capturedImages: {},
      setCapturedImage: (step, imageUrl) => 
        set((state) => ({
          capturedImages: { ...state.capturedImages, [step]: imageUrl }
        })),
      resetQuest: () => set({ capturedImages: {} }),
    }),
    {
      name: 'quest-storage',
    }
  )
);
