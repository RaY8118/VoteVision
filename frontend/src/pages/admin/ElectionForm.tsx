import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { electionService, Election } from '../../services/election';
import { candidateService, Candidate } from '../../services/candidate';

interface ElectionFormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  candidates: string[];
}

export function ElectionForm() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [election, setElection] = useState<Election | null>(null);
  const [formData, setFormData] = useState<ElectionFormData>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    candidates: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidatesData, electionData] = await Promise.all([
          candidateService.getCandidates(),
          electionId ? electionService.getElectionById(electionId) : null,
        ]);
        console.log('Fetched candidates:', candidatesData);
        setCandidates(candidatesData);
        if (electionData) {
          console.log('Fetched election data:', electionData);
          setElection(electionData);
          const candidateIds = electionData.candidates.map(c => c.candidate_id);
          console.log('Setting initial candidate IDs:', candidateIds);
          setFormData({
            title: electionData.title,
            description: electionData.description,
            start_date: new Date(electionData.start_date).toISOString().split('T')[0],
            end_date: new Date(electionData.end_date).toISOString().split('T')[0],
            candidates: candidateIds,
          });
        }
      } catch (err: any) {
        console.error('Error loading data:', err);
        if (err.response?.status === 404) {
          setError('Election not found. It may have been deleted.');
          setTimeout(() => navigate('/admin'), 2000);
        } else if (err.response?.status === 401) {
          setError('You are not authorized to access this election.');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError('Failed to load data. Please try again later.');
        }
      }
    };
    fetchData();
  }, [electionId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Form data before submission:', formData);
      
      const electionData = {
        title: formData.title,
        description: formData.description,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };

      let createdElection;
      if (electionId) {
        createdElection = await electionService.updateElection(electionId, electionData);
      } else {
        createdElection = await electionService.createElection(electionData);
      }
      console.log('Created/Updated election:', createdElection);

      // Handle candidates for both new and existing elections
      const currentElectionId = electionId || createdElection.election_id;
      console.log('Current election ID:', currentElectionId);
      console.log('Selected candidates:', formData.candidates);

      // Add each selected candidate to the election
      for (const candidateId of formData.candidates) {
        if (!candidateId) {
          console.warn('Skipping undefined candidate ID');
          continue;
        }
        try {
          console.log(`Adding candidate ${candidateId} to election ${currentElectionId}`);
          await electionService.addCandidateToElection(currentElectionId, candidateId);
          console.log(`Successfully added candidate ${candidateId}`);
        } catch (err: any) {
          console.error(`Error adding candidate ${candidateId}:`, err);
          // Continue with other candidates even if one fails
        }
      }

      // If editing, remove unselected candidates
      if (electionId) {
        const currentElection = await electionService.getElectionById(electionId);
        const currentCandidates = currentElection.candidates.map(c => c.candidate_id);
        
        for (const candidateId of currentCandidates) {
          if (!formData.candidates.includes(candidateId)) {
            try {
              console.log(`Removing candidate ${candidateId} from election ${currentElectionId}`);
              await electionService.removeCandidateFromElection(currentElectionId, candidateId);
              console.log(`Successfully removed candidate ${candidateId}`);
            } catch (err: any) {
              console.error(`Error removing candidate ${candidateId}:`, err);
              // Continue with other candidates even if one fails
            }
          }
        }
      }

      navigate('/admin');
    } catch (err: any) {
      console.error('Error saving election:', err);
      setError(err.response?.data?.detail || 'Failed to save election');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartElection = async () => {
    if (!electionId) return;
    setIsLoading(true);
    setError(null);
    try {
      console.log('Starting election:', electionId);
      await electionService.startElection(electionId);
      const updatedElection = await electionService.getElectionById(electionId);
      console.log('Updated election after start:', updatedElection);
      setElection(updatedElection);
    } catch (err: any) {
      console.error('Error starting election:', err);
      setError(err.response?.data?.detail || 'Failed to start election');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndElection = async () => {
    if (!electionId) return;
    setIsLoading(true);
    setError(null);
    try {
      console.log('Ending election:', electionId);
      await electionService.endElection(electionId);
      const updatedElection = await electionService.getElectionById(electionId);
      console.log('Updated election after end:', updatedElection);
      setElection(updatedElection);
    } catch (err: any) {
      console.error('Error ending election:', err);
      setError(err.response?.data?.detail || 'Failed to end election');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCandidateChange = (candidateId: string) => {
    if (!candidateId) {
      console.warn('Attempted to change selection for undefined candidate ID');
      return;
    }
    console.log('Candidate selection changed:', candidateId);
    console.log('Current form data:', formData);
    
    setFormData(prev => {
      const isCurrentlySelected = prev.candidates.includes(candidateId);
      console.log(`Candidate ${candidateId} is currently ${isCurrentlySelected ? 'selected' : 'not selected'}`);
      
      const newCandidates = isCurrentlySelected
        ? prev.candidates.filter(id => id !== candidateId)
        : [...prev.candidates, candidateId];
      
      console.log('Updated candidates array:', newCandidates);
      const newFormData = {
        ...prev,
        candidates: newCandidates
      };
      console.log('New form data:', newFormData);
      return newFormData;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {electionId ? 'Edit Election' : 'Create New Election'}
            </h1>
            {electionId && election && (
              <div className="flex space-x-2">
                {election.status === 'upcoming' && (
                  <Button
                    onClick={handleStartElection}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Start Election
                  </Button>
                )}
                {election.status === 'active' && (
                  <Button
                    onClick={handleEndElection}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    End Election
                  </Button>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}

          {electionId && election && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-600 rounded-md">
              Status: <span className="font-semibold capitalize">{election.status}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Candidates
              </label>
              <div className="space-y-2">
                {candidates.map((candidate) => {
                  const isSelected = formData.candidates.includes(candidate.candidate_id);
                  console.log(`Rendering candidate ${candidate.candidate_id}, selected: ${isSelected}`);
                  return (
                    <div key={candidate.candidate_id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`candidate-${candidate.candidate_id}`}
                        checked={isSelected}
                        onChange={() => handleCandidateChange(candidate.candidate_id)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`candidate-${candidate.candidate_id}`}
                        className="text-sm text-gray-700"
                      >
                        {candidate.name} ({candidate.party})
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : electionId ? 'Update Election' : 'Create Election'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 