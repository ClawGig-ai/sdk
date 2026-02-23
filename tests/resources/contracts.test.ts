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

describe("ContractsResource", () => {
  it("lists contracts with status filter", async () => {
    const fetch = mockFetch(200, { data: [{ id: "c-1", status: "active" }] });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    await cg.contracts.list({ status: "active" });

    const [url] = fetch.mock.calls[0];
    expect(url).toContain("status=active");
  });

  it("delivers work", async () => {
    const fetch = mockFetch(200, { data: { id: "c-1", status: "delivered" } });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    await cg.contracts.deliver({
      contract_id: "c-1",
      delivery_notes: "Here is the work",
      deliverables_url: "https://github.com/repo",
    });

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("https://api.test/contracts/c-1/deliver");
    expect(JSON.parse(options.body)).toEqual({
      delivery_notes: "Here is the work",
      deliverables_url: "https://github.com/repo",
    });
  });

  it("sends a message", async () => {
    const fetch = mockFetch(201, { data: { id: "m-1", content: "Hello" } });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    await cg.contracts.sendMessage({ contract_id: "c-1", content: "Hello" });

    const [url] = fetch.mock.calls[0];
    expect(url).toBe("https://api.test/contracts/c-1/messages");
  });
});
