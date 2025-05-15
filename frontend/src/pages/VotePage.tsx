import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { electionService, Election } from '../services/election';

export function VotePage() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchElection = async () => {
      if (!electionId) return;
      try {
        const data = await electionService.getElectionById(electionId);
        setElection(data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Election not found');
          setTimeout(() => navigate('/'), 2000);
        } else {
          setError('Failed to load election data');
        }
      }
    };

    fetchElection();
  }, [electionId, navigate]);

  const handleVote = async () => {
    if (!electionId || !selectedCandidate) return;

    setIsLoading(true);
    setError(null);
    try {
      await electionService.castVote(electionId, selectedCandidate);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Please log in to vote');
        setTimeout(() => navigate('/'), 2000);
      } else if (err.response?.status === 400) {
        setError(err.response.data.detail || 'You have already voted in this election');
      } else {
        setError('Failed to cast vote. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!election) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading election...</p>
        </div>
      </div>
    );
  }

  if (election.status !== 'active') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Election Not Active</h2>
          <p className="text-gray-600 mb-4">
            {election.status === 'upcoming'
              ? 'This election has not started yet.'
              : 'This election has ended.'}
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{election.title}</h1>
          <p className="text-gray-600 mb-6">{election.description}</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md">
              Vote cast successfully! Redirecting...
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Select your candidate:</h2>
            <div className="grid gap-4">
              {election.candidates.map((candidate) => (
                <div
                  key={candidate.candidate_id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedCandidate === candidate.candidate_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                    }`}
                  onClick={() => setSelectedCandidate(candidate.candidate_id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                      <p className="text-sm text-gray-500">{candidate.party}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCandidate === candidate.candidate_id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                      }`}>
                      {selectedCandidate === candidate.candidate_id && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVote}
              disabled={!selectedCandidate || isLoading}
            >
              {isLoading ? 'Casting Vote...' : 'Cast Vote'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
