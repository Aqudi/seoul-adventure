import MobileLayout, { StatusBar } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EndingPage() {
  return (
    <MobileLayout>
      <StatusBar />
      <div className="flex flex-1 flex-col gap-4 px-5 py-4 pb-6">
        <h1 className="text-[32px] font-extrabold text-seoul-text">임무 완수</h1>
        
        {/* Time Result Card */}
        <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4 shadow-[4px_4px_0px_0px_rgba(45,42,38,1)]">
          <CardContent className="p-0 flex flex-col gap-1.5 items-start">
            <span className="text-[13px] font-bold text-seoul-muted uppercase">클리어 타임</span>
            <span className="text-[42px] font-extrabold text-seoul-text leading-tight">00:27:43</span>
            <Badge className="bg-seoul-text text-seoul-card rounded-none px-2.5 py-1 text-[11px] font-bold">
              전체 14위
            </Badge>
          </CardContent>
        </Card>

        {/* Epilogue Card */}
        <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4">
          <CardContent className="p-0 flex flex-col gap-2">
            <h3 className="text-[15px] font-bold text-seoul-text">에필로그</h3>
            <p className="text-[14px] font-medium leading-[1.45] text-seoul-text">
              모든 단서를 모았군! 그대는 오늘부로 명예 사관이오. 다음 주, 세종대왕의 비밀 편지가 그대를 기다리오.
            </p>
          </CardContent>
        </Card>

        {/* Share Card */}
        <Card className="border-[3px] border-seoul-text rounded-none bg-seoul-muted p-3.5 h-[180px] flex flex-col gap-2.5">
          <span className="text-[13px] font-bold text-seoul-muted-foreground">결과 요약 이미지 미리보기</span>
          <div className="flex flex-1 items-center justify-center bg-white border border-dashed border-seoul-muted-foreground text-[14px] font-semibold text-seoul-muted-foreground">
            SNS 카드 자동 생성
          </div>
        </Card>

        <div className="mt-auto flex flex-col gap-3 pt-4">
          <Button className="h-[50px] bg-seoul-text text-seoul-card rounded-none font-bold text-[15px] shadow-[3px_3px_0px_0px_rgba(196,99,78,1)]">
            인스타그램 공유
          </Button>
          <Button variant="secondary" className="h-[46px] border border-seoul-text rounded-none font-bold text-[14px] shadow-[2px_2px_0px_0px_rgba(45,42,38,1)]">
            다음 코스 도전
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
