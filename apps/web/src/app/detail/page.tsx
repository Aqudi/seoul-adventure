"use client";

import { useRouter } from "next/navigation";
import MobileLayout from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GoogleMapView from "@/components/google-map-view";

export default function CourseDetailPage() {
  const router = useRouter();

  // 예시 좌표: 숙정문 주변
  const courseSpots = [
    { lat: 37.5956, lng: 126.9811, title: "숙정문" },
    { lat: 37.5925, lng: 126.9850, title: "북악산 성곽" },
    { lat: 37.5890, lng: 126.9830, title: "창의문 방면" },
  ];

  return (
    <MobileLayout>
      <div className="flex flex-1 flex-col gap-6 px-6 py-0 pb-6 bg-[#F5F2ED]">
        {/* Header */}
        <div className="flex flex-col gap-2 pt-4 shrink-0">
          <h1 className="text-[42px] font-extrabold leading-[0.9] tracking-[-2px] text-seoul-text">
            한양 도성 북문 코스
          </h1>
          <p className="text-[13px] font-medium text-[#5C5852]">
            조선왕실톡 프롤로그와 함께 4단계 탐험
          </p>
          <Badge variant="outline" className="h-[30px] w-[72px] justify-center border-2 border-seoul-text bg-[#EBE8E3] rounded-none p-0 text-[12px] font-extrabold tracking-widest text-seoul-text">
            1 / 4
          </Badge>
        </div>

        {/* Route Preview with Real Map */}
        <Card className="flex h-[240px] flex-col gap-3 border-[3px] border-seoul-text bg-white p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(45,42,38,1)] overflow-hidden shrink-0">
          <h3 className="text-[18px] font-extrabold text-seoul-text">코스 경로 미리보기</h3>
          <div className="flex-1 bg-[#EBE8E3] border-2 border-seoul-text overflow-hidden relative">
             {/* Google Map View */}
             <GoogleMapView spots={courseSpots} className="w-full h-full" />
             
             {/* Fallback info when API key is missing */}
             <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] p-1 px-2 pointer-events-none">
                API Key required
             </div>
          </div>
        </Card>

        {/* Prologue Card */}
        <Card className="flex flex-col gap-2 border-[3px] border-seoul-text bg-white p-4 rounded-none shrink-0">
          <span className="text-[10px] font-bold tracking-widest text-seoul-muted uppercase">조선왕실톡 PROLOGUE</span>
          <p className="text-[14px] font-medium leading-[1.4] text-seoul-text">
            왕실 서고에서 사라진 의궤 단서를 찾으라. 성문마다 남은 기록을 복원해 보자.
          </p>
        </Card>

        {/* Dialog Preview */}
        <Card className="flex flex-col gap-2.5 border-[3px] border-seoul-text bg-white p-3 rounded-none shrink-0">
          <div className="text-[13px] font-medium leading-[1.4] text-seoul-text">
            [안내관] 첫 번째 관문은 숙정문. 지도를 따라 북쪽 성곽으로 이동하세요.
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
