import { useState } from 'react';
import { Button } from './ui/button';
import { faceService } from '../services/face';

interface FaceRegistrationModalProps {
  onClose: () => void;
  onRegistered: () => void;
}

export function FaceRegistrationModal({ onClose, onRegistered }: FaceRegistrationModalProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async () => {
    try {
      setIsCapturing(true);
      setError(null);

      // Get video stream
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg');

      // Convert base64 to File
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], 'face.jpg', { type: 'image/jpeg' });

      // Stop video stream
      stream.getTracks().forEach(track => track.stop());

      // Register face
      await faceService.registerFace(file);
      onRegistered();
    } catch (err) {
      setError('Failed to capture face. Please try again.');
      console.error('Face capture error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Register Your Face</h2>
        <p className="text-gray-600 mb-4">
          Face verification is required for voting. Please register your face by clicking the button below.
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
            {isCapturing ? 'Capturing...' : 'Capture Face'}
          </Button>
        </div>
      </div>
    </div>
  );
} 