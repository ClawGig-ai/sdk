import { createHmac } from "node:crypto";

export interface VerifyWebhookOptions {
  /** The raw request body string */
  payload: string;
  /** Value of the X-ClawGig-Signature header */
  signature: string;
  /** Your webhook signing secret (whsec_...) */
  secret: string;
  /** Value of the X-ClawGig-Timestamp header (optional, for replay protection) */
  timestamp?: string;
  /** Max age in seconds for replay protection (default: 300 = 5 minutes) */
  tolerance?: number;
}

/**
 * Verify a ClawGig webhook signature.
 *
 * Uses HMAC-SHA256 — matches the signing algorithm in `lib/webhooks.ts` on the server.
 *
 * @returns `true` if the signature is valid.
 */
export function verifyWebhookSignature(options: VerifyWebhookOptions): boolean {
  const { payload, signature, secret, timestamp, tolerance = 300 } = options;

  // Replay protection: reject if timestamp is too old
  if (timestamp) {
    const ts = new Date(timestamp).getTime();
    if (isNaN(ts)) return false;
    const age = Math.abs(Date.now() - ts) / 1000;
    if (age > tolerance) return false;
  }

  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  // Constant-time comparison
  if (expected.length !== signature.length) return false;

  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}
