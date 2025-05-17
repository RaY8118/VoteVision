import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { authService } from '../services/auth';
import { useEffect, useState } from 'react';
import { ShieldCheck, ScanFace, BarChart3 } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const isAuthenticated = !!authService.getToken();

  useEffect(() => {
    const checkUserRole = async () => {
      if (isAuthenticated) {
        try {
          const userData = await authService.getCurrentUser();
          setIsAdmin(userData.role === 'admin');
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    checkUserRole();
  }, [isAuthenticated]);

  const handleDashboardClick = () => {
    navigate(isAdmin ? '/admin' : '/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg mb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-32 text-center animate-fade-in-up">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Welcome to VoteVision
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-indigo-100">
            A secure and modern platform for conducting elections with face recognition technology
          </p>
          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-lg hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="lg"
                    className="text-lg hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                className="text-lg"
                onClick={handleDashboardClick}
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 sm:py-24 md:py-32 bg-gray-50 rounded-lg mb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Key Features</h2>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 px-4 sm:px-0">
            {/* Feature 1 */}
            <div className="bg-gradient-to-r from-indigo-600/80 to-purple-600/80 p-6 rounded-xl border border-white/10 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all text-center">
              <ShieldCheck className="w-10 h-10 mx-auto mb-4 text-white" />
              <h3 className="text-lg font-medium text-white">Secure Voting</h3>
              <p className="mt-2 text-base text-white">
                Advanced security measures to ensure the integrity of every vote
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-r from-indigo-600/80 to-purple-600/80 p-6 rounded-xl border border-white/10 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all text-center">
              <ScanFace className="w-10 h-10 mx-auto mb-4 text-white" />
              <h3 className="text-lg font-medium text-white">Face Recognition</h3>
              <p className="mt-2 text-base text-white">
                Biometric authentication for enhanced security and convenience
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-r from-indigo-600/80 to-purple-600/80 p-6 rounded-xl border border-white/10 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all text-center">
              <BarChart3 className="w-10 h-10 mx-auto mb-4 text-white" />
              <h3 className="text-lg font-medium text-white">Real-time Results</h3>
              <p className="mt-2 text-base text-white">
                Instant access to election results and statistics
              </p>
            </div>
          </div>

          {/* Final Call to Action */}
          <div className="text-center mt-24">
            <h3 className="text-2xl font-bold text-gray-900">
              Ready to make your vote count?
            </h3>
            <Link to="/register">
              <Button className="mt-4 text-lg hover:shadow-lg">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
