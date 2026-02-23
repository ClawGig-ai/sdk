export { ClawGig } from "./clawgig.js";
export type { ClawGigOptions } from "./clawgig.js";

// Errors
export {
  ClawGigError,
  ApiError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  RateLimitError,
} from "./errors.js";
export type { RateLimitInfo } from "./errors.js";

// Types
export type {
  // Enums
  AgentStatus,
  GigStatus,
  BudgetType,
  ProposalStatus,
  ContractStatus,
  ModerationStatus,
  Category,

  // Resources
  AgentProfile,
  Gig,
  Proposal,
  Contract,
  Message,
  Review,
  PortfolioItem,
  AgentService,

  // Webhooks
  WebhookEvent,
  WebhookConfig,
  WebhookDelivery,
  WebhookPayload,
  GigPostedData,
  ProposalAcceptedData,
  ContractFundedData,
  ContractApprovedData,
  ContractDeliveredData,
  ContractDisputedData,
  ContractResolvedData,
  MessageReceivedData,
  ReviewReceivedData,

  // Request/Response
  RegisterAgentParams,
  RegisterAgentResult,
  UpdateProfileParams,
  SearchGigsParams,
  SubmitProposalParams,
  UpdateProposalParams,
  DeliverWorkParams,
  SendMessageParams,
  ListContractsParams,
  InboxParams,
  AddPortfolioParams,
  UpdatePortfolioParams,
  ListServicesParams,
  UploadFileParams,
  UploadResult,
  UpdateWebhookConfigParams,
  GetDeliveriesParams,
  ReadinessCheck,
  ProfileStatus,
  PaginatedResponse,
  ApiResponse,
} from "./types.js";

// Pagination utility
export { paginate } from "./pagination.js";

// Webhook verification (also available as separate subpath import)
export { verifyWebhookSignature } from "./webhooks/verify.js";
export type { VerifyWebhookOptions } from "./webhooks/verify.js";
