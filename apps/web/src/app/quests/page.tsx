"use client";

import { useRouter, useSearchParams } from "next/navigation";
import MobileLayout from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Suspense, useMemo, useEffect } from "react";
import TimerDisplay from "@/components/timer-display";
import { useAttempt } from "@/hooks/use-attempts";
import { DetailSkeleton } from "@/components/page-skeletons";
import { useQuestStore } from "@/hooks/use-quest-store";

function QuestMainContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = parseInt(searchParams.get("step") || "1");
  const attemptId = searchParams.get("attemptId");
  const courseId = searchParams.get("courseId");

  const { data: attempt, isLoading, error } = useAttempt(attemptId || undefined);
  const { startQuest, startTime } = useQuestStore();

  // 1단계 진입 시 타이머 시작 (아직 시작되지 않았을 때만)
  useEffect(() => {
    if (step === 1 && attemptId && !startTime) {
      startQuest(attemptId);
    }
  }, [step, attemptId, startTime, startQuest]);

  // 스키마 구조 분석 결과: attempt.questStates 내부에 quest 정보가 있음
  const currentQuest = useMemo(() => {
    if (!attempt?.questStates) return null;
    // questStates에서 order가 현재 step과 일치하는 항목을 찾음
    const state = attempt.questStates.find(qs => qs.quest.order === step);
    return state ? state.quest : null;
  }, [attempt, step]);

  if (isLoading) {
    return (
      <div className="flex flex-1 px-6 py-4">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !attempt || !currentQuest) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-10 text-center gap-4">
        <p className="font-bold text-seoul-text">전령이 소식을 가져오지 못했소. (데이터 오류)</p>
        <p className="text-[12px] text-seoul-muted">
          {!attempt ? "시도 정보를 찾을 수 없음" : !currentQuest ? `${step}단계 퀘스트 정보를 찾을 수 없음` : "알 수 없는 오류"}
        </p>
        <Button onClick={() => router.push("/courses")}>목록으로</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-0 pb-6 bg-[#F5F2ED]">
      {/* Header */}
      <div className="flex flex-col gap-2 pt-4 shrink-0">
        <h1 className="text-[42px] font-extrabold leading-[0.9] tracking-[-2px] text-seoul-text">
          {attempt.course?.title || "퀘스트 진행"}
        </h1>
        <p className="text-[13px] font-medium text-[#5C5852]">
          {attempt.course?.theme} · 시나리오 진행 중
        </p>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge className="h-[30px] w-[80px] justify-center border-2 border-seoul-text bg-seoul-accent rounded-none p-0 text-[12px] font-extrabold tracking-widest text-seoul-card">
              {step} / {attempt.questStates.length}
            </Badge>
          </div>
          <TimerDisplay />
        </div>
      </div>

      {/* Chapter Card */}
      <Card className="flex flex-col gap-2 border-[3px] border-seoul-text bg-white p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(45,42,38,1)]">
        <span className="text-[10px] font-bold tracking-widest text-seoul-muted uppercase">CHAPTER 0{step}</span>
        <h2 className="text-[18px] font-extrabold text-seoul-text">
          {currentQuest.place?.name || "숨겨진 장소"}
        </h2>
        <p className="text-[13px] font-medium leading-[1.4] text-[#5C5852]">
          {currentQuest.instruction}
        </p>
      </Card>

      {/* Dialog Section */}
      <Card className="flex flex-1 flex-col gap-3 border-[3px] border-seoul-text bg-white p-4 rounded-none overflow-hidden">
        <span className="text-[14px] font-bold text-seoul-text text-center border-b-2 border-seoul-text pb-2">탐험톡</span>
        
        <div className="flex flex-col gap-4 py-2 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-seoul-muted px-1">안내관</span>
            <div className="border-2 border-seoul-text bg-[#EBE8E3] p-3 rounded-none mr-8">
               <p className="text-[13px] font-medium leading-[1.4] text-seoul-text">
                {currentQuest.narrativeText}
               </p>
            </div>
          </div>

          <div className="flex flex-col gap-1 items-end">
            <span className="text-[10px] font-bold text-seoul-muted px-1">나</span>
            <div className="border-2 border-seoul-text bg-seoul-accent p-3 rounded-none ml-8">
               <p className="text-[13px] font-medium leading-[1.4] text-seoul-card">
                확인했습니다. 지금 즉시 그곳으로 가서 조치를 취하겠습니다.
               </p>
            </div>
          </div>
        </div>
      </Card>

      {/* CTA Buttons */}
      <div className="flex h-12 gap-3 mt-auto shrink-0">
        <Button 
          variant="secondary" 
          onClick={() => router.push(`/courses/${courseId}`)} 
          className="flex-1 border-[3px] border-seoul-text rounded-none font-bold text-[14px] h-full shadow-[2px_2px_0px_0px_rgba(45,42,38,1)]"
        >
          코스보기
        </Button>
        <Button 
          onClick={() => router.push(`/quests/verify?step=${step}&courseId=${courseId}&attemptId=${attemptId}`)} 
          className="flex-1 bg-[#7A9B76] text-white border-[3px] border-seoul-text rounded-none font-bold text-[14px] h-full shadow-[2px_2px_0px_0px_rgba(45,42,38,1)]"
        >
          인증하기
        </Button>
      </div>
    </div>
  );
}

export default function QuestMainPage() {
  return (
    <MobileLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <QuestMainContent />
      </Suspense>
    </MobileLayout>
  );
}
