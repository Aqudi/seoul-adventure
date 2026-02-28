"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  step: number;
  onNext: () => void;
  isLast?: boolean;
}

export default function SuccessOverlay({ step, onNext, isLast }: Props) {
  return (
    <div className="fixed inset-0 z-[60] bg-seoul-text/95 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="mb-6 animate-bounce">
        <CheckCircle2 className="h-24 w-24 text-[#7A9B76]" />
      </div>
      
      <Badge className="bg-seoul-accent text-white border-2 border-white rounded-none mb-4 px-4 py-1 text-lg font-bold">
        {step}단계 돌파!
      </Badge>
      
      <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tighter">
        장하도다, 탐험가여!
      </h2>
      
      <div className="text-gray-300 mb-12 leading-relaxed whitespace-pre-line">
        {isLast 
          ? `모든 단서를 모아 드디어 진실에 도달하였소.
             이제 왕실의 포상을 확인하러 가시게.`
          : `훌륭하게 임무를 완수하였소.
             다음 목적지가 그대를 기다리고 있으니 서두르시오.`}
      </div>
      
      <button 
        onClick={onNext}
        className="w-full h-16 bg-[#EBE8E3] text-seoul-text border-[4px] border-seoul-text text-xl font-black active:translate-y-1 transition-transform shadow-[6px_6px_0px_0px_rgba(196,99,78,1)]"
      >
        {isLast ? "최종 결과 확인" : "다음 단계로 진군"}
      </button>
    </div>
  );
}
