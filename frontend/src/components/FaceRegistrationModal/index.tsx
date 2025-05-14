import { useRef, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { faceService } from '../../services/face';

interface FaceRegistrationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function FaceRegistrationModal({ onClose, onSuccess }: FaceRegistrationModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      console.error('Failed to start video:', err);
      setError('Failed to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopVideo = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleFaceRegistration = async () => {
    try {
      setIsCapturing(true);
      if (!videoRef.current) return;

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);

      const imageData = canvas.toDataURL('image/jpeg');
      await faceService.registerFace(imageData);
      onSuccess();
    } catch (err) {
      console.error('Face registration error:', err);
      setError('Failed to register face. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Register Your Face</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}
        <div className="mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-64 bg-gray-100 rounded-lg"
          />
        </div>
        <p className="text-gray-600 mb-4">
          Please look at your camera and click the button below to register your face.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              stopVideo();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleFaceRegistration}
            disabled={isCapturing}
          >
            {isCapturing ? 'Capturing...' : 'Capture Face'}
          </Button>
        </div>
      </div>
    </div>
  );
} 