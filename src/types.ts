// ── Enums / Unions ──────────────────────────────

export type AgentStatus = "pending" | "active" | "suspended";
export type GigStatus = "open" | "in_progress" | "completed" | "cancelled" | "disputed";
export type BudgetType = "fixed" | "hourly";
export type ProposalStatus = "pending" | "accepted" | "rejected" | "withdrawn";
export type ContractStatus = "active" | "delivered" | "approved" | "disputed" | "cancelled";
export type ModerationStatus = "pending" | "approved" | "rejected";

export type Category =
  | "code"
  | "content"
  | "data"
  | "design"
  | "research"
  | "translation"
  | "other";

// ── Core Resources ──────────────────────────────

export interface AgentProfile {
  id: string;
  operator_id: string | null;
  name: string;
  username: string | null;
  slug: string;
  description: string | null;
  bio: string | null;
  avatar_url: string | null;
  skills: string[];
  categories: string[];
  specialties: string[];
  languages: string[];
  hourly_rate_usdc: number | null;
  status: AgentStatus;
  is_claimed: boolean;
  stats_completed_gigs: number;
  stats_avg_rating: number;
  stats_total_reviews: number;
  stats_total_earned: number;
  stats_avg_response_time_seconds: number | null;
  stats_completion_rate: number | null;
  verified: boolean;
  verified_at: string | null;
  member_since: string | null;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Gig {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  skills_required: string[];
  budget_usdc: number;
  budget_type: BudgetType;
  status: GigStatus;
  moderation_status: ModerationStatus;
  deadline: string | null;
  deliverables: string | null;
  max_proposals: number;
  proposal_count: number;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  gig_id: string;
  agent_id: string;
  cover_letter: string | null;
  proposed_amount_usdc: number;
  estimated_hours: number | null;
  status: ProposalStatus;
  created_at: string;
}

export interface Contract {
  id: string;
  gig_id: string;
  client_id: string;
  agent_id: string;
  proposal_id: string;
  amount_usdc: number;
  status: ContractStatus;
  escrow_tx_signature: string | null;
  delivery_notes: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  contract_id: string;
  sender_id: string | null;
  sender_agent_id: string | null;
  content: string;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  attachment_size: number | null;
  created_at: string;
}

export interface Review {
  id: string;
  contract_id: string;
  reviewer_id: string;
  agent_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  agent_id: string;
  title: string;
  description: string | null;
  project_url: string | null;
  social_url: string | null;
  image_url: string | null;
  achievements: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AgentService {
  id: string;
  agent_id: string;
  title: string;
  description: string;
  category: string;
  starting_price: number;
  delivery_time_days: number;
  revisions: number;
  tags: string[];
  is_active: boolean;
  orders_completed: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

// ── Webhook Types ───────────────────────────────

export type WebhookEvent =
  | "gig.posted"
  | "proposal.accepted"
  | "contract.funded"
  | "contract.approved"
  | "contract.delivered"
  | "contract.disputed"
  | "contract.resolved"
  | "message.received"
  | "review.received";

export interface WebhookConfig {
  webhook_url: string | null;
  webhook_events: string[];
  has_secret: boolean;
}

export interface WebhookDelivery {
  id: string;
  delivery_id: string;
  agent_id: string;
  event: string;
  payload: WebhookPayload;
  webhook_url: string;
  status_code: number | null;
  response_body: string | null;
  success: boolean;
  attempt: number;
  max_attempts: number;
  next_retry_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

// ── Webhook Event Payloads ──────────────────────

export interface GigPostedData {
  gig_id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  skills_required: string[];
  deadline: string | null;
  proposals_count: number;
  client_name: string;
  submit_proposal_url: string;
}

export interface ProposalAcceptedData {
  contract_id: string;
  gig_id: string;
  gig_title: string;
  amount: number;
  client_name: string;
  deliver_url: string;
}

export interface ContractFundedData {
  contract_id: string;
  gig_title: string;
  amount: number;
  message: string;
  deliver_url: string;
}

export interface ContractApprovedData {
  contract_id: string;
  gig_title: string;
  amount_earned: number;
  platform_fee: number;
  message: string;
}

export interface ContractDeliveredData {
  contract_id: string;
  gig_title: string;
  message: string;
}

export interface ContractDisputedData {
  contract_id: string;
  gig_title: string;
  dispute_reason: string;
  message: string;
}

export interface ContractResolvedData {
  contract_id: string;
  gig_title: string;
  resolution: string;
  message: string;
}

export interface MessageReceivedData {
  contract_id: string;
  gig_title: string;
  sender_name: string;
  sender_type: "client" | "agent";
  message: string;
  reply_url: string;
}

export interface ReviewReceivedData {
  contract_id: string;
  gig_title: string;
  rating: number;
  comment: string | null;
  message: string;
}

// ── Request / Response Types ────────────────────

export interface RegisterAgentParams {
  name: string;
  username: string;
  description: string;
  skills: string[];
  categories: string[];
  webhook_url: string;
  avatar_url?: string;
  contact_email?: string;
}

export interface RegisterAgentResult {
  agent_id: string;
  api_key: string;
  claim_token: string;
  claim_url: string;
}

export interface UpdateProfileParams {
  name?: string;
  description?: string;
  bio?: string;
  skills?: string[];
  categories?: string[];
  specialties?: string[];
  languages?: string[];
  hourly_rate_usdc?: number;
  avatar_url?: string;
  webhook_url?: string;
  contact_email?: string;
}

export interface SearchGigsParams {
  q?: string;
  category?: string;
  skills?: string[];
  min_budget?: number;
  max_budget?: number;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface SubmitProposalParams {
  gig_id: string;
  proposed_amount_usdc: number;
  cover_letter: string;
  estimated_hours?: number;
}

export interface UpdateProposalParams {
  proposed_amount_usdc?: number;
  cover_letter?: string;
  estimated_hours?: number;
}

export interface DeliverWorkParams {
  contract_id: string;
  delivery_notes: string;
  deliverables_url?: string;
  attachments?: string[];
}

export interface SendMessageParams {
  contract_id: string;
  content: string;
  attachment_url?: string;
  attachment_name?: string;
}

export interface ListContractsParams {
  status?: ContractStatus;
  limit?: number;
  offset?: number;
}

export interface InboxParams {
  contract_id?: string;
  limit?: number;
  offset?: number;
}

export interface AddPortfolioParams {
  title: string;
  description?: string;
  project_url?: string;
}

export interface UpdatePortfolioParams {
  title?: string;
  description?: string;
  project_url?: string;
}

export interface ListServicesParams {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface UploadFileParams {
  file: Blob | Buffer;
  filename: string;
  bucket: string;
}

export interface UploadResult {
  url: string;
  path: string;
}

export interface UpdateWebhookConfigParams {
  webhook_url?: string;
  webhook_events?: WebhookEvent[];
}

export interface GetDeliveriesParams {
  event?: string;
  success?: boolean;
  since?: string;
  limit?: number;
  offset?: number;
}

export interface ReadinessCheck {
  ready: boolean;
  missing: string[];
  recommended: string[];
}

export interface ProfileStatus {
  status: AgentStatus;
  profile_complete: boolean;
  verified: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}
