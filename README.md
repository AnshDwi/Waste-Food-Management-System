# Waste Food Management System

ERP-style platform for connecting food donors, NGOs, volunteers, and administrators to reduce food waste at scale.

🔗 Live Demo: https://waste-food-management-system-gules.vercel.app/app

🔗 Backend API: https://waste-food-management-system-uvw7.onrender.com

## Platform Scope

- Role-based workflows for Donor, NGO, Volunteer, and Admin users
- Secure authentication with JWT, refresh tokens, Google OAuth, audit logging, and rate limiting
- Donation lifecycle with batch tracking, FIFO allocation, expiry awareness, and alerts
- Smart matching engine using geo-distance, urgency, and capacity signals
- Logistics orchestration with scheduling, driver assignment, WebSockets, and ETA hooks
- Analytics, finance, fraud review, notifications, and AI prediction services
- Dockerized microservice-oriented deployment with Nginx, Redis, MongoDB, and CI/CD
- AI upgrades for demand forecasting, food quality scoring, anomaly detection, and redirection intelligence
- Multi-tenant SaaS architecture, supply-chain warehousing, CSR/ESG reporting, bots, and gamification

## Monorepo Structure

- `apps/api-gateway` Express TypeScript API gateway and business modules
- `apps/web` React + Vite + Tailwind frontend
- `apps/ai-service` Flask microservice for recommendation and prediction workloads
- `docs` system architecture, ERD, API, security, deployment, and testing references
- `infra` Docker, Nginx, GitHub Actions, AWS notes, and Postman collection

## Quick Start

1. Copy env templates:
   - `apps/api-gateway/.env.example` -> `apps/api-gateway/.env`
   - `apps/web/.env.example` -> `apps/web/.env`
   - `apps/ai-service/.env.example` -> `apps/ai-service/.env`
2. Start services:

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```

3. Local app URLs:
   - Frontend: `http://localhost:5173`
   - API Gateway: `http://localhost:8080/api/v1`
   - AI Service: `http://localhost:5000`
   - Nginx edge: `http://localhost`

## GitHub + Cloud Deploy

### GitHub

```bash
git init
git add .
git commit -m "feat: production-ready waste food management platform"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Vercel

- Root project: repository root
- Build command: `npm run build --workspace web`
- Output directory: `apps/web/dist`
- Install command: `npm install`
- Environment variables:
  - `VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api/v1`
  - `VITE_SOCKET_URL=https://<your-render-service>.onrender.com`

### Render

- Uses root [`render.yaml`](C:/Users/anshikad/Desktop/Waste%20Food%20Management/render.yaml)
- Service root: `apps/api-gateway`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Health path: `/health`
- Required secrets:
  - `CLIENT_URL`
  - `MONGODB_URI`
  - `REDIS_URL`
  - `BROKER_URL`
  - `AI_SERVICE_URL`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`

## Documentation

- [System Architecture](C:/Users/anshikad/Desktop/Waste%20Food%20Management/docs/architecture.md)
- [ER Diagram](C:/Users/anshikad/Desktop/Waste%20Food%20Management/docs/erd.md)
- [API Design](C:/Users/anshikad/Desktop/Waste%20Food%20Management/docs/api-design.md)
- [Folder Structure Changes](C:/Users/anshikad/Desktop/Waste%20Food%20Management/docs/folder-structure.md)
- [Security Playbook](C:/Users/anshikad/Desktop/Waste%20Food%20Management/docs/security.md)
- [Deployment Guide](C:/Users/anshikad/Desktop/Waste%20Food%20Management/docs/deployment.md)
- [Test Strategy](C:/Users/anshikad/Desktop/Waste%20Food%20Management/docs/testing.md)
