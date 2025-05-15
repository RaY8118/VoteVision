import { useRef, useEffect } from 'react';
import { Button } from './button';

interface WebcamProps {
  onCapture: (image: File) => void;
  onError: (error: string) => void;
}

export function WebcamComponent({ onCapture, onError }: WebcamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startVideo();
    return () => stopVideo();
  }, []);

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

  const stopVideo = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'face.jpg', { type: 'image/jpeg' });
        onCapture(file);
      }
    }, 'image/jpeg');
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-64 bg-gray-100 rounded-lg"
      />
      <canvas ref={canvasRef} className="hidden" />
      <div className="mt-4 flex justify-center">
        <Button onClick={handleCapture} className="text-lg">Capture</Button>
      </div>
    </div>
  );
} 
