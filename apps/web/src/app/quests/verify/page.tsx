"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CameraView from "@/components/camera-view";
import { Camera as CameraIcon } from "lucide-react";

export default function QuestVerifyPage() {
  const router = useRouter();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = (blob: Blob) => {
    const imageUrl = URL.createObjectURL(blob);
    setCapturedImage(imageUrl);
    setIsCameraOpen(false);
  };

  return (
    <MobileLayout>
      <div className="flex flex-1 flex-col gap-4 px-5 py-4 pb-6 relative">
        <h1 className="text-[32px] font-extrabold text-seoul-text">퀘스트 인증</h1>

        <div className="flex">
          <Badge variant="secondary" className="border-2 border-seoul-text rounded-none px-3 py-1.5 text-[12px] font-bold">
            2 / 4 단계
          </Badge>
        </div>

        <Tabs defaultValue="photo" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-transparent gap-2 p-0">
            <TabsTrigger value="photo" className="data-[state=active]:bg-seoul-text data-[state=active]:text-seoul-card bg-seoul-muted text-seoul-muted-foreground border-seoul-text border-[1px] rounded-none font-bold">
              사진 인증
            </TabsTrigger>
            <TabsTrigger value="password" className="data-[state=active]:bg-seoul-text data-[state=active]:text-seoul-card bg-seoul-muted text-seoul-muted-foreground border-seoul-text border-[1px] rounded-none font-bold">
              비밀번호
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Photo Card */}
        <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4 shadow-[3px_3px_0px_0px_rgba(45,42,38,1)]">
          <CardContent className="p-0 flex flex-col gap-3">
            <h3 className="text-[16px] font-bold text-seoul-text">유형 A · 광화문 해태상 셀카</h3>

            <div
              onClick={() => setIsCameraOpen(true)}
              className="flex h-[180px] items-center justify-center bg-[#EBE8E3] border-2 border-seoul-text border-dashed cursor-pointer overflow-hidden group relative"
            >
              {capturedImage ? (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-seoul-muted-foreground group-hover:text-seoul-text">
                  <CameraIcon className="h-10 w-10" />
                  <span className="font-semibold text-[14px]">여기를 눌러 카메라 열기</span>
                </div>
              )}
              {capturedImage && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white font-bold">다시 찍기</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-seoul-text">AI 랜드마크 일치율</span>
              <Badge className="bg-seoul-text text-seoul-card rounded-none px-2.5 py-1 text-[12px] font-bold">
                {capturedImage ? "92% 일치" : "0%"}
              </Badge>
            </div>

            <Button
              disabled={!capturedImage}
              onClick={() => router.push("/ending")}
              className="h-[46px] bg-seoul-text text-seoul-card rounded-none font-bold text-[14px] w-full"
            >
              사진으로 인증하기
            </Button>
          </CardContent>
        </Card>

        {/* Password Card (Keep as is) */}
        <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4 shadow-[3px_3px_0px_0px_rgba(45,42,38,1)]">
          <CardContent className="p-0 flex flex-col gap-3">
            <h3 className="text-[16px] font-bold text-seoul-text">유형 B · 역사 팩트 비밀번호</h3>
            <p className="text-[13px] font-medium leading-[1.4] text-seoul-muted">
              힌트: 광화문 현판 글자 수 + 출생연도 마지막 숫자
            </p>
            <Input
              placeholder="정답 숫자 입력"
              className="h-12 border border-seoul-text rounded-none bg-white px-3 text-[14px] font-medium focus-visible:ring-0"
            />
            <Button
              onClick={() => router.push("/ending")}
              className="h-[46px] bg-seoul-text text-seoul-card rounded-none font-bold text-[14px] w-full"
            >
              정답 인증하기
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Fullscreen Camera Modal */}
      {isCameraOpen && (
        <CameraView
          onCapture={handleCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </MobileLayout>
  );
}
