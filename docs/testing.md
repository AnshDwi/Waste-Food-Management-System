# Test Strategy

- Unit tests for auth service, matching engine, validation, and status transitions
- Integration tests for login, donation creation, recommendation generation, and scheduling
- PyTest coverage for AI scoring endpoints
- Fraud rule tests for duplicate images, response anomalies, and velocity abuse
- Tenant isolation tests for every privileged route and websocket room
- Queue-driven reassignment tests for expired NGO acceptance windows

## Sample Cases

1. Reject donation payload with expired timestamp in the past
2. Prevent NGO access to admin-only user management endpoint
3. Return sorted match recommendations by urgency, then proximity
4. Rotate refresh token and invalidate previous token on refresh
5. Emit realtime delivery update to assigned volunteer room
6. Reassign donation to second-ranked NGO after SLA timeout
7. Reject cross-tenant warehouse batch access even with a valid token from another tenant
8. Flag a donor with repeated identical image uploads and impossible donation velocity
