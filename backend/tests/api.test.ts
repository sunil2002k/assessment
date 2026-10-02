import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { closeDatabase, initializeDatabase } from '../src/db/data-source';
import { migrate } from '../src/db/migrate';
import { seed } from '../src/db/seed';

const ADMIN = { email: 'admin@leaddesk.test', password: 'Admin@123' };
const MEMBER = { email: 'member@leaddesk.test', password: 'Member@123' };

beforeAll(async () => {
  await initializeDatabase();
  await migrate();
  await seed();
});
afterAll(() => closeDatabase());

const setCookies = (res: request.Response): string[] => (res.headers['set-cookie'] as unknown as string[]) ?? [];
const cookieHeader = (res: request.Response, name: string) => setCookies(res).find((c) => c.startsWith(`${name}=`));
const cookiePair = (res: request.Response, name: string) => cookieHeader(res, name)!.split(';')[0];

async function loginAgent(creds: { email: string; password: string }) {
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send(creds).expect(200);
  return agent;
}

describe('1. login', () => {
  it('sets httpOnly access + refresh cookies and no tokens in the body', async () => {
    const res = await request(app).post('/api/auth/login').send(MEMBER);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: MEMBER.email, role: 'member' });
    expect(JSON.stringify(res.body)).not.toMatch(/token/i);

    const access = cookieHeader(res, 'access_token')!;
    const refresh = cookieHeader(res, 'refresh_token')!;
    expect(access).toMatch(/HttpOnly/i);
    expect(access).toMatch(/SameSite=Lax/i);
    expect(refresh).toMatch(/HttpOnly/i);
    expect(refresh).toMatch(/Path=\/api\/auth/);
  });

  it('returns 401 for a wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: MEMBER.email, password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(setCookies(res)).toHaveLength(0);
  });
});

describe('2. refresh rotation', () => {
  it('issues new tokens and rejects reuse of the old refresh token', async () => {
    const login = await request(app).post('/api/auth/login').send(MEMBER);
    const oldRefresh = cookiePair(login, 'refresh_token');

    const first = await request(app).post('/api/auth/refresh').set('Cookie', oldRefresh);
    expect(first.status).toBe(200);
    expect(cookieHeader(first, 'access_token')).toBeTruthy();
    const newRefresh = cookiePair(first, 'refresh_token');
    expect(newRefresh).not.toBe(oldRefresh);

    const reuse = await request(app).post('/api/auth/refresh').set('Cookie', oldRefresh);
    expect(reuse.status).toBe(401);

    // reuse detection also revoked the descendant token
    const afterReuse = await request(app).post('/api/auth/refresh').set('Cookie', newRefresh);
    expect(afterReuse.status).toBe(401);
  });
});

describe('3. role-based access', () => {
  it('member gets 403, admin gets 200 on /api/admin/users', async () => {
    const member = await loginAgent(MEMBER);
    expect((await member.get('/api/admin/users')).status).toBe(403);

    const admin = await loginAgent(ADMIN);
    const res = await admin.get('/api/admin/users');
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThanOrEqual(2);
    expect(JSON.stringify(res.body)).not.toMatch(/password/i);
  });

  it('returns 401 when not logged in', async () => {
    expect((await request(app).get('/api/admin/users')).status).toBe(401);
  });
});

describe('4. leads scoping', () => {
  it('member only receives their own leads; admin sees all with owner name', async () => {
    const member = await loginAgent(MEMBER);
    const me = (await member.get('/api/auth/me')).body.user;

    await member
      .post('/api/leads')
      .send({ name: 'Test Lead', email: 'test@lead.example', company: 'TestCo' })
      .expect(201);
    await member.post('/api/leads').send({ name: '', email: 'bad' }).expect(422);

    const res = await member.get('/api/leads').expect(200);
    expect(res.body.leads.length).toBeGreaterThan(0);
    expect(res.body.leads.every((l: any) => l.owner_id === me.id)).toBe(true);

    const admin = await loginAgent(ADMIN);
    const all = (await admin.get('/api/leads').expect(200)).body.leads;
    expect(new Set(all.map((l: any) => l.owner_id)).size).toBeGreaterThan(1);
    expect(all.every((l: any) => typeof l.owner_name === 'string')).toBe(true);
  });
});
