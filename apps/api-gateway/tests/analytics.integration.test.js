import request from 'supertest';
import { createApp } from '../src/app.js';
describe('analytics routes', () => {
    it('returns summary for authenticated users', async () => {
        const app = createApp();
        const agent = request.agent(app);
        const register = await agent
            .post('/api/v1/auth/register')
            .send({ name: 'Donor Analytics', email: 'analytics@example.com', password: 'password123!', role: 'DONOR', rememberMe: true });
        const response = await agent
            .get('/api/v1/analytics/summary')
            .set('Authorization', `Bearer ${register.body.data.accessToken}`);
        expect(response.status).toBe(200);
        expect(response.body.data.totalFoodSavedKg).toBeDefined();
    });
});
