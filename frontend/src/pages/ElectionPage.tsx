import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { electionService, Election } from '../services/election';
import { FaceVerificationModal } from '../components/FaceVerificationModal/index';

export function ElectionPage() {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  useEffect(() => {
    const fetchElection = async () => {
      try {
        if (!electionId) return;
        const data = await electionService.getElectionById(electionId);
        setElection(data);
      } catch (err) {
        setError('Failed to load election');
      } finally {
        setIsLoading(false);
      }
    };

    fetchElection();
  }, [electionId]);

  const handleVote = async (candidateId: string) => {
    setSelectedCandidate(candidateId);
    setShowVerification(true);
  };

  const handleVerificationSuccess = async () => {
    try {
      if (!electionId || !selectedCandidate) return;
      await electionService.castVote(electionId, selectedCandidate);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to cast vote');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Election not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{election.title}</h1>
        <p className="text-gray-600 mb-8">{election.description}</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {election.candidates.map((candidate) => (
            <div
              key={candidate.candidate_id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {candidate.name}
              </h3>
              <p className="text-gray-600 mb-2">Party: {candidate.party}</p>
              <p className="text-gray-600 mb-4">{candidate.manifesto}</p>s
              <Button
                onClick={() => handleVote(candidate.candidate_id)}
                className="w-full"
              >
                Vote
              </Button>
            </div>
          ))}
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