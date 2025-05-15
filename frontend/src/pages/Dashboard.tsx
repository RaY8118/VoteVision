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
      const [userData] = await Promise.all([
        authService.getCurrentUser(),
      ]);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {/* User Info Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome, {user?.full_name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="text-gray-900 capitalize">{user?.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">User ID</p>
            <p className="text-gray-900">{user?.user_id}</p>
          </div>
        </div>
      </div>

      {/* Active Elections */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Elections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections
            .filter((election) => election.status === 'active')
            .map((election) => (
              <div
                key={election.election_id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-2">{election.title}</h3>
                <p className="text-gray-600 mb-4">{election.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Ends: {new Date(election.end_date).toLocaleDateString()}</span>
                  <Button
                    onClick={() => navigate(`/elections/${election.election_id}`)}
                    size="sm"
                  >
                    Vote Now
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Upcoming Elections */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Elections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections
            .filter(election => election.status === 'upcoming')
            .map(election => (
              <div key={election.election_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{election.title}</h3>
                <p className="text-gray-600 mb-4">{election.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Starts: {new Date(election.start_date).toLocaleDateString()}</span>
                  <Button variant="outline" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            ))}
          {elections.filter(election => election.status === 'upcoming').length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-4">No upcoming elections scheduled.</p>
          )}
        </div>
      </div>

      {/* Completed Elections */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Elections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections
            .filter(election => election.status === 'completed')
            .map(election => (
              <div key={election.election_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{election.title}</h3>
                <p className="text-gray-600 mb-4">{election.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Ended: {new Date(election.end_date).toLocaleDateString()}</span>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/elections/${election.election_id}/results`)}
                  >
                    View Results
                  </Button>
                </div>
              </div>
            ))}
          {elections.filter(election => election.status === 'completed').length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-4">No completed elections.</p>
          )}
        </div>
      </div>
    </div>
  );
} 
