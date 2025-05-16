import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { WebcamComponent } from '../components/ui/Webcam';
import { authService } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'password' | 'face'>('password');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.loginWithPassword(formData);
      login(response.access_token);
      const user = await authService.getCurrentUser();
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceCapture = async (image: File) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.loginWithFace(image);
      login(response.access_token);
      const user = await authService.getCurrentUser();
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Face recognition failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white/35 backdrop-blur-lg rounded-lg p-6">
        <CardHeader>
          <CardTitle className="text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">
            Or{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </Link>
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex justify-center space-x-4">
              <Button
                variant={authMethod === 'password' ? 'default' : 'outline'}
                onClick={() => setAuthMethod('password')}
                className="text-lg hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
              >
                Password
              </Button>
              <Button
                variant={authMethod === 'face' ? 'default' : 'outline'}
                onClick={() => setAuthMethod('face')}
                className="text-lg hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
              >
                Face Recognition
              </Button>
            </div>

            {authMethod === 'password' ? (
              <form className="space-y-6" onSubmit={handlePasswordSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-violet-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-violet-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="text-lg w-full hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <WebcamComponent
                  onCapture={handleFaceCapture}
                  onError={(error) => setError(error)}
                />
                <p className="text-sm text-gray-600 text-center">
                  Position your face within the circle and click capture.
                  Make sure you have good lighting and a clear view of your face.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
