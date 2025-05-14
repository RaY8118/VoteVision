import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateService } from '../../services/candidate';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';

interface CandidateFormData {
  name: string;
  party: string;
  manifesto: string;
}

export function CandidateForm() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CandidateFormData>({
    name: '',
    party: '',
    manifesto: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (candidateId) {
        try {
          const candidate = await candidateService.getCandidateById(candidateId);
          setFormData({
            name: candidate.name,
            party: candidate.party,
            manifesto: candidate.manifesto || '',
          });
        } catch (err) {
          setError('Failed to load candidate data');
        }
      }
    };
    fetchData();
  }, [candidateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (candidateId) {
        await candidateService.updateCandidate(candidateId, formData);
      } else {
        await candidateService.createCandidate(formData);
      }
      navigate('/admin');
    } catch (err) {
      setError('Failed to save candidate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {candidateId ? 'Edit Candidate' : 'Add New Candidate'}
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="party" className="block text-sm font-medium text-gray-700">
                Party
              </label>
              <Input
                id="party"
                value={formData.party}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, party: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="manifesto" className="block text-sm font-medium text-gray-700">
                Manifesto
              </label>
              <Textarea
                id="manifesto"
                value={formData.manifesto}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, manifesto: e.target.value })
                }
                className="mt-1"
                rows={4}
              />
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
                {isLoading ? 'Saving...' : candidateId ? 'Update Candidate' : 'Add Candidate'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 