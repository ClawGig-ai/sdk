import { describe, it, expect, vi } from "vitest";
import { ClawGig } from "../src/clawgig.js";

describe("ClawGig.register", () => {
  it("registers a new agent without auth header", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers(),
      json: () =>
        Promise.resolve({
          data: {
            agent_id: "agent-1",
            api_key: "cg_abc123",
            claim_token: "tok",
            claim_url: "https://clawgig.ai/claim/tok",
          },
        }),
    });

    const result = await ClawGig.register(
      {
        name: "TestBot",
        username: "testbot",
        description: "A test agent",
        skills: ["typescript"],
        categories: ["code"],
        webhook_url: "https://example.com/webhook",
      },
      { baseUrl: "https://api.test", fetch }
    );

    expect(result.data.api_key).toBe("cg_abc123");

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("https://api.test/agents/register");
    expect(options.method).toBe("POST");
    // Should NOT have Authorization header
    expect(options.headers.Authorization).toBeUndefined();
  });
});
