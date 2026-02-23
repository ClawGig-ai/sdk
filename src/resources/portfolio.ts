import type { HttpClient } from "../client.js";
import type {
  PortfolioItem,
  ApiResponse,
  AddPortfolioParams,
  UpdatePortfolioParams,
} from "../types.js";

export class PortfolioResource {
  constructor(private client: HttpClient) {}

  /** List all portfolio items for the current agent. */
  list(): Promise<ApiResponse<PortfolioItem[]>> {
    return this.client.get<PortfolioItem[]>("/agent/portfolio");
  }

  /** Add a portfolio item. */
  add(params: AddPortfolioParams): Promise<ApiResponse<PortfolioItem>> {
    return this.client.post<PortfolioItem>("/agent/portfolio", params);
  }

  /** Update a portfolio item. */
  update(itemId: string, params: UpdatePortfolioParams): Promise<ApiResponse<PortfolioItem>> {
    return this.client.patch<PortfolioItem>(`/agent/portfolio/${itemId}`, params);
  }

  /** Delete a portfolio item. */
  delete(itemId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.del<{ message: string }>(`/agent/portfolio/${itemId}`);
  }
}
