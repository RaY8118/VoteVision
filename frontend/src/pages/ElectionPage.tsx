import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { electionService, Election } from '../services/election';
import { FaceVerificationModal } from '../components/FaceVerificationModal/index';
import { useAuth } from '../contexts/AuthContext';

export function ElectionPage() {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { authType } = useAuth();
  const [election, setElection] = useState<Election | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchElection = async () => {
      try {
        if (!electionId) return;
        const data = await electionService.getElectionById(electionId);
        setElection(data);

        // Check if user has already voted
        try {
          await electionService.checkVoteStatus(electionId);
          setHasVoted(true);
        } catch (err: any) {
          if (err.response?.status !== 404) {
            console.error('Error checking vote status:', err);
          }
        }
      } catch (err) {
        setError('Failed to load election');
      } finally {
        setIsLoading(false);
      }
    };

    fetchElection();
  }, [electionId]);

  const handleVote = async (candidateId: string) => {
    if (hasVoted) {
      setError('You have already voted in this election');
      return;
    }

    setSelectedCandidate(candidateId);
    
    if (authType === 'password') {
      setShowVerification(true);
    } else {
      try {
        if (!electionId) return;
        await electionService.castVote(electionId, candidateId);
        setHasVoted(true);
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to cast vote');
      }
    }
  };

  const handleVerificationSuccess = async () => {
    try {
      if (!electionId || !selectedCandidate) return;
      await electionService.castVote(electionId, selectedCandidate);
      setHasVoted(true);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to cast vote');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading election...</p>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Election Not Found</h2>
          <Button onClick={() => navigate('/')} className="w-full">
            Return to Home
          </Button>
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

          {hasVoted && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-600 rounded-md">
              You have already cast your vote in this election.
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Select your candidate:</h2>
            <div className="grid gap-4">
              {election.candidates.map((candidate) => (
                <div
                  key={candidate.candidate_id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCandidate === candidate.candidate_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  } ${hasVoted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !hasVoted && handleVote(candidate.candidate_id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                      <p className="text-sm text-gray-500">{candidate.party}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedCandidate === candidate.candidate_id
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
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {showVerification && (
        <FaceVerificationModal
          onClose={() => setShowVerification(false)}
          onVerified={handleVerificationSuccess}
        />
      )}
    </div>
  );
} 