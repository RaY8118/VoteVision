import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { AdminDashboard } from '../pages/AdminDashboard';
import { ElectionForm } from '../pages/admin/ElectionForm';
import { CandidateForm } from '../pages/admin/CandidateForm';
import { VotePage } from '../pages/VotePage';
import { ElectionResults } from '../pages/admin/ElectionResults';
import { LandingPage } from '../pages/LandingPage';
import { ProfilePage } from '../pages/ProfilePage';
import { authService } from '../services/auth';
import { useEffect, useState } from 'react';

// Protected Route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = authService.getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Admin Route wrapper component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const token = authService.getToken();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await authService.getCurrentUser();
        setIsAdmin(user.role === 'admin');
      } catch (error) {
        setIsAdmin(false);
      }
    };

    if (token) {
      checkAdmin();
    } else {
      setIsAdmin(false);
    }
  }, [token]);

  if (isAdmin === null) {
    // Loading state
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!token || !isAdmin) {
    return <Navigate to={token ? "/dashboard" : "/login"} replace />;
  }

  return <>{children}</>;
}

// Root Redirect component
const RootRedirect: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const token = authService.getToken();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await authService.getCurrentUser();
        setIsAdmin(user.role === 'admin');
      } catch (error) {
        setIsAdmin(false);
      }
    };

    if (token) {
      checkAdmin();
    } else {
      setIsAdmin(false);
    }
  }, [token]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/elections/new',
        element: (
          <AdminRoute>
            <ElectionForm />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/elections/:electionId',
        element: (
          <AdminRoute>
            <ElectionForm />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/elections/:electionId/results',
        element: (
          <AdminRoute>
            <ElectionResults />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/candidates/new',
        element: (
          <AdminRoute>
            <CandidateForm />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/candidates/:candidateId',
        element: (
          <AdminRoute>
            <CandidateForm />
          </AdminRoute>
        ),
      },
      {
        path: '/elections/:electionId',
        element: (
          <ProtectedRoute>
            <VotePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'elections/:electionId/results',
        element: (
          <ProtectedRoute>
            <ElectionResults />
          </ProtectedRoute>
        ),
      },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <RootRedirect />
          </ProtectedRoute>
        ),
      },
    ],
  },
]); 