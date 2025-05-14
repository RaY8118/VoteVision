import { api } from './api';


export interface Election {
  election_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed';
  candidates: Array<{
    manifesto: string;
    candidate_id: string;
    name: string;
    party: string;
  }>;
}

export interface ElectionCreate {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
}

export interface Candidate {
  candidate_id: string;
  name: string;
  party: string;
  manifesto: string;
}

export class ElectionService {
  async getElections(): Promise<Election[]> {
    const response = await api.get('/elections');
    return response.data;
  }

  async getElectionById(electionId: string): Promise<Election> {
    const response = await api.get(`/elections/${electionId}`);
    return response.data;
  }

  async createElection(election: ElectionCreate): Promise<Election> {
    const response = await api.post('/elections', election);
    return response.data;
  }

  async updateElection(electionId: string, election: ElectionCreate): Promise<Election> {
    const response = await api.put(`/elections/${electionId}`, election);
    return response.data;
  }

  async deleteElection(electionId: string): Promise<void> {
    await api.delete(`/elections/${electionId}`);
  }

  async startElection(electionId: string): Promise<void> {
    await api.post(`/elections/${electionId}/start`);
  }

  async endElection(electionId: string): Promise<void> {
    await api.post(`/elections/${electionId}/end`);
  }

  async addCandidateToElection(electionId: string, candidateId: string): Promise<void> {
    if (!candidateId) {
      throw new Error('Candidate ID is required');
    }
    await api.post(`/elections/${electionId}/candidates/${candidateId}`);
  }

  async removeCandidateFromElection(electionId: string, candidateId: string): Promise<void> {
    if (!candidateId) {
      throw new Error('Candidate ID is required');
    }
    await api.delete(`/elections/${electionId}/candidates/${candidateId}`);
  }

  async castVote(electionId: string, candidateId: string): Promise<void> {
    await api.post(`/elections/${electionId}/vote`, { candidate_id: candidateId });
  }

  async getElectionResults(electionId: string) {
    const response = await api.get(`/elections/${electionId}/results`);
    return response.data;
  }
}

export const electionService = new ElectionService(); 