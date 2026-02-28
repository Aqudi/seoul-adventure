"use client";

import { useState, useRef, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MobileLayout from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import CameraView from "@/components/camera-view";
import { Camera as CameraIcon, MapPin, Loader2, Mic, MicOff, Navigation } from "lucide-react";
import { useQuestStore } from "@/hooks/use-quest-store";
import TimerDisplay from "@/components/timer-display";
import SuccessOverlay from "@/components/success-overlay";
import { useAttempt } from "@/hooks/use-attempts";
import { DetailSkeleton } from "@/components/page-skeletons";

const QUEST_TYPE_LABELS: Record<string, string> = {
  PHOTO: "사진 촬영",
  ANSWER: "정답 입력",
  GPS_TIME: "GPS 체크인",
  VOICE: "음성 인식",
};

function QuestVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = parseInt(searchParams.get("step") || "1");
  const attemptId = searchParams.get("attemptId");
  const courseId = searchParams.get("courseId");

  const { data: attempt, isLoading, handleVerifyAnswer, handleVerifyGps, handleVerifyPhoto } =
    useAttempt(attemptId || undefined);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [answer, setAnswer] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const capturedBlobRef = useRef<Blob | null>(null);
  const { capturedImages, setCapturedData } = useQuestStore();
  const capturedData = capturedImages[step];

  const currentQuest = useMemo(() => {
    if (!attempt?.questStates) return null;
    const state = attempt.questStates.find((qs) => qs.quest.order === step);
    return state ? state.quest : null;
  }, [attempt, step]);

  const handleCapture = (blob: Blob) => {
    capturedBlobRef.current = blob;
    const imageUrl = URL.createObjectURL(blob);
    setIsCameraOpen(false);
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCapturedData(step, {
          imageUrl,
          location: { lat: position.coords.latitude, lng: position.coords.longitude },
        });
        setIsLocating(false);
      },
      () => {
        setCapturedData(step, { imageUrl });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 },
    );
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해 주세요.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsRecording(true);
    setErrorMsg(null);
    recognition.onresult = (e: any) => {
      setAnswer(e.results[0][0].transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => {
      setErrorMsg("음성 인식에 실패했습니다. 다시 시도해 주세요.");
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const handleVerify = async () => {
    if (!currentQuest || !attemptId) return;
    setIsVerifying(true);
    setErrorMsg(null);
    try {
      if (currentQuest.type === "PHOTO") {
        if (!capturedBlobRef.current) return;
        await handleVerifyPhoto(currentQuest.id, capturedBlobRef.current, capturedData?.location);
      } else if (currentQuest.type === "GPS_TIME") {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                await handleVerifyGps(currentQuest.id, {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                });
                resolve();
              } catch (err) {
                reject(err);
              }
            },
            () => reject(new Error("위치 정보를 가져올 수 없습니다.")),
            { enableHighAccuracy: true, timeout: 10000 },
          );
        });
      } else {
        // ANSWER, VOICE 모두 텍스트로 전송
        await handleVerifyAnswer(currentQuest.id, { answer });
      }
      setShowSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "인증에 실패했습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  const isVerifyDisabled = () => {
    if (isVerifying || isLocating) return true;
    if (currentQuest?.type === "PHOTO") return !capturedBlobRef.current;
    if (currentQuest?.type === "GPS_TIME") return false;
    return !answer.trim();
  };

  const onNext = () => {
    setShowSuccess(false);
    capturedBlobRef.current = null;
    setAnswer("");
    if (step < (attempt?.questStates?.length || 4)) {
      router.push(`/quests?step=${step + 1}&courseId=${courseId}&attemptId=${attemptId}`);
    } else {
      router.push("/ending");
    }
  };

  if (isLoading) return <div className="flex flex-1 px-6 py-4"><DetailSkeleton /></div>;

  if (!attempt || !currentQuest) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-10 text-center gap-4">
        <p className="font-bold text-seoul-text text-lg">데이터를 불러올 수 없소.</p>
        <Button onClick={() => router.push("/courses")}>목록으로</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-5 py-4 pb-6 relative">
      <h1 className="text-[32px] font-extrabold text-seoul-text">퀘스트 인증</h1>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge variant="secondary" className="border-2 border-seoul-text rounded-none px-3 py-1.5 text-[12px] font-bold">
            {step} / {attempt.questStates.length} 단계
          </Badge>
          <Badge className="bg-seoul-accent text-white rounded-none border-2 border-seoul-text px-3 py-1.5 text-[12px] font-bold">
            {QUEST_TYPE_LABELS[currentQuest.type] ?? currentQuest.type}
          </Badge>
        </div>
        <TimerDisplay />
      </div>

      {/* ── PHOTO ── */}
      {currentQuest.type === "PHOTO" && (
        <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4 shadow-[4px_4px_0px_0px_rgba(45,42,38,1)]">
          <CardContent className="p-0 flex flex-col gap-3">
            <h3 className="text-[16px] font-bold text-seoul-text">현장 실시간 사진 인증</h3>
            <p className="text-[13px] font-medium text-seoul-muted">{currentQuest.instruction}</p>

            <div
              onClick={() => setIsCameraOpen(true)}
              className="flex h-[240px] items-center justify-center bg-[#EBE8E3] border-2 border-seoul-text border-dashed cursor-pointer overflow-hidden group relative"
            >
              {capturedData?.imageUrl ? (
                <div className="relative w-full h-full">
                  <img src={capturedData.imageUrl} alt="Captured" className="w-full h-full object-cover" />
                  {capturedData.location && (
                    <div className="absolute bottom-2 right-2 bg-seoul-text/80 text-white text-[10px] px-2 py-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      위치 기록됨
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-seoul-muted-foreground group-hover:text-seoul-text text-center p-4">
                  <CameraIcon className="h-12 w-12" />
                  <span className="font-semibold text-[14px]">
                    {isLocating ? "위치 기록 중..." : "이곳을 터치하여\n카메라를 깨우시오"}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── GPS_TIME ── */}
      {currentQuest.type === "GPS_TIME" && (
        <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4 shadow-[4px_4px_0px_0px_rgba(45,42,38,1)]">
          <CardContent className="p-0 flex flex-col gap-3">
            <h3 className="text-[16px] font-bold text-seoul-text">현재 위치 인증</h3>
            <p className="text-[13px] font-medium text-seoul-muted">{currentQuest.instruction}</p>
            <div className="flex h-[160px] items-center justify-center bg-[#EBE8E3] border-2 border-seoul-text border-dashed">
              <div className="flex flex-col items-center gap-2 text-seoul-muted-foreground text-center p-4">
                <Navigation className="h-12 w-12" />
                <span className="font-semibold text-[14px]">목적지 근처에서 인증 버튼을 누르시오</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── ANSWER ── */}
      {currentQuest.type === "ANSWER" && (
        <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4 shadow-[4px_4px_0px_0px_rgba(45,42,38,1)]">
          <CardContent className="p-0 flex flex-col gap-4">
            <h3 className="text-[16px] font-bold text-seoul-text">역사 지식 암호 입력</h3>
            <div className="bg-[#EBE8E3] p-4 border-2 border-seoul-text">
              <p className="text-[14px] font-medium leading-[1.6] text-seoul-text italic">
                "{currentQuest.instruction}"
              </p>
            </div>
            <Input
              placeholder="정답을 입력하시오"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isVerifyDisabled() && handleVerify()}
              className="h-14 border-2 border-seoul-text rounded-none bg-white px-4 text-[16px] font-bold focus-visible:ring-0"
            />
          </CardContent>
        </Card>
      )}

      {/* ── VOICE ── */}
      {currentQuest.type === "VOICE" && (
        <Card className="border-[3px] border-seoul-text rounded-none bg-white p-4 shadow-[4px_4px_0px_0px_rgba(45,42,38,1)]">
          <CardContent className="p-0 flex flex-col gap-4">
            <h3 className="text-[16px] font-bold text-seoul-text">음성으로 답하시오</h3>
            <div className="bg-[#EBE8E3] p-4 border-2 border-seoul-text">
              <p className="text-[14px] font-medium leading-[1.6] text-seoul-text italic">
                "{currentQuest.instruction}"
              </p>
            </div>
            <button
              onClick={startVoiceRecognition}
              disabled={isRecording}
              className="flex flex-col items-center justify-center gap-2 h-[140px] border-2 border-seoul-text border-dashed bg-[#EBE8E3] transition-colors hover:bg-[#dedad4] disabled:opacity-60"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-10 w-10 text-seoul-accent animate-pulse" />
                  <span className="text-[13px] font-semibold text-seoul-accent">듣는 중...</span>
                </>
              ) : (
                <>
                  <Mic className="h-10 w-10 text-seoul-text" />
                  <span className="text-[13px] font-semibold text-seoul-text">
                    {answer ? "다시 말하기" : "마이크를 터치하여 말하시오"}
                  </span>
                </>
              )}
            </button>
            {answer && (
              <div className="bg-white border-2 border-seoul-text p-3">
                <p className="text-[12px] text-seoul-muted font-medium mb-1">인식된 내용</p>
                <p className="text-[15px] font-bold text-seoul-text">"{answer}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 에러 메시지 */}
      {errorMsg && (
        <div className="bg-red-50 border-2 border-red-400 px-4 py-3 text-[13px] font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      {/* 인증 버튼 */}
      <Button
        disabled={isVerifyDisabled()}
        onClick={handleVerify}
        className="h-[56px] bg-seoul-text text-seoul-card rounded-none font-bold text-[16px] w-full shadow-[3px_3px_0px_0px_rgba(196,99,78,1)] active:translate-y-0.5 transition-all"
      >
        {isVerifying ? (
          <Loader2 className="animate-spin h-5 w-5" />
        ) : step === attempt.questStates.length ? (
          "최종 임무 완수"
        ) : (
          "인증하고 다음으로"
        )}
      </Button>

      {isCameraOpen && (
        <CameraView onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />
      )}

      {showSuccess && (
        <SuccessOverlay step={step} onNext={onNext} isLast={step === attempt.questStates.length} />
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
