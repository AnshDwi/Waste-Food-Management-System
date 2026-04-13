# Database Schema

## ER Diagram

```mermaid
erDiagram
    TENANTS ||--o{ USERS : owns
    TENANTS ||--o{ DONATIONS : partitions
    TENANTS ||--o{ WAREHOUSES : operates
    TENANTS ||--o{ CSR_REPORTS : exports
    USERS ||--o{ DONATIONS : creates
    USERS ||--o{ AUDIT_LOGS : performs
    USERS ||--o{ DELIVERIES : fulfills
    USERS ||--o{ NOTIFICATIONS : receives
    NGO_PROFILES ||--o{ MATCHES : receives
    DONATIONS ||--o{ FOOD_BATCHES : contains
    DONATIONS ||--o{ MATCHES : scored_for
    DONATIONS ||--o{ DELIVERIES : shipped_via
    DONATIONS ||--o{ EXPIRY_ALERTS : triggers
    DONATIONS ||--o{ FOOD_QUALITY_ASSESSMENTS : analyzed_by
    DONATIONS ||--o{ BLOCKCHAIN_LOGS : notarized_in
    WAREHOUSES ||--o{ INVENTORY_BATCHES : stores
    INVENTORY_BATCHES ||--o{ BATCH_MOVEMENTS : moves
    USERS ||--o{ RATINGS : earns
    USERS ||--o{ REWARDS : receives
    NGO_PROFILES ||--o{ DEMAND_FORECASTS : predicted_for
    USERS ||--o{ FRAUD_FLAGS : flagged
    TENANTS {
      string id PK
      string name
      string tier
      json feature_flags
      json branding
      string isolation_strategy
    }
    USERS {
      string id PK
      string tenant_id FK
      string role
      string email
      string password_hash
      string status
      point location
      json permissions
      datetime last_login_at
    }
    NGO_PROFILES {
      string id PK
      string user_id FK
      int max_daily_capacity
      string verification_status
      json service_areas
      json food_preferences
    }
    DONATIONS {
      string id PK
      string tenant_id FK
      string donor_id FK
      string ngo_id FK
      string status
      int total_quantity
      datetime expiry_at
      point pickup_location
      json images
    }
    FOOD_BATCHES {
      string id PK
      string donation_id FK
      string food_type
      int quantity
      datetime cooked_at
      datetime expiry_at
      string freshness_status
    }
    MATCHES {
      string id PK
      string donation_id FK
      string ngo_id FK
      float score
      float distance_km
      float urgency_score
      string state
    }
    DELIVERIES {
      string id PK
      string tenant_id FK
      string donation_id FK
      string volunteer_id FK
      datetime scheduled_at
      string status
      float eta_minutes
    }
    WAREHOUSES {
      string id PK
      string tenant_id FK
      string name
      point location
      int cold_storage_capacity
      string status
    }
    INVENTORY_BATCHES {
      string id PK
      string warehouse_id FK
      string source_donation_id FK
      string status
      int quantity
      datetime expiry_at
    }
    BATCH_MOVEMENTS {
      string id PK
      string batch_id FK
      string from_node
      string to_node
      string movement_type
      datetime moved_at
    }
    DEMAND_FORECASTS {
      string id PK
      string tenant_id FK
      string zone_id
      float predicted_quantity
      datetime forecast_for
      float confidence
    }
    FOOD_QUALITY_ASSESSMENTS {
      string id PK
      string donation_id FK
      string image_url
      string quality_label
      float confidence
      int usable_minutes
    }
    FRAUD_FLAGS {
      string id PK
      string tenant_id FK
      string actor_id FK
      string rule_code
      float anomaly_score
      string severity
    }
    CSR_REPORTS {
      string id PK
      string tenant_id FK
      string company_name
      int meals_served
      float co2_saved_kg
      float waste_reduced_kg
    }
```

## Collections / Tables

- MongoDB primary collections: `tenants`, `users`, `ngoProfiles`, `donations`, `matches`, `deliveries`, `warehouses`, `inventoryBatches`, `batchMovements`, `fraudFlags`, `qualityAssessments`, `notifications`, `auditLogs`, `payments`
- Redis keys: session refresh tokens, throttles, socket presence, tenant cache, allocation timers, geo-fence fanout, analytics cache
- Optional PostgreSQL tables: `payment_ledger`, `expense_entries`, `reconciliation_runs`, `csr_exports`, `blockchain_anchor_jobs`
- Recommended indexes:
  - `donations`: `{ tenantId: 1, status: 1, expiryAt: 1 }`, `pickupLocation: 2dsphere`
  - `ngoProfiles`: `{ tenantId: 1, verificationStatus: 1 }`, `serviceAreas: 2dsphere`
  - `deliveries`: `{ tenantId: 1, status: 1, scheduledAt: 1 }`
  - `fraudFlags`: `{ tenantId: 1, severity: 1, createdAt: -1 }`
