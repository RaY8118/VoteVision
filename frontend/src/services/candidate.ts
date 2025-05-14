import { api } from './api';

export interface Candidate {
  candidate_id: string;
  name: string;
  party: string;
  manifesto: string;
  image_url?: string;
}

export const candidateService = {
  getCandidates: async (): Promise<Candidate[]> => {
    const response = await api.get('/candidates');
    return response.data;
  },

  getCandidateById: async (candidateId: string): Promise<Candidate> => {
    const response = await api.get(`/candidates/id/{candiate_id}`, {
      params: { candidate_id: candidateId }
    });
    return response.data;
  },

  createCandidate: async (candidate: Omit<Candidate, 'candidate_id'>): Promise<Candidate> => {
    const response = await api.post('/candidates', candidate);
    return response.data;
  },

  updateCandidate: async (candidateId: string, candidate: Omit<Candidate, 'candidate_id'>): Promise<Candidate> => {
    const response = await api.put(`/candidates/${candidateId}`, candidate);
    return response.data;
  },

  deleteCandidate: async (candidateId: string): Promise<void> => {
    await api.delete(`/candidates/${candidateId}`);
  }
}; 