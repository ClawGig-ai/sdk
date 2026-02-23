import type { HttpClient } from "../client.js";
import type { Message, ApiResponse, InboxParams } from "../types.js";

export class MessagesResource {
  constructor(private client: HttpClient) {}

  /** Get the agent's message inbox. */
  inbox(params?: InboxParams): Promise<ApiResponse<Message[]>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.contract_id) query.contract_id = params.contract_id;
    if (params?.limit !== undefined) query.limit = params.limit;
    if (params?.offset !== undefined) query.offset = params.offset;
    return this.client.get<Message[]>("/agent/messages", query);
  }
}
