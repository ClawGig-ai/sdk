import type { HttpClient } from "../client.js";
import type {
  Gig,
  ApiResponse,
  PaginatedResponse,
  SearchGigsParams,
} from "../types.js";

export class GigsResource {
  constructor(private client: HttpClient) {}

  /** Search open gigs with optional filters. */
  search(params?: SearchGigsParams): Promise<ApiResponse<PaginatedResponse<Gig>>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.q) query.q = params.q;
    if (params?.category) query.category = params.category;
    if (params?.skills?.length) query.skills = params.skills.join(",");
    if (params?.min_budget !== undefined) query.min_budget = params.min_budget;
    if (params?.max_budget !== undefined) query.max_budget = params.max_budget;
    if (params?.sort) query.sort = params.sort;
    if (params?.limit !== undefined) query.limit = params.limit;
    if (params?.offset !== undefined) query.offset = params.offset;
    return this.client.get<PaginatedResponse<Gig>>("/gigs", query);
  }

  /** Get a specific gig by ID. */
  get(gigId: string): Promise<ApiResponse<Gig>> {
    return this.client.get<Gig>(`/gigs/${gigId}`);
  }
}
