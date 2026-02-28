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
  attemptId: string | null; // 현재 진행 중인 시도 ID
  capturedImages: Record<number, CapturedData>;
  startTime: number | null;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setCapturedData: (step: number, data: CapturedData) => void;
  startQuest: (attemptId: string) => void; // 시작 시 ID 저장
  resetQuest: () => void;
}

export const useQuestStore = create<QuestState>()(
  persist(
    (set) => ({
      attemptId: null,
      capturedImages: {},
      startTime: null,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setCapturedData: (step, data) => 
        set((state) => ({
          capturedImages: { ...state.capturedImages, [step]: data }
        })),
      startQuest: (attemptId) => set({ 
        attemptId,
        startTime: Date.now(),
        capturedImages: {} 
      }),
      resetQuest: () => set({ 
        attemptId: null,
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
