"use client";

import React, { useEffect, useState } from 'react';
import { useQuestStore } from '@/hooks/use-quest-store';
import { Clock } from 'lucide-react';

export default function TimerDisplay() {
  const startTime = useQuestStore((state) => state.startTime);
  const hasHydrated = useQuestStore((state) => state._hasHydrated);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime || !hasHydrated) {
      setElapsed(0);
      return;
    }

    const updateTimer = () => {
      setElapsed(Date.now() - startTime);
    };

    updateTimer(); // 즉시 업데이트
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime, hasHydrated]);

  // 데이터 로딩 중이거나 시작 전이면 표시 안함
  if (!hasHydrated || !startTime) return null;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-seoul-text text-seoul-card rounded-none border border-seoul-text shadow-[2px_2px_0px_0px_rgba(196,99,78,1)] transition-opacity duration-200">
      <Clock className="h-3.5 w-3.5 animate-pulse text-seoul-accent" />
      <span className="font-mono text-[14px] font-bold tracking-wider">
        {formatTime(elapsed)}
      </span>
    </div>
  );
}
