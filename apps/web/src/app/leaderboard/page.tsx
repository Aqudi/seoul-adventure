import MobileLayout, { StatusBar } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LeaderboardPage() {
  const rankings = [
    { rank: 1, name: "궁궐러너", time: "00:23:44" },
    { rank: 2, name: "사관김", time: "00:24:11" },
    { rank: 3, name: "한양탐정", time: "00:25:09" },
  ];

  return (
    <MobileLayout>
      <StatusBar />
      <div className="flex flex-1 flex-col gap-4 px-5 py-4 pb-6">
        <h1 className="text-[32px] font-extrabold text-seoul-text">리더보드</h1>
        
        {/* Filter Tabs */}
        <div className="flex h-[46px] w-full gap-2">
          <Button className="flex-1 rounded-none bg-seoul-text text-seoul-card font-bold text-[14px] h-full">
            전체
          </Button>
          <Button variant="secondary" className="flex-1 rounded-none border border-seoul-text text-seoul-muted-foreground font-bold text-[14px] h-full">
            코스별
          </Button>
        </div>

        {/* My Best Record */}
        <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4 shadow-[4px_4px_0px_0px_rgba(45,42,38,1)]">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-bold text-seoul-muted uppercase">나의 최고 기록</span>
              <span className="text-[17px] font-bold text-seoul-text">tae_hunter</span>
            </div>
            <span className="text-[24px] font-extrabold text-seoul-text">00:26:10</span>
          </CardContent>
        </Card>

        {/* Rank List */}
        <Card className="border-[3px] border-seoul-text rounded-none bg-white flex flex-col overflow-hidden">
          {rankings.map((user, idx) => (
            <div 
              key={user.rank}
              className={`flex items-center justify-between h-14 px-3.5 ${
                idx === 0 ? 'bg-seoul-muted' : 'border-t border-seoul-text'
              }`}
            >
              <span className={`text-[15px] ${idx === 0 ? 'font-bold' : 'font-semibold'} text-seoul-text`}>
                {user.rank}  {user.name}
              </span>
              <span className={`text-[15px] ${idx === 0 ? 'font-bold' : 'font-semibold'} text-seoul-text`}>
                {user.time}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </MobileLayout>
  );
}
