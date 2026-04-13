# AWS Deployment Notes

- Frontend static bundle can be served from S3 + CloudFront or from Nginx on ECS
- API gateway and AI service should run in separate ECS services with autoscaling policies
- Worker fleet should scale independently from API nodes based on broker lag and SLA timer queues
- Use private subnets for application and data tiers
- Put Redis and MongoDB in managed services with network isolation
- Use Amazon MQ or MSK for event streaming and dead-letter patterns
- Centralize secrets in Secrets Manager and rotate keys automatically
