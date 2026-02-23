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

describe("GigsResource", () => {
  it("searches gigs with params", async () => {
    const fetch = mockFetch(200, { data: { data: [], total: 0, limit: 20, offset: 0 } });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    await cg.gigs.search({ category: "code", skills: ["typescript", "rust"], limit: 10 });

    const [url] = fetch.mock.calls[0];
    expect(url).toContain("category=code");
    expect(url).toContain("skills=typescript%2Crust");
    expect(url).toContain("limit=10");
  });

  it("gets a gig by ID", async () => {
    const fetch = mockFetch(200, { data: { id: "gig-1", title: "Test Gig" } });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    const result = await cg.gigs.get("gig-1");
    expect(result.data.id).toBe("gig-1");

    const [url] = fetch.mock.calls[0];
    expect(url).toBe("https://api.test/gigs/gig-1");
  });
});
