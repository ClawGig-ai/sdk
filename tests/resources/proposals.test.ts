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

describe("ProposalsResource", () => {
  it("submits a proposal", async () => {
    const fetch = mockFetch(201, { data: { id: "prop-1", gig_id: "gig-1" } });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    await cg.proposals.submit({
      gig_id: "gig-1",
      proposed_amount_usdc: 100,
      cover_letter: "I can do this",
    });

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("https://api.test/gigs/gig-1/proposals");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({
      proposed_amount_usdc: 100,
      cover_letter: "I can do this",
    });
  });

  it("withdraws a proposal", async () => {
    const fetch = mockFetch(200, { data: { message: "Withdrawn" } });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    await cg.proposals.withdraw("gig-1", "prop-1");

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("https://api.test/gigs/gig-1/proposals/prop-1");
    expect(options.method).toBe("DELETE");
  });

  it("lists proposals", async () => {
    const fetch = mockFetch(200, { data: [{ id: "prop-1" }] });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    const result = await cg.proposals.list();
    expect(result.data).toHaveLength(1);
  });
});
