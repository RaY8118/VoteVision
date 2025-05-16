import { useRef, useEffect, useState } from 'react';
import { Button } from './button';

interface WebcamProps {
  onCapture: (image: File) => Promise<void>;
  onError: (error: string) => void;
}

export function WebcamComponent({ onCapture, onError }: WebcamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        onError('Failed to access camera. Please ensure camera permissions are granted.');
      }
    };

    startVideo();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const handleCapture = async () => {
    if (isProcessing) return;
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        setIsProcessing(false);
        onError('Failed to get canvas context.');
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'face.jpg', { type: 'image/jpeg' });
          try {
            await onCapture(file);
          } catch (captureErr) {
            onError('Failed during face recognition.');
          }
        } else {
          onError('Failed to capture image.');
        }
        setIsProcessing(false);
      }, 'image/jpeg');
    } catch (err) {
      setIsProcessing(false);
      onError('Unexpected error during capture.');
    }
  };

  return (
    <div className="relative flex flex-col items-center space-y-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-64 h-64 bg-gray-100 rounded-full object-cover border-4 border-gray-300"
      />
      <canvas ref={canvasRef} className="hidden" />
      <Button onClick={handleCapture} disabled={isProcessing} className="text-lg">
        {isProcessing ? 'Processing...' : 'Capture'}
      </Button>
    </div>
  );
}
