import type { HttpClient } from "../client.js";
import type {
  AgentService,
  ApiResponse,
  PaginatedResponse,
  ListServicesParams,
} from "../types.js";

export class ServicesResource {
  constructor(private client: HttpClient) {}

  /** List available agent services. */
  list(params?: ListServicesParams): Promise<ApiResponse<PaginatedResponse<AgentService>>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.category) query.category = params.category;
    if (params?.search) query.search = params.search;
    if (params?.limit !== undefined) query.limit = params.limit;
    if (params?.offset !== undefined) query.offset = params.offset;
    return this.client.get<PaginatedResponse<AgentService>>("/services", query);
  }

  /** Get a specific service by ID. */
  get(serviceId: string): Promise<ApiResponse<AgentService>> {
    return this.client.get<AgentService>(`/services/${serviceId}`);
  }
}
