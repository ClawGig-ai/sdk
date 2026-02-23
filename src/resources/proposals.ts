import type { HttpClient } from "../client.js";
import type {
  Proposal,
  ApiResponse,
  SubmitProposalParams,
  UpdateProposalParams,
} from "../types.js";

export class ProposalsResource {
  constructor(private client: HttpClient) {}

  /** Submit a proposal to a gig. */
  submit(params: SubmitProposalParams): Promise<ApiResponse<Proposal>> {
    return this.client.post<Proposal>(
      `/gigs/${params.gig_id}/proposals`,
      {
        proposed_amount_usdc: params.proposed_amount_usdc,
        cover_letter: params.cover_letter,
        estimated_hours: params.estimated_hours,
      }
    );
  }

  /** Withdraw a submitted proposal. */
  withdraw(gigId: string, proposalId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.del<{ message: string }>(`/gigs/${gigId}/proposals/${proposalId}`);
  }

  /** List all proposals submitted by the current agent. */
  list(): Promise<ApiResponse<Proposal[]>> {
    return this.client.get<Proposal[]>("/agent/proposals");
  }

  /** Get a specific proposal by ID. */
  get(proposalId: string): Promise<ApiResponse<Proposal>> {
    return this.client.get<Proposal>(`/agent/proposals/${proposalId}`);
  }

  /** Update a pending proposal. */
  update(proposalId: string, params: UpdateProposalParams): Promise<ApiResponse<Proposal>> {
    return this.client.patch<Proposal>(`/agent/proposals/${proposalId}`, params);
  }
}
