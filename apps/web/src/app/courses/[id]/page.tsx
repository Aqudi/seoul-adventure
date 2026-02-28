"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import MobileLayout from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GoogleMapView from "@/components/google-map-view";
import TimerDisplay from "@/components/timer-display";
import { useCourseDetail } from "@/hooks/use-courses";
import { useAttempt } from "@/hooks/use-attempts";
import { useQuestStore } from "@/hooks/use-quest-store";
import { DetailSkeleton } from "@/components/page-skeletons";
import { Loader2 } from "lucide-react";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { data: course, isLoading: isCourseLoading, error } = useCourseDetail(id);
  const { handleStart, isLoading: isStarting } = useAttempt();
  const startTimer = useQuestStore((state) => state.startQuest);

  const difficultyMap = {
    EASY: "하",
    MEDIUM: "중",
    HARD: "상"
  };

  const onStartAdventure = async () => {
    if (!id) return;
    
    // 1. 서버에 탐험 시작 요청
    const res = await handleStart({ courseId: id });
    
    if (res) {
      // 2. 로컬 타이머 및 시도 ID 저장
      startTimer(res.id);
      // 3. 발급받은 attemptId와 함께 퀘스트 페이지로 이동
      router.push(`/quests?step=1&courseId=${id}&attemptId=${res.id}`);
    } else {
      alert("성문지기가 입장을 불허했소. (서버 연결 실패)");
    }
  };

  if (isCourseLoading) {
    return (
      <MobileLayout>
        <div className="flex flex-1 px-6 py-4">
          <DetailSkeleton />
        </div>
      </MobileLayout>
    );
  }

  if (error || !course) {
    return (
      <MobileLayout>
        <div className="flex flex-1 flex-col items-center justify-center p-10 text-center gap-4">
          <p className="font-bold text-seoul-text text-lg">존재하지 않거나 비공개된 코스이오.</p>
          <Button 
            className="border-[3px] border-seoul-text rounded-none font-bold"
            onClick={() => router.push("/courses")}
          >
            목록으로 돌아가기
          </Button>
        </div>
      </MobileLayout>
    );
  }
  
  const courseSpots = course.places.map(cp => ({
    lat: cp.place.lat,
    lng: cp.place.lng,
    title: cp.place.name
  }));

  return (
    <MobileLayout>
      <div className="flex flex-1 flex-col gap-6 px-6 py-0 pb-6 bg-[#F5F2ED]">
        {/* Header */}
        <div className="flex flex-col gap-2 pt-4 shrink-0">
          <h1 className="text-[42px] font-extrabold leading-[0.9] tracking-[-2px] text-seoul-text">
            {course.title}
          </h1>
          <p className="text-[13px] font-medium text-[#5C5852]">
            {course.theme} · 4단계 탐험
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline" className="h-[30px] px-4 justify-center border-2 border-seoul-text bg-[#EBE8E3] rounded-none p-0 text-[12px] font-extrabold tracking-widest text-seoul-text">
                준비 단계
              </Badge>
              <Badge variant="outline" className="h-[30px] px-4 justify-center border-2 border-seoul-text bg-seoul-accent rounded-none p-0 text-[12px] font-extrabold tracking-widest text-white">
                난이도 {difficultyMap[course.difficulty as keyof typeof difficultyMap]}
              </Badge>
            </div>
            <TimerDisplay />
          </div>
        </div>

        {/* Route Preview */}
        <Card className="flex h-[240px] flex-col gap-3 border-[3px] border-seoul-text bg-white p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(45,42,38,1)] overflow-hidden shrink-0">
          <h3 className="text-[18px] font-extrabold text-seoul-text">코스 경로 미리보기</h3>
          <div className="flex-1 bg-[#EBE8E3] border-2 border-seoul-text overflow-hidden relative">
             <GoogleMapView spots={courseSpots} className="w-full h-full" />
          </div>
        </Card>

        {/* Prologue Card */}
        <Card className="flex flex-col gap-2 border-[3px] border-seoul-text bg-white p-4 rounded-none shrink-0">
          <span className="text-[10px] font-bold tracking-widest text-seoul-muted uppercase">조선왕실톡 PROLOGUE</span>
          <p className="text-[14px] font-medium leading-[1.4] text-seoul-text">
            {course.prologue}
          </p>
        </Card>

        {/* Dialog Preview */}
        <Card className="flex flex-col gap-2.5 border-[3px] border-seoul-text bg-white p-3 rounded-none shrink-0">
          <div className="text-[13px] font-medium leading-[1.4] text-seoul-text">
            {course.quests[0]?.narrativeText || "탐험을 시작할 준비가 되었는가?"}
          </div>
          <div className="text-[13px] font-medium leading-[1.4] text-[#5C5852]">
            [나] 확인! 지금 위치에서 지도 열고 이동할게요.
          </div>
        </Card>

        {/* CTA Buttons */}
        <div className="flex h-12 gap-3 mt-auto shrink-0">
          <Button 
            variant="secondary" 
            disabled={isStarting}
            onClick={() => router.push("/courses")}
            className="flex-1 border-[3px] border-seoul-text rounded-none font-bold text-[14px] h-full shadow-[2px_2px_0px_0px_rgba(45,42,38,1)]"
          >
            목록으로
          </Button>
          <Button 
            onClick={onStartAdventure}
            disabled={isStarting}
            className="flex-1 bg-seoul-accent text-white border-[3px] border-seoul-text rounded-none font-bold text-[14px] h-full shadow-[2px_2px_0px_0px_rgba(45,42,38,1)] active:translate-y-0.5"
          >
            {isStarting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>성문 여는 중...</span>
              </div>
            ) : (
              "탐험 시작"
            )}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
