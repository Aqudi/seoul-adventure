"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MobileLayout from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CameraView from "@/components/camera-view";
import { Camera as CameraIcon } from "lucide-react";
import { useQuestStore } from "@/hooks/use-quest-store";

// 스키마의 QuestType 기반으로 각 단계의 미션 타입 정의
const stepConfigs: Record<number, { type: 'PHOTO' | 'ANSWER' | 'GPS_TIME', hint: string }> = {
  1: { type: 'PHOTO', hint: "숙정문 현판이 잘 보이게 찍으시오." },
  2: { type: 'ANSWER', hint: "건립 연도의 마지막 숫자 4자리를 입력하시오." },
  3: { type: 'PHOTO', hint: "해태의 전신이 나오도록 촬영하시오." },
  4: { type: 'ANSWER', hint: "경회루 기둥의 개수를 입력하시오." },
};

function QuestVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = parseInt(searchParams.get("step") || "1");
  const config = stepConfigs[step] || stepConfigs[1];
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const { capturedImages, setCapturedImage } = useQuestStore();
  const capturedImage = capturedImages[step] || null;

  const handleCapture = (blob: Blob) => {
    const imageUrl = URL.createObjectURL(blob);
    setCapturedImage(step, imageUrl);
    setIsCameraOpen(false);
  };

  const onComplete = () => {
    if (step < 4) {
      router.push(`/quests?step=${step + 1}`);
    } else {
      router.push("/ending");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-5 py-4 pb-6 relative">
      <h1 className="text-[32px] font-extrabold text-seoul-text">퀘스트 인증</h1>
      
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="border-2 border-seoul-text rounded-none px-3 py-1.5 text-[12px] font-bold">
          {step} / 4 단계
        </Badge>
        <Badge className="bg-seoul-accent text-white rounded-none border-2 border-seoul-text px-3 py-1.5 text-[12px] font-bold">
          미션 유형: {config.type === 'PHOTO' ? '사진 촬영' : '정답 입력'}
        </Badge>
      </div>

      {/* 스키마의 type에 따라 다른 UI 노출 */}
      {config.type === 'PHOTO' ? (
        <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4 shadow-[4px_4px_0px_0px_rgba(45,42,38,1)]">
          <CardContent className="p-0 flex flex-col gap-3">
            <h3 className="text-[16px] font-bold text-seoul-text">현장 실시간 사진 인증</h3>
            <p className="text-[13px] font-medium text-seoul-muted">{config.hint}</p>
            
            <div 
              onClick={() => setIsCameraOpen(true)}
              className="flex h-[220px] items-center justify-center bg-[#EBE8E3] border-2 border-seoul-text border-dashed cursor-pointer overflow-hidden group relative"
            >
              {capturedImage ? (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-seoul-muted-foreground group-hover:text-seoul-text text-center p-4">
                  <CameraIcon className="h-12 w-12" />
                  <span className="font-semibold text-[14px]">이곳을 터치하여<br/>카메라를 깨우시오</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-seoul-text">AI 분석 일치율</span>
              <Badge className="bg-seoul-text text-seoul-card rounded-none px-2.5 py-1 text-[12px] font-bold">
                {capturedImage ? "92% 일치" : "0%"}
              </Badge>
            </div>
            
            <Button 
              disabled={!capturedImage}
              onClick={onComplete}
              className="h-[56px] bg-seoul-text text-seoul-card rounded-none font-bold text-[16px] w-full mt-2"
            >
              {step === 4 ? "최종 임무 완수" : "인증하고 다음으로"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4 shadow-[4px_4px_0px_0px_rgba(45,42,38,1)]">
          <CardContent className="p-0 flex flex-col gap-4">
            <h3 className="text-[16px] font-bold text-seoul-text">역사 지식 암호 입력</h3>
            <div className="bg-[#EBE8E3] p-4 border-2 border-seoul-text">
               <p className="text-[14px] font-medium leading-[1.6] text-seoul-text italic">
                "{config.hint}"
               </p>
            </div>
            <Input 
              placeholder="정답을 입력하시오" 
              className="h-14 border-2 border-seoul-text rounded-none bg-white px-4 text-[16px] font-bold focus-visible:ring-0"
            />
            <Button 
              onClick={onComplete}
              className="h-[56px] bg-seoul-text text-seoul-card rounded-none font-bold text-[16px] w-full"
            >
              {step === 4 ? "최종 임무 완수" : "암호 확인 및 다음으로"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Fullscreen Camera Modal */}
      {isCameraOpen && (
        <CameraView 
          onCapture={handleCapture} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}
    </div>
  );
}

export default function QuestVerifyPage() {
  return (
    <MobileLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <QuestVerifyContent />
      </Suspense>
    </MobileLayout>
  );
}
