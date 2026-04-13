# Security Best Practices

- Hash credentials with bcrypt and rotate refresh tokens on every renewal
- Lock down headers with Helmet, CSP, HSTS, frame-ancestors, and no-sniff
- Enforce strict input validation and output encoding to reduce injection and XSS risk
- Limit abuse with IP + user-aware rate limiting and Redis-backed counters in production
- Maintain append-only audit logs for auth, donation status changes, assignments, and admin actions
- Sanitize request payloads and query filters to block NoSQL operator injection and stored XSS vectors
- Require tenant-bound authorization checks so users cannot pivot across organizations with forged headers
- Sign webhook callbacks for WhatsApp, payment, and bot integrations, and verify replay windows
- Encrypt sensitive fields at rest, especially phone numbers, addresses, OAuth identities, and tenant secrets
- Partition websocket channels by tenant and permission scope to prevent cross-tenant event leakage
- Run fraud and anomaly rules on login spikes, fake geo coordinates, duplicate images, and suspicious acceptance loops
- Introduce device fingerprinting, IP reputation, and impossible-travel checks for privileged accounts
- Mirror critical donation and audit records to immutable storage or optional blockchain anchors for non-repudiation
