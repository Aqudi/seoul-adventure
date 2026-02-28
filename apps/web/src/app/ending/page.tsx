"use client";

import MobileLayout from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuestStore } from "@/hooks/use-quest-store";
import { useRouter } from "next/navigation";
import { useMyRank } from "@/hooks/use-leaderboard";
import { useAttempt } from "@/hooks/use-attempts";

const formatMs = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export default function EndingPage() {
  const router = useRouter();
  const { capturedImages, resetQuest, startTime, attemptId } = useQuestStore();
  
  // 실제 서버 데이터 (시도 종료 정보) 조회
  const { data: attempt } = useAttempt(attemptId || undefined);
  // 내 실제 순위 조회
  const { data: myRank } = useMyRank(attemptId || "");
  
  const finalTimeMs = attempt?.clearTimeMs || (startTime ? Date.now() - startTime : 0);

  const imagesArray = Object.entries(capturedImages)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([_, data]) => data.imageUrl);

  const onNextCourse = () => {
    resetQuest();
    router.push("/courses");
  };

  return (
    <MobileLayout>
      <div className="flex flex-1 flex-col gap-4 px-5 py-4 pb-6">
        <h1 className="text-[32px] font-extrabold text-seoul-text">임무 완수</h1>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-seoul-muted uppercase tracking-tight">나의 탐험 기록</span>
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar">
            {imagesArray.length > 0 ? (
              imagesArray.map((url, i) => (
                <div key={i} className="min-w-[280px] h-[200px] snap-center border-[3px] border-seoul-text bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(45,42,38,1)] relative">
                  <img src={url} alt={`Step ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-seoul-accent text-white rounded-none border-2 border-seoul-text">
                      Step {i + 1}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full h-[200px] flex items-center justify-center border-[3px] border-seoul-text border-dashed bg-[#EBE8E3] text-seoul-muted">
                기록된 사진이 없소.
              </div>
            )}
          </div>
        </div>

        {/* Result Card - 실시간 순위 및 기록 반영 */}
        <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4 shadow-[4px_4px_0px_0px_rgba(45,42,38,1)]">
          <CardContent className="p-0 flex flex-col gap-1.5 items-start">
            <span className="text-[13px] font-bold text-seoul-muted uppercase tracking-tight">최종 기록</span>
            <span className="text-[42px] font-extrabold text-seoul-text leading-tight">
              {formatMs(finalTimeMs)}
            </span>
            {myRank?.rank ? (
              <Badge className="bg-seoul-text text-seoul-card rounded-none px-2.5 py-1 text-[11px] font-bold">
                전체 {myRank.rank}위
              </Badge>
            ) : (
              <Badge variant="outline" className="border-seoul-text rounded-none px-2.5 py-1 text-[11px] font-bold animate-pulse">
                순위 산정 중...
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Epilogue Card - 서버 코스 데이터 기반 */}
        <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4">
          <CardContent className="p-0 flex flex-col gap-2">
            <h3 className="text-[15px] font-bold text-seoul-text">에필로그</h3>
            <p className="text-[14px] font-medium leading-[1.45] text-seoul-text">
              {attempt?.course?.epilogue || "모든 단서를 모았군! 그대는 오늘부로 명예 사관이오. 다음 주, 세종대왕의 비밀 편지가 그대를 기다리오."}
            </p>
          </CardContent>
        </Card>

        <div className="mt-auto flex flex-col gap-3 pt-4">
          <Button className="h-[50px] bg-seoul-text text-seoul-card rounded-none font-bold text-[15px] shadow-[3px_3px_0px_0px_rgba(196,99,78,1)]">
            기록 공유하기
          </Button>
          <Button
            variant="secondary"
            onClick={onNextCourse}
            className="h-[46px] border border-seoul-text rounded-none font-bold text-[14px] shadow-[2px_2px_0px_0px_rgba(45,42,38,1)]"
          >
            다른 코스 도전하기
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
