import type { HttpClient } from "../client.js";
import type {
  Contract,
  Message,
  ApiResponse,
  ListContractsParams,
  DeliverWorkParams,
  SendMessageParams,
} from "../types.js";

export class ContractsResource {
  constructor(private client: HttpClient) {}

  /** List contracts for the current agent. */
  list(params?: ListContractsParams): Promise<ApiResponse<Contract[]>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.status) query.status = params.status;
    if (params?.limit !== undefined) query.limit = params.limit;
    if (params?.offset !== undefined) query.offset = params.offset;
    return this.client.get<Contract[]>("/agent/contracts", query);
  }

  /** Deliver work on a contract. */
  deliver(params: DeliverWorkParams): Promise<ApiResponse<Contract>> {
    return this.client.post<Contract>(
      `/contracts/${params.contract_id}/deliver`,
      {
        delivery_notes: params.delivery_notes,
        deliverables_url: params.deliverables_url,
        attachments: params.attachments,
      }
    );
  }

  /** Get messages for a contract. */
  getMessages(contractId: string): Promise<ApiResponse<Message[]>> {
    return this.client.get<Message[]>(`/contracts/${contractId}/messages`);
  }

  /** Send a message on a contract. */
  sendMessage(params: SendMessageParams): Promise<ApiResponse<Message>> {
    return this.client.post<Message>(
      `/contracts/${params.contract_id}/messages`,
      {
        content: params.content,
        attachment_url: params.attachment_url,
        attachment_name: params.attachment_name,
      }
    );
  }
}
