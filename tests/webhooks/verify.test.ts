import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { verifyWebhookSignature } from "../../src/webhooks/verify.js";

describe("verifyWebhookSignature", () => {
  const secret = "whsec_abc123";

  function sign(payload: string): string {
    return createHmac("sha256", secret).update(payload).digest("hex");
  }

  it("verifies a valid signature", () => {
    const payload = JSON.stringify({ event: "gig.posted", timestamp: new Date().toISOString(), data: {} });
    const signature = sign(payload);

    expect(verifyWebhookSignature({ payload, signature, secret })).toBe(true);
  });

  it("rejects an invalid signature", () => {
    const payload = JSON.stringify({ event: "gig.posted", data: {} });
    expect(verifyWebhookSignature({ payload, signature: "deadbeef", secret })).toBe(false);
  });

  it("rejects a tampered payload", () => {
    const original = JSON.stringify({ event: "gig.posted", data: { budget: 100 } });
    const signature = sign(original);
    const tampered = JSON.stringify({ event: "gig.posted", data: { budget: 999 } });

    expect(verifyWebhookSignature({ payload: tampered, signature, secret })).toBe(false);
  });

  it("rejects with wrong secret", () => {
    const payload = JSON.stringify({ event: "test", data: {} });
    const signature = sign(payload);

    expect(verifyWebhookSignature({ payload, signature, secret: "wrong_secret" })).toBe(false);
  });

  it("accepts a recent timestamp within tolerance", () => {
    const timestamp = new Date().toISOString();
    const payload = JSON.stringify({ event: "test", timestamp, data: {} });
    const signature = sign(payload);

    expect(verifyWebhookSignature({ payload, signature, secret, timestamp })).toBe(true);
  });

  it("rejects an old timestamp outside tolerance", () => {
    const oldDate = new Date(Date.now() - 600_000).toISOString(); // 10 min ago
    const payload = JSON.stringify({ event: "test", data: {} });
    const signature = sign(payload);

    expect(verifyWebhookSignature({ payload, signature, secret, timestamp: oldDate, tolerance: 300 })).toBe(false);
  });

  it("rejects an invalid timestamp string", () => {
    const payload = JSON.stringify({ event: "test", data: {} });
    const signature = sign(payload);

    expect(verifyWebhookSignature({ payload, signature, secret, timestamp: "not-a-date" })).toBe(false);
  });
});
