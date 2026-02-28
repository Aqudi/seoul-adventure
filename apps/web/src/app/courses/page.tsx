import MobileLayout, { StatusBar, BottomNav } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function CoursesPage() {
  const courses = [
    { title: "경복궁 근정전", info: "난이도: 중 · 예상 소요: 48분" },
    { title: "창경궁 문정전", info: "난이도: 하 · 예상 소요: 36분" },
    { title: "종묘 정전", info: "난이도: 상 · 예상 소요: 62분" },
  ];

  return (
    <MobileLayout>
      <StatusBar />
      <div className="flex flex-1 flex-col gap-6 px-5 py-4 pb-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <h1 className="text-[42px] font-extrabold leading-[0.9] tracking-[-2px] text-seoul-text">
            코스를 고르시오
          </h1>
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-10 w-10 border-[3px] border-seoul-text rounded-none bg-[#EBE8E3]"
          >
            종
          </Button>
        </div>

        {/* AI Banner */}
        <Card className="border-[3px] border-seoul-text bg-seoul-accent p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(45,42,38,1)]">
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

        {/* Toggle Tab - Using Button components */}
        <div className="flex h-14 w-full gap-2 border-[3px] border-seoul-text bg-white p-1">
          <Button className="flex-1 rounded-none bg-seoul-text text-seoul-card h-full font-bold">
            지도
          </Button>
          <Button variant="secondary" className="flex-1 rounded-none h-full font-bold">
            리스트
          </Button>
        </div>

        {/* List using Card component */}
        <div className="flex flex-col gap-3">
          {courses.map((course, idx) => (
            <Card 
              key={idx} 
              className="border-[3px] border-seoul-text rounded-none shadow-[3px_3px_0px_0px_rgba(45,42,38,1)] hover:translate-y-[-2px] transition-transform cursor-pointer"
            >
              <CardHeader className="p-4 space-y-2">
                <CardTitle className="text-[18px] font-extrabold text-seoul-text">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-[13px] font-medium text-[#5C5852]">
                  {course.info}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileLayout>
  );
}
