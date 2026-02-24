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

describe("HiringResource", () => {
  it("creates a gig as hiring agent", async () => {
    const fetch = mockFetch(201, {
      gig_id: "gig-123",
      title: "Build a REST API",
      status: "open",
      moderation_status: "approved",
      moderation_reason: null,
      created_at: "2026-02-24T00:00:00Z",
    });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    const result = await cg.hiring.createGig({
      title: "Build a REST API",
      description: "I need an Express API with 5 endpoints and TypeScript types",
      category: "code",
      skills_required: ["typescript", "express"],
      budget_usdc: 250,
    });

    expect(result.data.gig_id).toBe("gig-123");
    expect(result.data.moderation_status).toBe("approved");
    expect(fetch.mock.calls[0][0]).toContain("/agents/me/gigs");
  });

  it("accepts a proposal", async () => {
    const fetch = mockFetch(201, {
      contract_id: "contract-456",
      gig_id: "gig-123",
      proposal_id: "proposal-789",
      amount_usdc: 250,
      status: "active",
      created_at: "2026-02-24T00:00:00Z",
      message: "Proposal accepted. Fund escrow to start work.",
    });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    const result = await cg.hiring.acceptProposal("gig-123", {
      proposal_id: "proposal-789",
    });

    expect(result.data.contract_id).toBe("contract-456");
    expect(fetch.mock.calls[0][0]).toContain("/agents/me/gigs/gig-123/accept-proposal");
  });

  it("funds escrow from internal balance (Path B)", async () => {
    const fetch = mockFetch(200, {
      success: true,
      contract_id: "contract-456",
      escrow_amount: 250,
      fee_amount: 12.5,
      payment_method: "internal_balance",
    });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    const result = await cg.hiring.fundEscrow("contract-456");

    expect(result.data.payment_method).toBe("internal_balance");
    expect(result.data.escrow_amount).toBe(250);

    const [, init] = fetch.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["PAYMENT-SIGNATURE"]).toBeUndefined();
    expect(fetch.mock.calls[0][0]).toContain("/agents/me/contracts/contract-456/fund-escrow");
  });

  it("funds escrow via x402 payment (Path A)", async () => {
    const fetch = mockFetch(200, {
      success: true,
      contract_id: "contract-456",
      escrow_amount: 250,
      fee_amount: 0,
      payment_method: "x402",
      tx_signature: "on-chain-tx-sig",
    });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    const paymentSig = "base64encodedPaymentSignature==";
    const result = await cg.hiring.fundEscrow("contract-456", {
      x402Payment: paymentSig,
    });

    expect(result.data.payment_method).toBe("x402");

    const [, init] = fetch.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["PAYMENT-SIGNATURE"]).toBe(paymentSig);
  });

  it("approves a delivered contract", async () => {
    const fetch = mockFetch(200, {
      success: true,
      contract_id: "contract-456",
      status: "approved",
      completed_at: "2026-02-24T12:00:00Z",
      payout: 225,
      fee: 25,
    });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    const result = await cg.hiring.approve("contract-456");

    expect(result.data.status).toBe("approved");
    expect(result.data.payout).toBe(225);
    expect(fetch.mock.calls[0][0]).toContain("/agents/me/contracts/contract-456/approve");
  });

  it("opens a dispute", async () => {
    const fetch = mockFetch(200, {
      success: true,
      contract_id: "contract-456",
      status: "disputed",
    });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    const result = await cg.hiring.dispute("contract-456", {
      reason: "The delivered work does not meet the agreed requirements.",
    });

    expect(result.data.status).toBe("disputed");
    expect(fetch.mock.calls[0][0]).toContain("/agents/me/contracts/contract-456/dispute");
  });

  it("lists hired contracts with status filter", async () => {
    const fetch = mockFetch(200, {
      data: [{ id: "contract-456", status: "active" }],
      total: 1,
      limit: 20,
      offset: 0,
    });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    await cg.hiring.list({ status: "active", limit: 20 });

    const url = fetch.mock.calls[0][0] as string;
    expect(url).toContain("/agents/me/hiring");
    expect(url).toContain("status=active");
    expect(url).toContain("limit=20");
  });
});
