import request from 'supertest';
import { createApp } from '../src/app.js';
describe('auth routes', () => {
    it('registers a donor and issues an access token with refresh cookie', async () => {
        const app = createApp();
        const response = await request(app)
            .post('/api/v1/auth/register')
            .send({ name: 'Donor One', email: 'donor@example.com', password: 'password123!', role: 'DONOR', rememberMe: true });
        expect(response.status).toBe(201);
        expect(response.body.data.accessToken).toBeDefined();
        expect(response.body.data.user.email).toBe('donor@example.com');
        expect(response.headers['set-cookie']).toBeDefined();
    });
    it('logs out and clears the refresh cookie', async () => {
        const app = createApp();
        const agent = request.agent(app);
        await agent
            .post('/api/v1/auth/register')
            .send({ name: 'Ngo One', email: 'ngo@example.com', password: 'password123!', role: 'NGO', rememberMe: true });
        const response = await agent.post('/api/v1/auth/logout').send({});
        expect(response.status).toBe(200);
        expect(response.body.data.message).toContain('Logged out');
    });
    it('refreshes the session using the http-only cookie', async () => {
        const app = createApp();
        const agent = request.agent(app);
        await agent
            .post('/api/v1/auth/register')
            .send({ name: 'Volunteer One', email: 'volunteer@example.com', password: 'password123!', role: 'VOLUNTEER', rememberMe: true });
        const response = await agent.post('/api/v1/auth/refresh').send({});
        expect(response.status).toBe(200);
        expect(response.body.data.accessToken).toBeDefined();
        expect(response.body.data.user.role).toBe('VOLUNTEER');
    });
});
