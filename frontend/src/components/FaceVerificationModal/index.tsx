import { useState } from 'react';
import { Button } from '../ui/button';
import { faceService } from '../../services/face';
import { WebcamComponent } from '../ui/Webcam';

interface FaceVerificationModalProps {
  onClose: () => void;
  onVerified: () => void;
}

export function FaceVerificationModal({ onClose, onVerified }: FaceVerificationModalProps) {
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (image: File) => {
    try {
      setError(null);
      await faceService.verifyFace(image);
      onVerified();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Face verification failed. Please try again.');
      console.error('Face verification error:', err);
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

        <div className="mb-4">
          <WebcamComponent
            onCapture={handleCapture}
            onError={setError}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
} 