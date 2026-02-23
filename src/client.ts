import {
  ApiError,
  AuthenticationError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "./errors.js";
import type { RateLimitInfo } from "./errors.js";
import type { ApiResponse } from "./types.js";

export interface ClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  retryOn429?: boolean;
  fetch?: typeof globalThis.fetch;
}

const DEFAULT_BASE_URL = "https://clawgig.ai/api/v1";
const DEFAULT_TIMEOUT = 30_000;
const MAX_429_RETRIES = 3;

function parseRateLimit(headers: Headers): RateLimitInfo | undefined {
  const limit = headers.get("x-ratelimit-limit");
  const remaining = headers.get("x-ratelimit-remaining");
  const reset = headers.get("x-ratelimit-reset");
  if (!limit) return undefined;
  return {
    limit: parseInt(limit, 10),
    remaining: parseInt(remaining ?? "0", 10),
    reset: parseInt(reset ?? "0", 10),
  };
}

function buildError(
  status: number,
  message: string,
  rateLimit?: RateLimitInfo,
  retryAfter?: number
): ApiError {
  switch (status) {
    case 400:
      return new ValidationError(message, rateLimit);
    case 401:
      return new AuthenticationError(message, rateLimit);
    case 403:
      return new ForbiddenError(message, rateLimit);
    case 404:
      return new NotFoundError(message, rateLimit);
    case 409:
      return new ConflictError(message, rateLimit);
    case 429:
      return new RateLimitError(message, retryAfter ?? 60, rateLimit);
    default:
      return new ApiError(message, status, rateLimit);
  }
}

export class HttpClient {
  readonly baseUrl: string;
  private apiKey?: string;
  private timeout: number;
  private retryOn429: boolean;
  private _fetch: typeof globalThis.fetch;

  constructor(options: ClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.apiKey = options.apiKey;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.retryOn429 = options.retryOn429 ?? false;
    this._fetch = options.fetch ?? globalThis.fetch;
  }

  async request<T>(
    method: string,
    path: string,
    options?: { body?: unknown; query?: Record<string, string | number | boolean | undefined>; noAuth?: boolean }
  ): Promise<ApiResponse<T>> {
    let url = `${this.baseUrl}${path}`;

    if (options?.query) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined && value !== null) {
          params.set(key, String(value));
        }
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }

    const headers: Record<string, string> = {};
    if (this.apiKey && !options?.noAuth) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }
    if (options?.body) {
      headers["Content-Type"] = "application/json";
    }

    let lastError: ApiError | undefined;

    for (let attempt = 0; attempt <= (this.retryOn429 ? MAX_429_RETRIES : 0); attempt++) {
      if (attempt > 0 && lastError instanceof RateLimitError) {
        const delay = Math.min(lastError.retryAfterSeconds * 1000, 60_000);
        await new Promise((r) => setTimeout(r, delay));
      }

      const res = await this._fetch(url, {
        method,
        headers,
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: AbortSignal.timeout(this.timeout),
      });

      const rateLimit = parseRateLimit(res.headers);
      const json = (await res.json().catch(() => null)) as Record<string, any> | null;

      if (res.ok) {
        return {
          data: (json?.data ?? json) as T,
          status: res.status,
          rateLimit,
        };
      }

      const message = json?.error?.message ?? json?.error ?? `HTTP ${res.status}`;
      const retryAfter = parseInt(res.headers.get("retry-after") ?? json?.retryAfter ?? "60", 10);
      lastError = buildError(res.status, message, rateLimit, retryAfter);

      if (res.status !== 429 || !this.retryOn429) {
        throw lastError;
      }
    }

    throw lastError!;
  }

  async uploadFormData<T>(
    path: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {};
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const res = await this._fetch(url, {
      method: "POST",
      headers,
      body: formData,
      signal: AbortSignal.timeout(this.timeout),
    });

    const rateLimit = parseRateLimit(res.headers);
    const json = (await res.json().catch(() => null)) as Record<string, any> | null;

    if (res.ok) {
      return {
        data: (json?.data ?? json) as T,
        status: res.status,
        rateLimit,
      };
    }

    const message = json?.error?.message ?? json?.error ?? `HTTP ${res.status}`;
    throw buildError(res.status, message, rateLimit);
  }

  get<T>(path: string, query?: Record<string, string | number | boolean | undefined>) {
    return this.request<T>("GET", path, { query });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>("POST", path, { body });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>("PATCH", path, { body });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>("PUT", path, { body });
  }

  del<T>(path: string) {
    return this.request<T>("DELETE", path);
  }
}
