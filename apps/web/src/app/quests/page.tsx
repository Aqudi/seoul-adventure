"use client";

import { useRouter, useSearchParams } from "next/navigation";
import MobileLayout from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";
import TimerDisplay from "@/components/timer-display";

const stepData: Record<number, any> = {
  1: {
    chapter: "CHAPTER 01",
    title: "숙정문의 부름",
    desc: "북쪽 성곽의 시작점에서 조선의 방어 체계를 확인하십시오.",
    npc: "[안내관] 이곳은 숙정문이오. 성문의 현판 아래에서 첫 번째 단서를 찾으시오.",
    user: "[나] 현판을 확인했어요. 이제 무엇을 하면 되죠?"
  },
  2: {
    chapter: "CHAPTER 02",
    title: "광화문 앞 숨은 암호",
    desc: "시나리오 대화를 통해 단서를 수집하고, 현장에서 인증해 다음 스테이지를 열어보세요.",
    npc: "[왕실 사관] 돌계단 세 번째 단 아래를 확인하시오. 암호는 문양의 순서에 있다.",
    user: "[나] 확인했어요. 바로 현장 인증할게요."
  },
  3: {
    chapter: "CHAPTER 03",
    title: "해태의 눈빛",
    desc: "도성을 지키는 영험한 동물의 시선을 따라가 보십시오.",
    npc: "[왕실 사관] 해태의 눈이 향하는 곳에 서재의 열쇠가 숨겨져 있소.",
    user: "[나] 해태상 앞에 도착했습니다. 사진을 찍어 보낼게요."
  },
  4: {
    chapter: "CHAPTER 04",
    title: "마지막 기록, 경회루",
    desc: "사라진 의궤의 마지막 페이지가 이곳 어딘가에 남아있습니다.",
    npc: "[영의정] 고생 많았소. 경회루의 연못에 비친 달그림자를 기록으로 남기시오.",
    user: "[나] 모든 단서를 찾았습니다. 임무를 완수하겠습니다!"
  }
};

function QuestMainContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = parseInt(searchParams.get("step") || "1");
  const currentData = stepData[step] || stepData[1];

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-0 pb-6 bg-[#F5F2ED]">
      {/* Header */}
      <div className="flex flex-col gap-2 pt-4 shrink-0">
        <h1 className="text-[42px] font-extrabold leading-[0.9] tracking-[-2px] text-seoul-text">
          퀘스트 메인
        </h1>
        <p className="text-[13px] font-medium text-[#5C5852]">
          조선왕실톡 시나리오 진행 중
        </p>
        <div className="flex items-center justify-between">
          <Badge className="h-[30px] w-[80px] justify-center border-2 border-seoul-text bg-seoul-accent rounded-none p-0 text-[12px] font-extrabold tracking-widest text-seoul-card">
            {step} / 4
          </Badge>
          <TimerDisplay />
        </div>
      </div>

      {/* Chapter Card */}
      <Card className="flex flex-col gap-2 border-[3px] border-seoul-text bg-white p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(45,42,38,1)]">
        <span className="text-[10px] font-bold tracking-widest text-seoul-muted uppercase">{currentData.chapter}</span>
        <h2 className="text-[18px] font-extrabold text-seoul-text">{currentData.title}</h2>
        <p className="text-[13px] font-medium leading-[1.4] text-[#5C5852]">
          {currentData.desc}
        </p>
      </Card>

      {/* Dialog Section */}
      <Card className="flex flex-1 flex-col gap-3 border-[3px] border-seoul-text bg-white p-4 rounded-none">
        <span className="text-[14px] font-bold text-seoul-text">시나리오 대화</span>
        
        <div className="flex flex-col gap-2 border-2 border-seoul-text bg-[#EBE8E3] p-3">
           <p className="text-[13px] font-medium leading-[1.4] text-seoul-text">
            {currentData.npc}
           </p>
        </div>

        <div className="flex flex-col gap-2 border-2 border-seoul-text bg-seoul-accent p-3 ml-4">
           <p className="text-[13px] font-medium leading-[1.4] text-seoul-card">
            {currentData.user}
           </p>
        </div>
      </Card>

      {/* CTA Buttons */}
      <div className="flex h-12 gap-3 mt-auto">
        <Button variant="secondary" onClick={() => router.push("/detail")} className="flex-1 border-[3px] border-seoul-text rounded-none font-bold text-[14px] h-full shadow-[2px_2px_0px_0px_rgba(45,42,38,1)]">
          코스보기
        </Button>
        <Button onClick={() => router.push(`/quests/verify?step=${step}`)} className="flex-1 bg-[#7A9B76] text-white border-[3px] border-seoul-text rounded-none font-bold text-[14px] h-full shadow-[2px_2px_0px_0px_rgba(45,42,38,1)]">
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
