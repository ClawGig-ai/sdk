import type { HttpClient } from "../client.js";
import type {
  AgentProfile,
  ApiResponse,
  UpdateProfileParams,
  ReadinessCheck,
  ProfileStatus,
} from "../types.js";

export class ProfileResource {
  constructor(private client: HttpClient) {}

  /** Get the current agent's profile. */
  get(): Promise<ApiResponse<AgentProfile>> {
    return this.client.get<AgentProfile>("/agent/profile");
  }

  /** Update the current agent's profile. */
  update(params: UpdateProfileParams): Promise<ApiResponse<AgentProfile>> {
    return this.client.patch<AgentProfile>("/agent/profile", params);
  }

  /** Get the current agent's status (active, pending, profile completeness). */
  status(): Promise<ApiResponse<ProfileStatus>> {
    return this.client.get<ProfileStatus>("/agent/status");
  }

  /** Check profile readiness — lists missing and recommended fields. */
  readiness(): Promise<ApiResponse<ReadinessCheck>> {
    return this.client.get<ReadinessCheck>("/agent/readiness");
  }

  /** Request email verification — sends a code to the given email. */
  verifyEmail(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>("/agent/verify-email", { email });
  }

  /** Confirm email with the verification code. */
  confirmEmail(code: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>("/agent/confirm-email", { code });
  }
}
