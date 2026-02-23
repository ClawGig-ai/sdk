import { describe, it, expect, vi } from "vitest";
import { HttpClient } from "../src/client.js";
import {
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  RateLimitError,
  ApiError,
} from "../src/errors.js";

function mockFetch(status: number, body: unknown, headers?: Record<string, string>) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({
      "x-ratelimit-limit": "60",
      "x-ratelimit-remaining": "59",
      "x-ratelimit-reset": "1700000000",
      ...headers,
    }),
    json: () => Promise.resolve(body),
  });
}

describe("HttpClient", () => {
  it("makes a successful GET request", async () => {
    const fetch = mockFetch(200, { data: { id: "123" } });
    const client = new HttpClient({ apiKey: "cg_test", fetch, baseUrl: "https://api.test" });

    const result = await client.get<{ id: string }>("/test");

    expect(result.data).toEqual({ id: "123" });
    expect(result.status).toBe(200);
    expect(result.rateLimit?.limit).toBe(60);
    expect(fetch).toHaveBeenCalledOnce();

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("https://api.test/test");
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBe("Bearer cg_test");
  });

  it("makes a POST request with body", async () => {
    const fetch = mockFetch(201, { data: { created: true } });
    const client = new HttpClient({ apiKey: "cg_test", fetch, baseUrl: "https://api.test" });

    await client.post("/test", { name: "foo" });

    const [, options] = fetch.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe(JSON.stringify({ name: "foo" }));
  });

  it("appends query parameters", async () => {
    const fetch = mockFetch(200, { data: [] });
    const client = new HttpClient({ apiKey: "cg_test", fetch, baseUrl: "https://api.test" });

    await client.get("/gigs", { category: "code", limit: 10 });

    const [url] = fetch.mock.calls[0];
    expect(url).toContain("category=code");
    expect(url).toContain("limit=10");
  });

  it("strips undefined query parameters", async () => {
    const fetch = mockFetch(200, { data: [] });
    const client = new HttpClient({ apiKey: "cg_test", fetch, baseUrl: "https://api.test" });

    await client.get("/gigs", { category: undefined, limit: 5 });

    const [url] = fetch.mock.calls[0];
    expect(url).not.toContain("category");
    expect(url).toContain("limit=5");
  });

  it("throws AuthenticationError on 401", async () => {
    const fetch = mockFetch(401, { error: "Invalid API key" });
    const client = new HttpClient({ apiKey: "bad", fetch, baseUrl: "https://api.test" });

    await expect(client.get("/test")).rejects.toThrow(AuthenticationError);
  });

  it("throws ForbiddenError on 403", async () => {
    const fetch = mockFetch(403, { error: "Profile incomplete" });
    const client = new HttpClient({ apiKey: "cg_test", fetch, baseUrl: "https://api.test" });

    await expect(client.get("/test")).rejects.toThrow(ForbiddenError);
  });

  it("throws NotFoundError on 404", async () => {
    const fetch = mockFetch(404, { error: "Not found" });
    const client = new HttpClient({ apiKey: "cg_test", fetch, baseUrl: "https://api.test" });

    await expect(client.get("/test")).rejects.toThrow(NotFoundError);
  });

  it("throws ValidationError on 400", async () => {
    const fetch = mockFetch(400, { error: "Missing required field" });
    const client = new HttpClient({ apiKey: "cg_test", fetch, baseUrl: "https://api.test" });

    await expect(client.post("/test", {})).rejects.toThrow(ValidationError);
  });

  it("throws ConflictError on 409", async () => {
    const fetch = mockFetch(409, { error: "Already submitted" });
    const client = new HttpClient({ apiKey: "cg_test", fetch, baseUrl: "https://api.test" });

    await expect(client.post("/test", {})).rejects.toThrow(ConflictError);
  });

  it("throws RateLimitError on 429", async () => {
    const fetch = mockFetch(429, { error: "Too many requests", retryAfter: 30 }, { "retry-after": "30" });
    const client = new HttpClient({ apiKey: "cg_test", fetch, baseUrl: "https://api.test" });

    try {
      await client.get("/test");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).retryAfterSeconds).toBe(30);
    }
  });

  it("throws generic ApiError on 500", async () => {
    const fetch = mockFetch(500, { error: "Internal server error" });
    const client = new HttpClient({ apiKey: "cg_test", fetch, baseUrl: "https://api.test" });

    try {
      await client.get("/test");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(500);
    }
  });

  it("retries on 429 when retryOn429 is enabled", async () => {
    let calls = 0;
    const fetch = vi.fn().mockImplementation(() => {
      calls++;
      if (calls === 1) {
        return Promise.resolve({
          ok: false,
          status: 429,
          headers: new Headers({ "retry-after": "0", "x-ratelimit-limit": "60", "x-ratelimit-remaining": "0", "x-ratelimit-reset": "1700000000" }),
          json: () => Promise.resolve({ error: "Too many requests", retryAfter: 0 }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ "x-ratelimit-limit": "60", "x-ratelimit-remaining": "59", "x-ratelimit-reset": "1700000000" }),
        json: () => Promise.resolve({ data: { success: true } }),
      });
    });

    const client = new HttpClient({ apiKey: "cg_test", fetch, baseUrl: "https://api.test", retryOn429: true });
    const result = await client.get<{ success: boolean }>("/test");

    expect(result.data).toEqual({ success: true });
    expect(calls).toBe(2);
  });

  it("includes rate limit info in successful responses", async () => {
    const fetch = mockFetch(200, { data: {} });
    const client = new HttpClient({ apiKey: "cg_test", fetch, baseUrl: "https://api.test" });

    const result = await client.get("/test");
    expect(result.rateLimit).toEqual({ limit: 60, remaining: 59, reset: 1700000000 });
  });

  it("removes trailing slashes from baseUrl", async () => {
    const fetch = mockFetch(200, { data: {} });
    const client = new HttpClient({ apiKey: "cg_test", fetch, baseUrl: "https://api.test///" });

    await client.get("/path");
    const [url] = fetch.mock.calls[0];
    expect(url).toBe("https://api.test/path");
  });

  it("falls back to raw JSON when .data is missing", async () => {
    const fetch = mockFetch(200, { id: "abc", name: "test" });
    const client = new HttpClient({ apiKey: "cg_test", fetch, baseUrl: "https://api.test" });

    const result = await client.get<{ id: string; name: string }>("/test");
    expect(result.data).toEqual({ id: "abc", name: "test" });
  });
});
