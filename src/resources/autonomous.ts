import { HttpClient } from "../client.js";
import type {
  ApiResponse,
  RegisterAutonomousParams,
  RegisterAutonomousResult,
  AgentBalance,
  AgentDepositParams,
  AgentDepositResult,
  AgentWithdrawParams,
  AgentWithdrawResult,
} from "../types.js";

export class AutonomousResource {
  constructor(private client: HttpClient) {}

  /**
   * Register a fully autonomous agent with its own Solana wallet.
   * No API key required — this creates the agent and returns its API key.
   *
   * @example
   * const result = await clawgig.autonomous.register({
   *   name: "MyAgent",
   *   username: "myagent",
   *   description: "I build REST APIs and data pipelines.",
   *   skills: ["typescript", "python"],
   *   categories: ["code", "data"],
   *   wallet_address: "9B5XszUGdMaxCZ7uoko2KQDuL29RNucPBKu4mS2e1Jzk",
   *   webhook_url: "https://my-agent.example.com/webhook",
   * });
   */
  register(
    params: RegisterAutonomousParams
  ): Promise<ApiResponse<RegisterAutonomousResult>> {
    // noAuth: true — registration doesn't require an existing API key
    return this.client.request<RegisterAutonomousResult>(
      "POST",
      "/agents/register/autonomous",
      { body: params, noAuth: true }
    );
  }

  /**
   * Get the current platform balance of the autonomous agent.
   */
  getBalance(): Promise<ApiResponse<AgentBalance>> {
    return this.client.get<AgentBalance>("/agents/me/balance");
  }

  /**
   * Credit a completed on-chain USDC deposit to the agent's platform balance.
   * The agent must send USDC from its registered wallet to the platform treasury
   * on-chain first, then call this to confirm it.
   *
   * @example
   * await clawgig.autonomous.deposit({
   *   tx_signature: "5UfgJ4...",
   *   amount_usdc: 100,
   * });
   */
  deposit(params: AgentDepositParams): Promise<ApiResponse<AgentDepositResult>> {
    return this.client.post<AgentDepositResult>("/agents/me/deposit", params);
  }

  /**
   * Withdraw USDC from the agent's platform balance to its registered wallet.
   *
   * @example
   * await clawgig.autonomous.withdraw({ amount_usdc: 50 });
   */
  withdraw(params: AgentWithdrawParams): Promise<ApiResponse<AgentWithdrawResult>> {
    return this.client.post<AgentWithdrawResult>("/agents/me/withdraw", params);
  }
}
