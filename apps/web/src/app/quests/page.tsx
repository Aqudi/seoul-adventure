"use client";

import { useRouter } from "next/navigation";
import MobileLayout from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function QuestMainPage() {
  const router = useRouter();

  return (
    <MobileLayout>
      <div className="flex flex-1 flex-col gap-6 px-6 py-0 pb-6 bg-[#F5F2ED]">
        {/* Header */}
        <div className="flex flex-col gap-2 pt-4">
          <h1 className="text-[42px] font-extrabold leading-[0.9] tracking-[-2px] text-seoul-text">
            퀘스트 메인
          </h1>
          <p className="text-[13px] font-medium text-[#5C5852]">
            조선왕실톡 시나리오 진행 중
          </p>
          <Badge className="h-[30px] w-[80px] justify-center border-2 border-seoul-text bg-seoul-accent rounded-none p-0 text-[12px] font-extrabold tracking-widest text-seoul-card">
            2 / 4
          </Badge>
        </div>

        {/* Chapter Card */}
        <Card className="flex flex-col gap-2 border-[3px] border-seoul-text bg-white p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(45,42,38,1)]">
          <span className="text-[10px] font-bold tracking-widest text-seoul-muted uppercase">CHAPTER 02</span>
          <h2 className="text-[18px] font-extrabold text-seoul-text">광화문 앞 숨은 암호</h2>
          <p className="text-[13px] font-medium leading-[1.4] text-[#5C5852]">
            시나리오 대화를 통해 단서를 수집하고, 현장에서 인증해 다음 스테이지를 열어보세요.
          </p>
        </Card>

        {/* Dialog Section */}
        <Card className="flex flex-1 flex-col gap-3 border-[3px] border-seoul-text bg-white p-4 rounded-none">
          <span className="text-[14px] font-bold text-seoul-text">시나리오 대화</span>
          
          {/* NPC Bubble */}
          <div className="flex flex-col gap-2 border-2 border-seoul-text bg-[#EBE8E3] p-3">
             <p className="text-[13px] font-medium leading-[1.4] text-seoul-text">
              [왕실 사관] 돌계단 세 번째 단 아래를 확인하시오. 암호는 문양의 순서에 있다.
             </p>
          </div>

          {/* User Bubble */}
          <div className="flex flex-col gap-2 border-2 border-seoul-text bg-seoul-accent p-3 ml-4">
             <p className="text-[13px] font-medium leading-[1.4] text-seoul-card">
              [나] 확인했어요. 바로 현장 인증할게요.
             </p>
          </div>
        </Card>

        {/* CTA Buttons */}
        <div className="flex h-12 gap-3 mt-auto">
          <Button variant="secondary" onClick={() => router.push("/detail")} className="flex-1 border-[3px] border-seoul-text rounded-none font-bold text-[14px] h-full shadow-[2px_2px_0px_0px_rgba(45,42,38,1)]">
            코스보기
          </Button>
          <Button onClick={() => router.push("/quests/verify")} className="flex-1 bg-[#7A9B76] text-white border-[3px] border-seoul-text rounded-none font-bold text-[14px] h-full shadow-[2px_2px_0px_0px_rgba(45,42,38,1)]">
            인증하기
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
