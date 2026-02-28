import MobileLayout, { StatusBar } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function QuestVerifyPage() {
  return (
    <MobileLayout>
      <StatusBar />
      <div className="flex flex-1 flex-col gap-4 px-5 py-4 pb-6">
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
        <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4">
          <CardContent className="p-0 flex flex-col gap-3">
            <h3 className="text-[16px] font-bold text-seoul-text">유형 A · 광화문 해태상 셀카</h3>
            <div className="flex h-[140px] items-center justify-center bg-seoul-muted text-seoul-muted-foreground font-semibold text-[14px]">
              카메라 프리뷰
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-seoul-text">AI 랜드마크 일치율</span>
              <Badge className="bg-seoul-text text-seoul-card rounded-none px-2.5 py-1 text-[12px] font-bold">
                92% 일치
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4">
          <CardContent className="p-0 flex flex-col gap-3">
            <h3 className="text-[16px] font-bold text-seoul-text">유형 B · 역사 팩트 비밀번호</h3>
            <p className="text-[13px] font-medium leading-[1.4] text-seoul-muted">
              힌트: 광화문 현판 글자 수 + 출생연도 마지막 숫자
            </p>
            <Input 
              placeholder="정답 숫자 입력" 
              className="h-12 border border-seoul-text rounded-none bg-white px-3 text-[14px] font-medium"
            />
            <Button className="h-[46px] bg-seoul-text text-seoul-card rounded-none font-bold text-[14px] w-full">
              인증하기
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
