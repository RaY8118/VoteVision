import { useState } from 'react';
import { Button } from '../ui/button';
import { faceService } from '../../services/face';

interface FaceVerificationModalProps {
  onClose: () => void;
  onVerified: () => void;
}

export function FaceVerificationModal({ onClose, onVerified }: FaceVerificationModalProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async () => {
    try {
      setIsCapturing(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL('image/jpeg');
      stream.getTracks().forEach(track => track.stop());

      await faceService.verifyFace(imageData);
      onVerified();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Face verification failed. Please try again.');
      console.error('Face verification error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Verify Your Identity</h2>
        <p className="text-gray-600 mb-4">
          Please verify your identity by capturing your face before voting.
          Make sure you have good lighting and a clear view of your face.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCapture} disabled={isCapturing}>
            {isCapturing ? 'Verifying...' : 'Verify Face'}
          </Button>
        </div>
      </div>
    </div>
  );
} 