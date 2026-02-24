import { describe, it, expect, vi } from "vitest";
import { ClawGig } from "../../src/clawgig.js";

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(),
    json: () => Promise.resolve(body),
  });
}

describe("AutonomousResource", () => {
  it("registers an autonomous agent without API key", async () => {
    const mockResult = {
      agent_id: "agent-1",
      user_id: "user-1",
      api_key: "cg_abc123",
      wallet_address: "9B5XszUGdMaxCZ7uoko2KQDuL29RNucPBKu4mS2e1Jzk",
      message: "Autonomous agent registered",
    };
    const fetch = mockFetch(201, mockResult);
    const cg = new ClawGig({ apiKey: "cg_existing", baseUrl: "https://api.test", fetch });

    const result = await cg.autonomous.register({
      name: "TestAgent",
      username: "testagent",
      description: "A test autonomous agent for unit testing",
      skills: ["typescript"],
      categories: ["code"],
      wallet_address: "9B5XszUGdMaxCZ7uoko2KQDuL29RNucPBKu4mS2e1Jzk",
    });

    expect(result.data.api_key).toBe("cg_abc123");
    expect(result.data.wallet_address).toBe("9B5XszUGdMaxCZ7uoko2KQDuL29RNucPBKu4mS2e1Jzk");

    // Verify no Authorization header was sent
    const [, init] = fetch.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBeUndefined();
    expect((fetch.mock.calls[0][0] as string)).toContain("/agents/register/autonomous");
  });

  it("gets agent balance", async () => {
    const fetch = mockFetch(200, { balance_usdc: 150.5, pending_escrow_usdc: 50 });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    const result = await cg.autonomous.getBalance();

    expect(result.data.balance_usdc).toBe(150.5);
    expect(result.data.pending_escrow_usdc).toBe(50);
    expect(fetch.mock.calls[0][0]).toContain("/agents/me/balance");
  });

  it("deposits USDC with tx signature", async () => {
    const fetch = mockFetch(200, {
      success: true,
      amount_usdc: 100,
      tx_signature: "5Abc123",
      balance_usdc: 250.5,
    });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    const result = await cg.autonomous.deposit({
      tx_signature: "5Abc123",
      amount_usdc: 100,
    });

    expect(result.data.success).toBe(true);
    expect(result.data.balance_usdc).toBe(250.5);
    expect(fetch.mock.calls[0][0]).toContain("/agents/me/deposit");
  });

  it("withdraws USDC", async () => {
    const fetch = mockFetch(200, {
      success: true,
      amount_usdc: 50,
      tx_signature: "XyZtx456",
      status: "confirmed",
      remaining_balance_usdc: 100,
    });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    const result = await cg.autonomous.withdraw({ amount_usdc: 50 });

    expect(result.data.status).toBe("confirmed");
    expect(result.data.remaining_balance_usdc).toBe(100);
    expect(fetch.mock.calls[0][0]).toContain("/agents/me/withdraw");
  });
});
