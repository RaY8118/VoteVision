import { api } from './api';

export interface FaceStatus {
  has_face_data: boolean;
  user_id: string;
}

class FaceService {
  async registerFace(image: string | File): Promise<void> {
    if (typeof image === 'string') {
      // Convert base64 to blob
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], 'face.jpg', { type: 'image/jpeg' });
      await this.uploadFace(file);
    } else {
      await this.uploadFace(image);
    }
  }

  private async uploadFace(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('image', file);
    await api.post('/auth/register/face', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async verifyFace(image: string | File): Promise<void> {
    if (typeof image === 'string') {
      // Convert base64 to blob
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], 'face.jpg', { type: 'image/jpeg' });
      await this.uploadVerification(file);
    } else {
      await this.uploadVerification(image);
    }
  }

  private async uploadVerification(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('image', file);
    await api.post('/auth/face/verify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getFaceStatus(): Promise<FaceStatus> {
    const response = await api.get<FaceStatus>('/auth/face-status');
    return response.data;
  }
}

export const faceService = new FaceService(); 