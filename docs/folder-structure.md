# Folder Structure Changes

- `apps/api-gateway/src/modules/intelligence`: smart matching, demand forecasting, heatmaps, food quality orchestration
- `apps/api-gateway/src/modules/automation`: SLA timers, reallocation queue logic, fallback sequencing
- `apps/api-gateway/src/modules/fraud`: rule-based anomaly evaluation and review workflows
- `apps/api-gateway/src/modules/tenants`: tenant context and enterprise feature access
- `apps/api-gateway/src/modules/csr`: ESG reporting and export summaries
- `apps/api-gateway/src/modules/warehouses`: warehouse and batch movement orchestration
- `apps/api-gateway/src/modules/gamification`: leaderboards, badges, community signals
- `apps/api-gateway/src/modules/bots`: WhatsApp and conversational entrypoints
- `apps/api-gateway/src/common/middleware/tenant-context.ts`: tenant resolution and isolation helper
- `apps/api-gateway/src/common/middleware/sanitize.ts`: request sanitization guard
- `apps/web/src/pages/GeoIntelligencePage.tsx`: map and heatmap console
- `apps/web/src/pages/WarehousesPage.tsx`: warehouse and inventory UI
- `apps/web/src/pages/CsrPage.tsx`: CSR and ESG reporting dashboard
- `apps/web/src/pages/CommunityPage.tsx`: leaderboards and badges
