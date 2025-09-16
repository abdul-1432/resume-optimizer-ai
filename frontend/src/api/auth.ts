import { api } from './client';

export async function register(input: { name: string; email: string; password: string }) {
  const res = await api.post('/api/auth/register', input);
  return { user: res.data.user as { id: string; name: string; email: string }, token: res.data.token as string };
}

export async function login(input: { email: string; password: string }) {
  const res = await api.post('/api/auth/login', input);
  return { user: res.data.user as { id: string; name: string; email: string }, token: res.data.token as string };
}

export async function getMe() {
  const res = await api.get('/api/auth/me');
  return res.data as { user: { id: string; name: string; email: string } };
}
