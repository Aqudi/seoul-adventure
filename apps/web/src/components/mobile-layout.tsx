"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function StatusBar() {
  return (
    <div className="flex h-[24px] items-center justify-between px-5 shrink-0">
      {/* Status Bar icons removed as requested */}
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  
  const tabs = [
    { label: '탐험', icon: '집', href: '/courses' },
    { label: '길', icon: '지도', href: '/quests' },
    { label: '코스', icon: '목록', href: '/leaderboard' },
    { label: '기록', icon: '서재', href: '/ending' },
  ];

  return (
    <div className="flex h-[95px] items-center justify-center px-5 pb-5 pt-3 shrink-0">
      <div className="flex h-[62px] w-full items-center gap-1 rounded-[36px] border border-seoul-text bg-white p-1 shadow-sm">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-[26px] h-full transition-colors ${
                isActive ? 'bg-seoul-accent text-white' : 'text-seoul-muted hover:bg-black/5'
              }`}
            >
              <span className="text-[11px] font-bold tracking-[0.5px]">{tab.icon}</span>
              <span className="text-[10px] font-semibold tracking-[0.5px]">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Don't show BottomNav on the login page (index)
  const showBottomNav = pathname !== '/';

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#fafafa]">
      <div className="flex min-h-screen w-full max-w-[420px] flex-col border-x border-seoul-text bg-[#fafafa] shadow-2xl overflow-hidden">
        <StatusBar />
        <div className="flex-1 overflow-y-auto flex flex-col">
          {children}
        </div>
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
