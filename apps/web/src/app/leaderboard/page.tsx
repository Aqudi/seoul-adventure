"use client";

import { useRouter } from "next/navigation";
import MobileLayout from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLeaderboard, useMyRank } from "@/hooks/use-leaderboard";

const formatMs = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export default function LeaderboardPage() {
  const { data: rankings, isLoading } = useLeaderboard();
  const { data: myRank } = useMyRank("att_1");

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex flex-1 items-center justify-center">
          <p className="font-bold text-seoul-text animate-pulse">순위표를 불러오는 중...</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="flex flex-1 flex-col gap-4 px-5 py-4 pb-6">
        <h1 className="text-[32px] font-extrabold text-seoul-text">리더보드</h1>
        
        <div className="flex h-[46px] w-full gap-2">
          <Button className="flex-1 rounded-none bg-seoul-text text-seoul-card font-bold text-[14px] h-full shadow-[2px_2px_0px_0px_rgba(45,42,38,1)]">
            전체
          </Button>
          <Button variant="secondary" className="flex-1 rounded-none border border-seoul-text text-seoul-muted-foreground font-bold text-[14px] h-full shadow-[2px_2px_0px_0px_rgba(45,42,38,1)]">
            코스별
          </Button>
        </div>

        {myRank && (
          <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4 shadow-[4px_4px_0px_0px_rgba(45,42,38,1)]">
            <CardContent className="p-0 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-bold text-seoul-muted uppercase tracking-tight">나의 최고 기록</span>
                <span className="text-[17px] font-bold text-seoul-text">tae_hunter (전체 {myRank.rank}위)</span>
              </div>
              <span className="text-[24px] font-extrabold text-seoul-text">{formatMs(myRank.clearTimeMs || 0)}</span>
            </CardContent>
          </Card>
        )}

        <Card className="border-[3px] border-seoul-text rounded-none bg-white flex flex-col overflow-hidden shadow-[4px_4px_0px_0px_rgba(45,42,38,1)]">
          {rankings.map((user, idx) => (
            <div 
              key={idx}
              className={`flex items-center justify-between h-14 px-3.5 ${
                idx === 0 ? 'bg-seoul-muted' : 'border-t border-seoul-text'
              }`}
            >
              <div className="flex gap-4">
                 <span className={`text-[15px] font-extrabold text-seoul-accent`}>{user.rank}</span>
                 <span className={`text-[15px] ${idx === 0 ? 'font-bold' : 'font-semibold'} text-seoul-text`}>
                    {user.nickname}
                 </span>
              </div>
              <span className={`text-[15px] ${idx === 0 ? 'font-bold' : 'font-semibold'} text-seoul-text`}>
                {formatMs(user.clearTimeMs || 0)}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </MobileLayout>
  );
}
