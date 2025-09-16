import { api } from './client';

export async function getProfile() {
  const res = await api.get('/api/users/me');
  return res.data.user as { id: string; name: string; email: string; avatarUpdatedAt?: number };
}

export async function uploadAvatar(file: File) {
  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const form = new FormData();
  form.append('avatar', file);
  const res = await fetch(`${API_URL}/api/users/me/avatar`, {
    method: 'POST',
    headers: { Authorization: token ? `Bearer ${token}` : '' },
    body: form
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Upload failed');
  return true;
}

export async function updateName(name: string) {
  const res = await api.patch('/api/users/me', { name });
  return res.data.user as { id: string; name: string; email: string; avatarUpdatedAt?: number };
}

