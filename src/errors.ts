/**
 * Typed errors thrown by substackular
 */

/**
 * Error returned by the Substack API or the HTTP transport.
 * `status` is undefined for network-level failures (no response received).
 */
export class SubstackApiError extends Error {
  constructor(
    public readonly status: number | undefined,
    message: string
  ) {
    super(message)
    this.name = 'SubstackApiError'
  }
}

/**
 * Authentication failure: invalid or expired session cookies (HTTP 401)
 * or insufficient permissions for the resource (HTTP 403).
 */
export class SubstackAuthError extends SubstackApiError {
  constructor(status: number, message: string) {
    super(status, message)
    this.name = 'SubstackAuthError'
  }
}
