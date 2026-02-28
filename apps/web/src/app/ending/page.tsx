"use client";

import MobileLayout from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// @seoul-advanture/schemas의 AttemptResponseSchema 기반 데이터
const mockAttemptResult = {
  id: "att_123",
  status: "COMPLETED" as const,
  startAt: "2024-02-28T14:00:00Z",
  endAt: "2024-02-28T14:27:43Z",
  clearTimeMs: 1663000, // 27분 43초
  questStates: [], // 상세 퀘스트 상태들
  course: {
    title: "한양 도성 북문 코스",
    epilogue: "모든 단서를 모았군! 그대는 오늘부로 명예 사관이오. 다음 주, 세종대왕의 비밀 편지가 그대를 기다리오."
  }
};

const formatMs = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export default function EndingPage() {
  return (
    <MobileLayout>
      <div className="flex flex-1 flex-col gap-4 px-5 py-4 pb-6">
        <h1 className="text-[32px] font-extrabold text-seoul-text">임무 완수</h1>
        
        {/* Time Result Card - Schema 데이터 기반 */}
        <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4 shadow-[4px_4px_0px_0px_rgba(45,42,38,1)]">
          <CardContent className="p-0 flex flex-col gap-1.5 items-start">
            <span className="text-[13px] font-bold text-seoul-muted uppercase tracking-tight">클리어 타임</span>
            <span className="text-[42px] font-extrabold text-seoul-text leading-tight">
              {formatMs(mockAttemptResult.clearTimeMs || 0)}
            </span>
            <div className="flex gap-2">
               <Badge className="bg-seoul-text text-seoul-card rounded-none px-2.5 py-1 text-[11px] font-bold">
                 전체 14위
               </Badge>
               <Badge variant="outline" className="border-seoul-text rounded-none px-2.5 py-1 text-[11px] font-bold">
                 {mockAttemptResult.status}
               </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Epilogue Card - Course 데이터 기반 */}
        <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4">
          <CardContent className="p-0 flex flex-col gap-2">
            <h3 className="text-[15px] font-bold text-seoul-text">에필로그</h3>
            <p className="text-[14px] font-medium leading-[1.45] text-seoul-text">
              {mockAttemptResult.course.epilogue}
            </p>
          </CardContent>
        </Card>

        {/* SNS Share */}
        <Card className="border-[3px] border-seoul-text rounded-none bg-seoul-muted p-3.5 h-[180px] flex flex-col gap-2.5 shadow-[3px_3px_0px_0px_rgba(45,42,38,1)]">
          <span className="text-[13px] font-bold text-seoul-muted-foreground">결과 요약 이미지 미리보기</span>
          <div className="flex flex-1 items-center justify-center bg-white border border-dashed border-seoul-muted-foreground text-[14px] font-semibold text-seoul-muted-foreground">
            SNS 카드 자동 생성
          </div>
        </Card>

        <div className="mt-auto flex flex-col gap-3 pt-4">
          <Button className="h-[50px] bg-seoul-text text-seoul-card rounded-none font-bold text-[15px] shadow-[3px_3px_0px_0px_rgba(196,99,78,1)]">
            인스타그램 공유
          </Button>
          <Button variant="secondary" className="h-[46px] border border-seoul-text rounded-none font-bold text-[14px] shadow-[2px_2px_0px_0px_rgba(45,42,38,1)]">
            다음 코스 도전
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
