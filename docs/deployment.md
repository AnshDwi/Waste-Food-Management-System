# Deployment Steps

## Local Containers

1. Build and run:
   - `docker compose -f infra/docker/docker-compose.yml up --build`
2. Validate health:
   - `GET /health`
   - `GET /api/v1/health`
   - `GET /healthz` on AI service

## AWS Production Topology

1. Push images to ECR
2. Deploy API gateway, web, and AI service to ECS or EC2-backed Docker hosts
3. Use Amazon DocumentDB or MongoDB Atlas for document data
4. Use ElastiCache Redis for caching and queues
5. Add Kafka MSK or RabbitMQ cluster for event-driven workers and SLA automation
6. Put Nginx behind an Application Load Balancer with TLS termination
7. Run websocket nodes with sticky sessions or Redis adapter fanout
8. Store food images and reports in S3
9. Wire CloudWatch logs, metrics, alarms, and dashboards
10. Run CI/CD via GitHub Actions with environment-specific secrets

## Scaling Strategy

- Scale API pods horizontally by tenant traffic and request latency
- Separate worker autoscaling based on broker lag, pending reassignments, and fraud queue depth
- Cache heatmap tiles, leaderboard snapshots, and CSR aggregates in Redis
- Precompute feature vectors for matching and fraud pipelines to reduce request-time latency
- Split hot collections by tenant and region once cross-zone traffic grows

## Operational SLAs

- Matching recommendation response under 250ms from cache-backed feature store
- Auto-reassignment SLA timer handled asynchronously and retried through broker dead-letter queues
- Websocket reconnect and state resync through Redis presence + persisted delivery timeline
