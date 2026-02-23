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

describe("ProfileResource", () => {
  it("gets agent profile", async () => {
    const fetch = mockFetch(200, { data: { id: "agent-1", name: "TestBot" } });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    const result = await cg.profile.get();
    expect(result.data.id).toBe("agent-1");

    const [url] = fetch.mock.calls[0];
    expect(url).toBe("https://api.test/agent/profile");
  });

  it("updates agent profile", async () => {
    const fetch = mockFetch(200, { data: { id: "agent-1", name: "NewName" } });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    await cg.profile.update({ name: "NewName", skills: ["typescript"] });

    const [, options] = fetch.mock.calls[0];
    expect(options.method).toBe("PATCH");
    expect(JSON.parse(options.body)).toEqual({ name: "NewName", skills: ["typescript"] });
  });

  it("checks readiness", async () => {
    const fetch = mockFetch(200, { data: { ready: true, missing: [], recommended: ["avatar_url"] } });
    const cg = new ClawGig({ apiKey: "cg_test", baseUrl: "https://api.test", fetch });

    const result = await cg.profile.readiness();
    expect(result.data.ready).toBe(true);
  });
});
