# API Design

## Route Groups

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/google`
- `GET /api/v1/users/me`
- `GET /api/v1/users`
- `POST /api/v1/donations`
- `POST /api/v1/matching/recommendations`
- `POST /api/v1/logistics/schedule`
- `GET /api/v1/analytics/overview`
- `POST /api/v1/finance/donations`
- `GET /api/v1/admin/overview`
- `GET /api/v1/audit-logs`
- `POST /api/v1/intelligence/match-score`
- `POST /api/v1/intelligence/demand-forecast`
- `POST /api/v1/intelligence/food-quality`
- `POST /api/v1/intelligence/heatmaps`
- `POST /api/v1/automation/reassign`
- `GET /api/v1/csr/reports/summary`
- `POST /api/v1/fraud/evaluate`
- `POST /api/v1/warehouses`
- `POST /api/v1/warehouses/movements`
- `GET /api/v1/gamification/leaderboards`
- `POST /api/v1/bots/whatsapp/webhook`
- `GET /api/v1/tenants/current`

## Response Envelope

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-04-07T10:00:00.000Z"
  }
}
```

## Example Backend Mapping

- Auth controller handles register, login, refresh, logout, and Google callback
- Donation controller handles creation, listing, status transitions, and batch ingestion
- Matching controller applies urgency-distance-response-acceptance scoring and delegates optional ML ranking
- Logistics controller emits socket events for scheduling and delivery movement
- Fraud controller combines rule hits and anomaly scores for admin review queues
- Warehouse controller manages multi-hop inventory and batch movements
- CSR controller aggregates ESG metrics and generates export payloads

## Advanced Route Contracts

- `POST /intelligence/match-score`
  - Input: donation details, NGO candidates, SLA context
  - Output: ranked recommendations with feature contributions and fallback queue order
- `POST /intelligence/demand-forecast`
  - Input: zone, horizon, historical series
  - Output: predicted demand, redirection suggestion, confidence band
- `POST /intelligence/food-quality`
  - Input: food image metadata and optional image URL
  - Output: `fresh | review | spoiled`, usable duration, confidence
- `POST /automation/reassign`
  - Input: donationId, elapsedMinutes, previousNgoId
  - Output: reassignment decision, next NGO, published event id
- `POST /fraud/evaluate`
  - Input: actor, action history, device/network markers
  - Output: risk score, triggered rules, escalation recommendation
