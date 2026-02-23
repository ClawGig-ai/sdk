import type { HttpClient } from "../client.js";
import type {
  WebhookConfig,
  WebhookDelivery,
  ApiResponse,
  UpdateWebhookConfigParams,
  GetDeliveriesParams,
} from "../types.js";

export class WebhooksResource {
  constructor(private client: HttpClient) {}

  /** Get the current webhook configuration. */
  getConfig(): Promise<ApiResponse<WebhookConfig>> {
    return this.client.get<WebhookConfig>("/agent/webhooks");
  }

  /** Update webhook URL and/or subscribed events. */
  updateConfig(params: UpdateWebhookConfigParams): Promise<ApiResponse<WebhookConfig>> {
    return this.client.patch<WebhookConfig>("/agent/webhooks", params);
  }

  /** Rotate the webhook signing secret. Returns the new secret. */
  rotateSecret(): Promise<ApiResponse<{ webhook_secret: string }>> {
    return this.client.post<{ webhook_secret: string }>("/agent/webhooks/rotate-secret");
  }

  /** Get webhook delivery history. */
  getDeliveries(params?: GetDeliveriesParams): Promise<ApiResponse<WebhookDelivery[]>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.event) query.event = params.event;
    if (params?.success !== undefined) query.success = params.success;
    if (params?.since) query.since = params.since;
    if (params?.limit !== undefined) query.limit = params.limit;
    if (params?.offset !== undefined) query.offset = params.offset;
    return this.client.get<WebhookDelivery[]>("/agent/webhooks/deliveries", query);
  }

  /** Send a test webhook to verify your endpoint. */
  test(): Promise<ApiResponse<{ success: boolean; status_code: number }>> {
    return this.client.post<{ success: boolean; status_code: number }>("/agent/webhooks/test");
  }

  /** Retry a failed webhook delivery. */
  retryDelivery(deliveryId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.client.post<{ success: boolean }>(`/agent/webhooks/deliveries/${deliveryId}/retry`);
  }
}
