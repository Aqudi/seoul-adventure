"use client";

import { useRouter } from "next/navigation";
import MobileLayout from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GoogleMapView from "@/components/google-map-view";

import { DetailSkeleton } from "@/components/page-skeletons";

// @seoul-advanture/schemas의 CourseDetailResponseSchema 기반 데이터
const mockCourseDetail = {
  id: "c1",
  title: "한양 도성 북문 코스",
  theme: "조선 왕실의 권위",
  weekKey: "2024-W09",
  estimatedDuration: 48,
  difficulty: "MEDIUM" as const,
  prologue: "왕실 서고에서 사라진 의궤 단서를 찾으라. 성문마다 남은 기록을 복원해 보자.",
  epilogue: "모든 단서를 모았군! 그대는 오늘부로 명예 사관이오.",
  isActive: true,
  createdAt: new Date().toISOString(),
  places: [
    { id: "cp1", order: 1, place: { id: "p1", name: "숙정문", lat: 37.5956, lng: 126.9811, landmarkNames: ["숙정문"] } },
    { id: "cp2", order: 2, place: { id: "p2", name: "북악산 성곽", lat: 37.5925, lng: 126.9850, landmarkNames: ["성곽길"] } },
    { id: "cp3", order: 3, place: { id: "p3", name: "창의문", lat: 37.5890, lng: 126.9830, landmarkNames: ["창의문"] } },
  ],
  quests: [
    { id: "q1", order: 1, type: "PHOTO" as const, narrativeText: "[안내관] 첫 번째 관문은 숙정문. 지도를 따라 북쪽 성곽으로 이동하세요.", instruction: "숙정문을 배경으로 셀카를 찍으시오.", mapHint: "북악산 정상 부근" },
  ]
};

export default function CourseDetailPage() {
  const router = useRouter();
  
  // 실제로는 useCourseDetail("c1") 등을 호출하여 loading 상태 확인 가능
  const isLoading = false; // 현재 목데이터이므로 false

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex flex-1 px-6 py-4">
          <DetailSkeleton />
        </div>
      </MobileLayout>
    );
  }
  
  const courseSpots = mockCourseDetail.places.map(cp => ({
    lat: cp.place.lat,
    lng: cp.place.lng,
    title: cp.place.name
  }));

  const difficultyMap = {
    EASY: "하",
    MEDIUM: "중",
    HARD: "상"
  };

  return (
    <MobileLayout>
      <div className="flex flex-1 flex-col gap-6 px-6 py-0 pb-6 bg-[#F5F2ED]">
        {/* Header */}
        <div className="flex flex-col gap-2 pt-4 shrink-0">
          <h1 className="text-[42px] font-extrabold leading-[0.9] tracking-[-2px] text-seoul-text">
            {mockCourseDetail.title}
          </h1>
          <p className="text-[13px] font-medium text-[#5C5852]">
            {mockCourseDetail.quests[0].narrativeText.split('.')[0]}와 함께 4단계 탐험
          </p>
          <div className="flex gap-2">
            <Badge variant="outline" className="h-[30px] px-4 justify-center border-2 border-seoul-text bg-[#EBE8E3] rounded-none p-0 text-[12px] font-extrabold tracking-widest text-seoul-text">
              1 / 4
            </Badge>
            <Badge variant="outline" className="h-[30px] px-4 justify-center border-2 border-seoul-text bg-seoul-accent rounded-none p-0 text-[12px] font-extrabold tracking-widest text-white">
              난이도 {difficultyMap[mockCourseDetail.difficulty]}
            </Badge>
          </div>
        </div>

        {/* Route Preview */}
        <Card className="flex h-[240px] flex-col gap-3 border-[3px] border-seoul-text bg-white p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(45,42,38,1)] overflow-hidden shrink-0">
          <h3 className="text-[18px] font-extrabold text-seoul-text">코스 경로 미리보기</h3>
          <div className="flex-1 bg-[#EBE8E3] border-2 border-seoul-text overflow-hidden relative">
             <GoogleMapView spots={courseSpots} className="w-full h-full" />
             <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] p-1 px-2 pointer-events-none">
                API Key required
             </div>
          </div>
        </Card>

        {/* Prologue Card */}
        <Card className="flex flex-col gap-2 border-[3px] border-seoul-text bg-white p-4 rounded-none shrink-0">
          <span className="text-[10px] font-bold tracking-widest text-seoul-muted uppercase">조선왕실톡 PROLOGUE</span>
          <p className="text-[14px] font-medium leading-[1.4] text-seoul-text">
            {mockCourseDetail.prologue}
          </p>
        </Card>

        {/* Dialog Preview */}
        <Card className="flex flex-col gap-2.5 border-[3px] border-seoul-text bg-white p-3 rounded-none shrink-0">
          <div className="text-[13px] font-medium leading-[1.4] text-seoul-text">
            {mockCourseDetail.quests[0].narrativeText}
          </div>
          <div className="text-[13px] font-medium leading-[1.4] text-[#5C5852]">
            [나] 확인! 지금 위치에서 지도 열고 이동할게요.
          </div>
        </Card>

        {/* CTA Buttons */}
        <div className="flex h-12 gap-3 mt-auto shrink-0">
          <Button 
            variant="secondary" 
            onClick={() => router.back()}
            className="flex-1 border-[3px] border-seoul-text rounded-none font-bold text-[14px] h-full shadow-[2px_2px_0px_0px_rgba(45,42,38,1)]"
          >
            뒤로가기
          </Button>
          <Button 
            onClick={() => router.push("/quests")}
            className="flex-1 bg-seoul-accent text-white border-[3px] border-seoul-text rounded-none font-bold text-[14px] h-full shadow-[2px_2px_0px_0px_rgba(45,42,38,1)]"
          >
            인증하기
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
