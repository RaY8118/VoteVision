import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { electionService } from '../../services/election';
import { Button } from '../../components/ui/button';

interface VoteResult {
  name: string;
  party: string;
  vote_count: number;
}

interface VoteSummary {
  results: VoteResult[];
  winner: VoteResult;
}

export function ElectionResults() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<VoteSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!electionId) return;

      try {
        const data = await electionService.getElectionResults(electionId);
        console.log('Fetched election results:', data);
        setResults(data);
      } catch (err: any) {
        console.error('Error fetching results:', err);
        setError(err.response?.data?.detail || 'Failed to fetch election results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [electionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/admin')}>Back to Elections</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Results Available</h2>
              <p className="text-gray-600 mb-4">The election results are not available yet.</p>
              <Button onClick={() => navigate('/admin')}>Back to Elections</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 rounded-lg">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Election Results</h1>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-semibold text-green-800 mb-2">Winner</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-green-900">{results.winner.name}</p>
                  <p className="text-sm text-green-700">{results.winner.party}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-900">{results.winner.vote_count}</p>
                  <p className="text-sm text-green-700">votes</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Results</h2>
            <div className="space-y-4">
              {results.results.map((result) => (
                <div key={result.name} className="flex justify-between items-center py-2">
                  <span>{result.name}</span>
                  <span>{result.vote_count} votes</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => navigate('/admin')}>Back to Elections</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
