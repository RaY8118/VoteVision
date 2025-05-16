import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { authService } from '../services/auth';
import { electionService, Election } from '../services/election';
import { candidateService, Candidate } from '../services/candidate';

interface User {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData.role !== 'admin') {
          navigate('/dashboard');
          return;
        }
        setUser(userData);
      } catch (err: any) {
        setError('Failed to load user data');
        if (err.response?.status === 401) {
          navigate('/');
        }
      }
    };

    const fetchData = async () => {
      try {
        const [electionsData, candidatesData] = await Promise.all([
          electionService.getElections(),
          candidateService.getCandidates()
        ]);
        setElections(electionsData);
        setCandidates(candidatesData);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    fetchData();
  }, [navigate]);

  const handleStartElection = async (electionId: string) => {
    try {
      await electionService.startElection(electionId);
      const updatedElections = await electionService.getElections();
      setElections(updatedElections);
    } catch (err) {
      setError('Failed to start election');
    }
  };

  const handleEndElection = async (electionId: string) => {
    try {
      await electionService.endElection(electionId);
      const updatedElections = await electionService.getElections();
      setElections(updatedElections);
    } catch (err) {
      setError('Failed to end election');
    }
  };

  const handleDelete = async (electionId: string) => {
    if (!window.confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
      return;
    }

    try {
      await electionService.deleteElection(electionId);
      const updatedElections = await electionService.getElections();
      setElections(updatedElections);
    } catch (err) {
      setError('Failed to delete election');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
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

        {/* Elections Management */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Elections Management</h2>
            <Button onClick={() => navigate('/admin/elections/new')}>
              Create New Election
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {elections.map((election) => (
                  <tr key={election.election_id}>
                    <td className="px-6 py-4 whitespace-nowrap">{election.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${election.status === 'active' ? 'bg-green-100 text-green-800' :
                        election.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {election.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(election.start_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(election.end_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {election.status === 'upcoming' && (
                          <Button
                            size="sm"
                            onClick={() => handleStartElection(election.election_id)}
                          >
                            Start
                          </Button>
                        )}
                        {election.status === 'active' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleEndElection(election.election_id)}
                          >
                            End
                          </Button>
                        )}
                        {election.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/elections/${election.election_id}/results`)}
                          >
                            View Results
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/elections/${election.election_id}`)}
                        >
                          Edit
                        </Button>
                        {election.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(election.election_id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Candidates Management */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Candidates Management</h2>
            <Button onClick={() => navigate('/admin/candidates/new')}>
              Add New Candidate
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {candidates.map((candidate) => (
                  <tr key={candidate.candidate_id}>
                    <td className="px-6 py-4 whitespace-nowrap">{candidate.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{candidate.party}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/candidates/${candidate.candidate_id}`)}
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
