import request from 'supertest';
import { createApp } from '../src/app.js';

describe('ngo routes', () => {
  it('lists ngos for authenticated users', async () => {
    const app = createApp();
    const agent = request.agent(app);

    const register = await agent
      .post('/api/v1/auth/register')
      .send({ name: 'Ngo User', email: 'ngolist@example.com', password: 'password123!', role: 'NGO', rememberMe: true });

    const response = await agent
      .get('/api/v1/ngos')
      .set('Authorization', `Bearer ${register.body.data.accessToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data.ngos)).toBe(true);
  });
});
