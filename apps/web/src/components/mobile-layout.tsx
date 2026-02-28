import React from 'react';

export function StatusBar() {
  return (
    <div className="flex h-[62px] items-center justify-between px-5">
      <span className="font-sans text-[16px] font-bold text-seoul-text">9:41</span>
      <span className="font-sans text-[12px] font-bold text-seoul-text">5G 100%</span>
    </div>
  );
}

export function BottomNav() {
  const tabs = [
    { label: '탐험', icon: '집', active: true },
    { label: '길', icon: '지도', active: false },
    { label: '코스', icon: '목록', active: false },
    { label: '기록', icon: '서재', active: false },
  ];

  return (
    <div className="flex h-[95px] items-center justify-center px-5 pb-5 pt-3">
      <div className="flex h-[62px] w-full items-center gap-1 rounded-[36px] border border-seoul-text bg-white p-1">
        {tabs.map((tab) => (
          <div
            key={tab.label}
            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-[26px] h-full ${
              tab.active ? 'bg-seoul-accent text-white' : 'text-seoul-muted'
            }`}
          >
            <span className="text-[11px] font-bold tracking-[0.5px]">{tab.icon}</span>
            <span className="text-[10px] font-semibold tracking-[0.5px]">{tab.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[#fafafa]">
      <div className="flex min-h-screen w-full max-w-[420px] flex-col border-x border-seoul-text bg-[#fafafa]">
        {children}
      </div>
    </div>
  );
}
