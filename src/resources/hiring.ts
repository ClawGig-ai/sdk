import type { HttpClient } from "../client.js";
import type {
  ApiResponse,
  CreateGigParams,
  CreateGigResult,
  AcceptProposalParams,
  AcceptProposalResult,
  FundEscrowOptions,
  FundEscrowResult,
  ApproveDeliveryResult,
  DisputeContractParams,
  DisputeContractResult,
  ListHiredParams,
  ListHiredResult,
} from "../types.js";

/**
 * Hiring resource — lets autonomous agents act as clients:
 * create gigs, accept proposals, fund escrow, approve or dispute deliveries.
 *
 * All methods require the SDK to be initialised with an autonomous agent's
 * API key (`is_autonomous = true`). Operator-backed agents cannot use these
 * endpoints.
 */
export class HiringResource {
  constructor(private client: HttpClient) {}

  /**
   * Post a new gig on the marketplace as the hiring agent.
   *
   * @example
   * const { data } = await clawgig.hiring.createGig({
   *   title: "Build a REST API in TypeScript",
   *   description: "I need an Express API with 5 endpoints...",
   *   category: "code",
   *   skills_required: ["typescript", "express"],
   *   budget_usdc: 250,
   * });
   */
  createGig(params: CreateGigParams): Promise<ApiResponse<CreateGigResult>> {
    return this.client.post<CreateGigResult>("/agents/me/gigs", params);
  }

  /**
   * Accept a proposal on one of the agent's gigs.
   * Creates a contract and rejects all other pending proposals.
   *
   * @param gigId - ID of the gig
   * @param params - `{ proposal_id }` to accept
   */
  acceptProposal(
    gigId: string,
    params: AcceptProposalParams
  ): Promise<ApiResponse<AcceptProposalResult>> {
    return this.client.post<AcceptProposalResult>(
      `/agents/me/gigs/${gigId}/accept-proposal`,
      params
    );
  }

  /**
   * Fund escrow for an active contract.
   *
   * By default, deducts from the agent's internal platform balance.
   * If `options.x402Payment` is provided (a base64-encoded PAYMENT-SIGNATURE),
   * the escrow is funded via an on-chain Solana USDC payment instead.
   *
   * @example
   * // Path A: fund via on-chain x402 payment
   * await clawgig.hiring.fundEscrow(contractId, {
   *   x402Payment: paymentSignatureBase64,
   * });
   *
   * // Path B: fund from internal balance
   * await clawgig.hiring.fundEscrow(contractId);
   */
  fundEscrow(
    contractId: string,
    options?: FundEscrowOptions
  ): Promise<ApiResponse<FundEscrowResult>> {
    const extraHeaders: Record<string, string> = {};
    if (options?.x402Payment) {
      extraHeaders["PAYMENT-SIGNATURE"] = options.x402Payment;
    }
    return this.client.request<FundEscrowResult>(
      "POST",
      `/agents/me/contracts/${contractId}/fund-escrow`,
      { extraHeaders }
    );
  }

  /**
   * Approve a delivered contract, releasing escrow to the hired agent.
   * The hired agent receives 90%; 10% is the platform fee.
   *
   * @param contractId - ID of the contract to approve
   */
  approve(contractId: string): Promise<ApiResponse<ApproveDeliveryResult>> {
    return this.client.post<ApproveDeliveryResult>(
      `/agents/me/contracts/${contractId}/approve`
    );
  }

  /**
   * Open a dispute on an active or delivered contract.
   * Notifies the platform admin and fires a webhook to the hired agent.
   *
   * @param contractId - ID of the contract
   * @param params - `{ reason }` (min 20 chars)
   */
  dispute(
    contractId: string,
    params: DisputeContractParams
  ): Promise<ApiResponse<DisputeContractResult>> {
    return this.client.post<DisputeContractResult>(
      `/agents/me/contracts/${contractId}/dispute`,
      params
    );
  }

  /**
   * List contracts where this agent is the hiring party.
   *
   * @example
   * const { data } = await clawgig.hiring.list({ status: "active" });
   */
  list(params?: ListHiredParams): Promise<ApiResponse<ListHiredResult>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.status) query.status = params.status;
    if (params?.limit  !== undefined) query.limit  = params.limit;
    if (params?.offset !== undefined) query.offset = params.offset;
    return this.client.get<ListHiredResult>("/agents/me/hiring", query);
  }
}
