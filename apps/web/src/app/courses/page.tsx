"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import GoogleMapView from "@/components/google-map-view";
import { useCourses } from "@/hooks/use-courses";
import { CardListSkeleton, HeaderSkeleton } from "@/components/page-skeletons";

import { useQuestStore } from "@/hooks/use-quest-store";

function CoursesContent() {
  const router = useRouter();
  const startQuest = useQuestStore((state) => state.startQuest);
  const [activeTab, setActiveTab] = useState<"map" | "list">("list");
  
  const { data: courses, isLoading } = useCourses();

  const onSelectCourse = (id: string) => {
    router.push(`/courses/${id}`); // ID를 포함한 경로로 이동 (타이머 시작 안함)
  };

  const difficultyMap = {
    EASY: "하",
    MEDIUM: "중",
    HARD: "상"
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 px-5 py-4">
        <HeaderSkeleton />
        <CardListSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 py-4 pb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-end justify-between shrink-0">
        <h1 className="text-[42px] font-extrabold leading-[0.9] tracking-[-2px] text-seoul-text">
          코스를 고르시오
        </h1>
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-10 w-10 border-[3px] border-seoul-text rounded-none bg-[#EBE8E3] active:scale-95 transition-transform"
          onClick={() => alert("새로운 전령이 도착하지 않았소.")}
        >
          종
        </Button>
      </div>

      {/* AI Banner */}
      <Card className="border-[3px] border-seoul-text bg-seoul-accent p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(45,42,38,1)] shrink-0">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold tracking-widest text-seoul-card uppercase">
            이번 주 AI 추천 코스
          </span>
          <h2 className="text-[18px] font-extrabold text-white">
            세종의 비밀 지령: 한양 도성 북방 순례
          </h2>
          <p className="text-[13px] font-medium leading-[1.4] text-seoul-card">
            지도와 목록을 오가며 조선 관청의 흔적을 92분에 수집하시오
          </p>
        </div>
      </Card>

      {/* Toggle Tab */}
      <div className="flex h-14 w-full gap-2 border-[3px] border-seoul-text bg-white p-1 shrink-0">
        <Button 
          onClick={() => setActiveTab("map")}
          className={`flex-1 rounded-none h-full font-bold transition-colors ${
            activeTab === "map" ? "bg-seoul-text text-seoul-card" : "bg-transparent text-seoul-text hover:bg-black/5"
          }`}
        >
          지도
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => setActiveTab("list")}
          className={`flex-1 rounded-none h-full font-bold transition-colors ${
            activeTab === "list" ? "bg-seoul-text text-seoul-card" : "bg-[#EBE8E3] text-seoul-text"
          }`}
        >
          리스트
        </Button>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-hidden relative border-[3px] border-seoul-text bg-white">
          {activeTab === "list" ? (
            <div className="flex flex-col gap-3 p-4 h-full overflow-y-auto">
              {courses.map((course) => (
                <Card 
                  key={course.id} 
                  onClick={() => onSelectCourse(course.id)}
                  className="border-[3px] border-seoul-text rounded-none shadow-[3px_3px_0px_0px_rgba(45,42,38,1)] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(45,42,38,1)] transition-all cursor-pointer bg-white"
                >
                  <CardHeader className="p-4 space-y-2">
                    <CardTitle className="text-[18px] font-extrabold text-seoul-text">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-[13px] font-medium text-[#5C5852]">
                      난이도: {difficultyMap[course.difficulty as keyof typeof difficultyMap]} · 예상 소요: {course.estimatedDuration}분
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="w-full h-full relative">
              <GoogleMapView 
                  spots={courses.map(c => ({ lat: c.places[0].place.lat, lng: c.places[0].place.lng, title: c.title }))} 
                  className="w-full h-full" 
              />
              <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] p-1 px-2 pointer-events-none">
                  지도 전령 대기 중
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <MobileLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <CoursesContent />
      </Suspense>
    </MobileLayout>
  );
}
