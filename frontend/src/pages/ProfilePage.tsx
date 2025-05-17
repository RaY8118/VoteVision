import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { authService } from '../services/auth';
import { faceService, FaceStatus } from '../services/face';
import { FaceRegistrationModal } from '../components/FaceRegistrationModal/index';
import { useAuth } from '../contexts/AuthContext';

interface User {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [faceStatus, setFaceStatus] = useState<FaceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFaceRegistration, setShowFaceRegistration] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userData, faceData] = await Promise.all([
          authService.getCurrentUser(),
          faceService.getFaceStatus()
        ]);
        setUser(userData);
        setFaceStatus(faceData);
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDashboardClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  }

  const handleFaceRegistered = async () => {
    const status = await faceService.getFaceStatus();
    setFaceStatus(status);
    setShowFaceRegistration(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Failed to load user data</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Profile</h1>
              <div className="flex space-x-4">
                <Button variant="secondary" onClick={handleDashboardClick} className="bg-white hover:bg-gray-100 text-indigo-600">
                  Dashboard
                </Button>
                <Button variant="secondary" onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                {error}
              </div>
            )}

            {/* User Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="mt-1 text-gray-900">{user.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="mt-1 text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="mt-1 text-gray-900">{user.user_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="mt-1 text-gray-900 capitalize">{user.role}</p>
                  </div>
                </div>
              </div>

              {/* Face Recognition Status */}
              {user.role === 'voter' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Face Recognition</h2>
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="mt-1 text-gray-900">
                          {faceStatus?.has_face_data ? 'Registered' : 'Not Registered'}
                        </p>
                      </div>
                      {!faceStatus?.has_face_data && (
                        <Button onClick={() => setShowFaceRegistration(true)}>
                          Register Face
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showFaceRegistration && (
        <FaceRegistrationModal
          onClose={() => setShowFaceRegistration(false)}
          onSuccess={handleFaceRegistered}
        />
      )}
    </div>
  );
} 
