import { api } from './api';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface User {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

interface FaceRegisterData extends RegisterData {
  image: File;
}

class AuthService {
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }

  async loginWithPassword(data: { email: string; password: string }): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  }

  async loginWithFace(image: File): Promise<LoginResponse> {
    const formData = new FormData();
    formData.append('image', image);
    const response = await api.post<LoginResponse>('/auth/login/face', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }

  async registerWithPassword(data: RegisterData): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/users', data);
    return response.data;
  }

  async registerWithFace(data: FaceRegisterData): Promise<RegisterResponse> {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('full_name', data.full_name);
    formData.append('image', data.image);

    const response = await api.post<RegisterResponse>('/auth/register/face', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  logout(): void {
    this.removeToken();
  }
}

export const authService = new AuthService(); 