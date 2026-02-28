"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, X } from 'lucide-react';

interface Props {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

export default function CameraView({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 카메라 시작
  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // 후면 카메라 우선
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setError("카메라 권한이 거부되었거나 사용할 수 없습니다.");
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    onClose();
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) onCapture(blob);
        }, 'image/jpeg');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 w-full p-4 flex justify-end">
        <Button variant="ghost" size="icon" onClick={stopCamera} className="text-white">
          <X className="h-8 w-8" />
        </Button>
      </div>

      {error ? (
        <div className="text-white text-center p-6">
          <p className="mb-4">{error}</p>
          <Button onClick={onClose} variant="secondary">닫기</Button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          
          <div className="absolute bottom-10 flex gap-8 items-center">
            <button 
              onClick={capturePhoto}
              className="w-20 h-20 bg-white rounded-full border-8 border-gray-300 active:scale-90 transition-transform"
            />
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  );
}
