import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { authService } from '../services/auth';
import { electionService, Election } from '../services/election';

interface User {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Failed to load user data:', err);
      setError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchElections = async () => {
    try {
      const electionsData = await electionService.getElections();
      setElections(electionsData);
    } catch (err) {
      setError('Failed to load elections');
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchElections();
  }, [navigate]);

  const active = elections.filter(e => e.status === 'active');
  const upcoming = elections.filter(e => e.status === 'upcoming');
  const completed = elections.filter(e => e.status === 'completed');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main White Box */}
        <div className="bg-white shadow-xl rounded-2xl p-8 space-y-8">
          {/* Dashboard Title Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}

          {/* User Info */}
          <DashboardSection title={`Welcome, ${user?.full_name}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoItem label="Email" value={user?.email} />
              <InfoItem label="Role" value={user?.role} />
              <InfoItem label="User ID" value={user?.user_id} />
            </div>
          </DashboardSection>

          {/* Active Elections */}
          <DashboardSection title="Active Elections">
            <ElectionGrid
              elections={active}
              emptyMessage="No active elections scheduled."
              renderAction={(e) => (
                <Button size="sm" onClick={() => navigate(`/elections/${e.election_id}`)}>
                  Vote Now
                </Button>
              )}
              dateLabel="Ends"
              dateKey="end_date"
            />
          </DashboardSection>

          {/* Upcoming Elections */}
          <DashboardSection title="Upcoming Elections">
            <ElectionGrid
              elections={upcoming}
              emptyMessage="No upcoming elections scheduled."
              renderAction={() => (
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              )}
              dateLabel="Starts"
              dateKey="start_date"
            />
          </DashboardSection>

          {/* Completed Elections */}
          <DashboardSection title="Completed Elections">
            <ElectionGrid
              elections={completed}
              emptyMessage="No completed elections."
              renderAction={(e) => (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/elections/${e.election_id}/results`)}
                >
                  View Results
                </Button>
              )}
              dateLabel="Ended"
              dateKey="end_date"
            />
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}

// Reusable Section wrapper
function DashboardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-200 border border-gray-200 shadow-sm rounded-xl p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  );
}

// Reusable Info item
function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="text-base bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition duration-200">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || '-'}</p>
    </div>
  );
}

// Reusable Election card grid
function ElectionGrid({
  elections,
  renderAction,
  dateLabel,
  dateKey,
  emptyMessage,
}: {
  elections: Election[];
  renderAction: (election: Election) => React.ReactNode;
  dateLabel: string;
  dateKey: keyof Election;
  emptyMessage: string;
}) {
  if (elections.length === 0) {
    return <p className="text-gray-500 col-span-full text-center py-4">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {
        elections.map((e) => (
          <div
            key={e.election_id}
            className="rounded-xl border border-indigo-300/40 bg-white p-5 shadow hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <h3 className="text-lg font-semibold text-indigo-700 mb-2">{e.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{e.description}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>
                {dateLabel}:{' '}
                {e[dateKey] && (typeof e[dateKey] === 'string' || typeof e[dateKey] === 'number')
                  ? new Date(e[dateKey] as string | number).toLocaleDateString()
                  : 'N/A'}
              </span>
              {renderAction(e)}
            </div>
          </div>
        ))
      }
    </div >
  );
}
