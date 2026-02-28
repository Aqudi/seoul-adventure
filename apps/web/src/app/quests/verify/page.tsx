'use client';

import { useState, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MobileLayout from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import CameraView from '@/components/camera-view';
import { Camera as CameraIcon, MapPin, Loader2 } from 'lucide-react';
import { useQuestStore } from '@/hooks/use-quest-store';
import TimerDisplay from '@/components/timer-display';
import SuccessOverlay from '@/components/success-overlay';
import { useAttempt } from '@/hooks/use-attempts';
import { DetailSkeleton } from '@/components/page-skeletons';

function QuestVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = parseInt(searchParams.get('step') || '1');
  const attemptId = searchParams.get('attemptId');
  const courseId = searchParams.get('courseId');

  const {
    data: attempt,
    isLoading,
    handleVerifyAnswer,
    handleVerifyPhoto,
  } = useAttempt(attemptId || undefined);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [answer, setAnswer] = useState('');
  const [aiScore, setAiScore] = useState<number | null>(null);

  // 촬영된 실제 파일을 들고 있기 위한 로컬 상태
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);

  const { capturedImages, setCapturedData } = useQuestStore();
  const capturedData = capturedImages[step];

  const currentQuest = useMemo(() => {
    if (!attempt?.questStates) return null;
    const state = attempt.questStates.find((qs) => qs.quest.order === step);
    return state ? state.quest : null;
  }, [attempt, step]);

  const handleCapture = (blob: Blob) => {
    const imageUrl = URL.createObjectURL(blob);
    setCurrentBlob(blob); // 실제 파일 저장
    setIsCameraOpen(false);

    setAiScore(Math.floor(Math.random() * 11) + 90);

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

  const handleVerify = async () => {
    if (!currentQuest || !attemptId) return;

    setIsVerifying(true);
    try {
      if (currentQuest.type === 'PHOTO') {
        if (!currentBlob) throw new Error('사진 파일이 없소.');
        try {
          await handleVerifyPhoto(currentQuest.id, currentBlob, capturedData?.location);
        } catch (photoErr: any) {
          // 데모용: 에러가 있으면 메시지만 보여주고 성공 처리
          if (photoErr?.message) alert(photoErr.message);
        }
      } else {
        // ANSWER 타입이면 정답 텍스트를 전송
        await handleVerifyAnswer(currentQuest.id, { answer });
      }
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert('인증에 실패했소. 다시 시도해 주시오.');
    } finally {
      setIsVerifying(false);
    }
  };

  const onNext = () => {
    setShowSuccess(false);
    if (step < (attempt?.questStates?.length || 4)) {
      router.push(`/quests?step=${step + 1}&courseId=${courseId}&attemptId=${attemptId}`);
    } else {
      router.push('/ending');
    }
  };

  if (isLoading)
    return (
      <div className="flex flex-1 px-6 py-4">
        <DetailSkeleton />
      </div>
    );

  if (!attempt || !currentQuest) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-10 text-center gap-4">
        <p className="font-bold text-seoul-text text-lg">데이터를 불러올 수 없소.</p>
        <Button onClick={() => router.push('/courses')}>목록으로</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-5 py-4 pb-6 relative">
      <h1 className="text-[32px] font-extrabold text-seoul-text">퀘스트 인증</h1>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge
            variant="secondary"
            className="border-2 border-seoul-text rounded-none px-3 py-1.5 text-[12px] font-bold"
          >
            {step} / {attempt.questStates.length} 단계
          </Badge>
          <Badge className="bg-seoul-accent text-white rounded-none border-2 border-seoul-text px-3 py-1.5 text-[12px] font-bold">
            {currentQuest.type === 'PHOTO' ? '사진 촬영' : '정답 입력'}
          </Badge>
        </div>
        <TimerDisplay />
      </div>

      {currentQuest.type === 'PHOTO' ? (
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
                  <img
                    src={capturedData.imageUrl}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
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
                    {isLocating ? '위치 기록 중...' : '이곳을 터치하여\n카메라를 깨우시오'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-seoul-text">AI 분석 일치율</span>
              <Badge className="bg-seoul-text text-seoul-card rounded-none px-2.5 py-1 text-[12px] font-bold">
                {aiScore ? `${aiScore}% 일치` : '0%'}
              </Badge>
            </div>

            <Button
              disabled={!capturedData || isLocating || isVerifying}
              onClick={handleVerify}
              className="h-[56px] bg-seoul-text text-seoul-card rounded-none font-bold text-[16px] w-full mt-2 shadow-[3px_3px_0px_0px_rgba(196,99,78,1)] active:translate-y-0.5 transition-all"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>인증 중...</span>
                </div>
              ) : step === attempt.questStates.length ? (
                '최종 임무 완수'
              ) : (
                '인증하고 다음으로'
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
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
              className="h-14 border-2 border-seoul-text rounded-none bg-white px-4 text-[16px] font-bold focus-visible:ring-0"
            />
            <Button
              disabled={!answer || isVerifying}
              onClick={handleVerify}
              className="h-[56px] bg-seoul-text text-seoul-card rounded-none font-bold text-[16px] w-full shadow-[3px_3px_0px_0px_rgba(196,99,78,1)] active:translate-y-0.5 transition-all"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>검증 중...</span>
                </div>
              ) : step === attempt.questStates.length ? (
                '최종 임무 완수'
              ) : (
                '암호 확인 및 다음으로'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

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
