"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MobileLayout from "@/components/mobile-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuestStore } from "@/hooks/use-quest-store";

export default function LoginPage() {
  const router = useRouter();
  const { handleLogin, isLoading } = useAuth();
  const startQuest = useQuestStore((state) => state.startQuest);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async () => {
    const res = await handleLogin({ nickname, password });
    if (res) {
      router.push("/courses");
    }
  };

  return (
    <MobileLayout>
      <div className="flex flex-1 flex-col gap-6 px-5 py-[20px] pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-[42px] font-extrabold leading-[0.9] tracking-[-2px] text-seoul-text">
            한양 성문을 열어라
          </h1>
          <p className="text-[14px] font-medium leading-[1.4] text-[#5C5852]">
            조선의 길잡이와 함께
            <br />
            역사 코스 탐험을 시작하시오.
          </p>
        </div>

        <div className="flex flex-col gap-2 border-[3px] border-seoul-text bg-seoul-accent p-4 shadow-[4px_4px_0px_0px_rgba(45,42,38,1)]">
          <span className="text-[10px] font-bold tracking-widest text-seoul-card uppercase">
            이번 주 AI 추천 코스
          </span>
          <h2 className="text-[18px] font-extrabold text-white">
            정조의 발자취: 창덕궁 밤행차
          </h2>
          <p className="text-[13px] font-medium leading-[1.4] text-seoul-card">
            도성 수문장이 남긴 비밀 기록을 따라 85분 탐험
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-widest text-seoul-muted uppercase">
              이름 없는 탐험가 명부
            </label>
            <Input 
              placeholder="이메일 혹은 별호" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="h-14 border-[3px] border-seoul-text bg-white px-4 text-base rounded-none focus-visible:ring-0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-widest text-seoul-muted uppercase">
              암호 문장
            </label>
            <Input 
              type="password"
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 border-[3px] border-seoul-text bg-white px-4 text-base rounded-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <Button 
            onClick={onLogin}
            disabled={isLoading}
            className="h-14 border-[3px] border-seoul-text bg-seoul-text text-seoul-card hover:bg-seoul-text/90 text-base font-bold rounded-none"
          >
            {isLoading ? "문 여는 중..." : "탐험 시작"}
          </Button>
          <Button 
            variant="secondary"
            className="h-14 border-[3px] border-seoul-text text-base font-bold rounded-none shadow-[2px_2px_0px_0px_rgba(45,42,38,1)]"
          >
            신입 수문군 등록
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
