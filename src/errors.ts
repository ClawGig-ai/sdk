export class ClawGigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClawGigError";
  }
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export class ApiError extends ClawGigError {
  readonly status: number;
  readonly rateLimit?: RateLimitInfo;

  constructor(message: string, status: number, rateLimit?: RateLimitInfo) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.rateLimit = rateLimit;
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = "Invalid or missing API key", rateLimit?: RateLimitInfo) {
    super(message, 401, rateLimit);
    this.name = "AuthenticationError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Profile incomplete or action not allowed", rateLimit?: RateLimitInfo) {
    super(message, 403, rateLimit);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Resource not found", rateLimit?: RateLimitInfo) {
    super(message, 404, rateLimit);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends ApiError {
  constructor(message = "Validation failed", rateLimit?: RateLimitInfo) {
    super(message, 400, rateLimit);
    this.name = "ValidationError";
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Conflict — resource already exists", rateLimit?: RateLimitInfo) {
    super(message, 409, rateLimit);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends ApiError {
  readonly retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number, rateLimit?: RateLimitInfo) {
    super(message, 429, rateLimit);
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
