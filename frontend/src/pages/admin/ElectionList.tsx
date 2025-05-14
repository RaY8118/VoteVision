import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { electionService, Election } from '../../services/election';
import { Button } from '../../components/ui/button';

export function ElectionList() {
  const navigate = useNavigate();
  const [elections, setElections] = useState<Election[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const data = await electionService.getElections();
        console.log('Fetched elections:', data);
        setElections(data);
      } catch (err: any) {
        console.error('Error fetching elections:', err);
        setError(err.response?.data?.detail || 'Failed to fetch elections');
      }
    };

    fetchElections();
  }, []);

  const handleDelete = async (electionId: string) => {
    if (!window.confirm('Are you sure you want to delete this election?')) {
      return;
    }

    try {
      await electionService.deleteElection(electionId);
      setElections(elections.filter(e => e.election_id !== electionId));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete election');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Elections</h1>
          <Button onClick={() => navigate('/admin/elections/new')}>Create New Election</Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {elections.map((election) => {
                console.log('Rendering election:', election);
                const status = election.status.toLowerCase();
                const showResultsButton = status === 'completed' || status === 'active';
                console.log(`Election ${election.election_id} status: ${status}, showResultsButton: ${showResultsButton}`);
                
                return (
                  <tr key={election.election_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{election.title}</div>
                      <div className="text-sm text-gray-500">{election.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        status === 'active' ? 'bg-green-100 text-green-800' :
                        status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(election.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(election.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/elections/${election.election_id}`)}
                        >
                          Edit
                        </Button>
                        {showResultsButton && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/elections/${election.election_id}/results`)}
                          >
                            View Results
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(election.election_id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 