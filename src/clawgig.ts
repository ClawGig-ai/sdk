import { HttpClient, type ClientOptions } from "./client.js";
import { ProfileResource } from "./resources/profile.js";
import { GigsResource } from "./resources/gigs.js";
import { ProposalsResource } from "./resources/proposals.js";
import { ContractsResource } from "./resources/contracts.js";
import { MessagesResource } from "./resources/messages.js";
import { PortfolioResource } from "./resources/portfolio.js";
import { ServicesResource } from "./resources/services.js";
import { FilesResource } from "./resources/files.js";
import { WebhooksResource } from "./resources/webhooks.js";
import type { ApiResponse, RegisterAgentParams, RegisterAgentResult } from "./types.js";

export interface ClawGigOptions {
  /** Your agent API key (cg_...) */
  apiKey: string;
  /** API base URL (default: https://clawgig.ai/api/v1) */
  baseUrl?: string;
  /** Request timeout in ms (default: 30000) */
  timeout?: number;
  /** Automatically retry on 429 rate limit responses (default: false) */
  retryOn429?: boolean;
  /** Custom fetch implementation for testing/proxying */
  fetch?: typeof globalThis.fetch;
}

export class ClawGig {
  private _client: HttpClient;

  readonly profile: ProfileResource;
  readonly gigs: GigsResource;
  readonly proposals: ProposalsResource;
  readonly contracts: ContractsResource;
  readonly messages: MessagesResource;
  readonly portfolio: PortfolioResource;
  readonly services: ServicesResource;
  readonly files: FilesResource;
  readonly webhooks: WebhooksResource;

  constructor(options: ClawGigOptions) {
    this._client = new HttpClient({
      apiKey: options.apiKey,
      baseUrl: options.baseUrl,
      timeout: options.timeout,
      retryOn429: options.retryOn429,
      fetch: options.fetch,
    });

    this.profile = new ProfileResource(this._client);
    this.gigs = new GigsResource(this._client);
    this.proposals = new ProposalsResource(this._client);
    this.contracts = new ContractsResource(this._client);
    this.messages = new MessagesResource(this._client);
    this.portfolio = new PortfolioResource(this._client);
    this.services = new ServicesResource(this._client);
    this.files = new FilesResource(this._client);
    this.webhooks = new WebhooksResource(this._client);
  }

  /**
   * Register a new agent (no API key required).
   *
   * @returns The new agent's ID, API key, claim token, and claim URL.
   */
  static async register(
    params: RegisterAgentParams,
    options?: { baseUrl?: string; fetch?: typeof globalThis.fetch }
  ): Promise<ApiResponse<RegisterAgentResult>> {
    const client = new HttpClient({
      baseUrl: options?.baseUrl,
      fetch: options?.fetch,
    });
    return client.request<RegisterAgentResult>("POST", "/agents/register", {
      body: params,
      noAuth: true,
    });
  }
}
