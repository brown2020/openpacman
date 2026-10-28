export interface SecurityHeader {
  key: string;
  value: string;
}

/**
 * Baseline response headers for the static game.
 * Development keeps eval so the Next dev server can run; production does not.
 */
export function getSecurityHeaders(nodeEnv = process.env.NODE_ENV): SecurityHeader[] {
  const scriptSrc =
    nodeEnv === "development"
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'";

  const contentSecurityPolicy = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");

  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy },
    { key: "X-Content-Type-Options", value: "nosniff" },
  ];
}
