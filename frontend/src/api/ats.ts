import { API_URL } from './client';

export async function analyzeResume(input: { file: File; jd: string }) {
  const token = localStorage.getItem('token');
  const form = new FormData();
  form.append('resume', input.file);
  form.append('jd', input.jd);
  const res = await fetch(`${API_URL}/api/ats/analyze`, {
    method: 'POST',
    headers: { Authorization: token ? `Bearer ${token}` : '' },
    body: form
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Analyze failed');
  return json.data as { score: number; missingKeywords: string[]; resumeText: string };
}

export async function enhanceResume(input: { resumeText: string; missingKeywords: string[]; jd?: string }) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/api/ats/enhance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
    body: JSON.stringify(input)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Enhance failed');
  return json.data as { updatedResume: string; newScore?: number; stillMissing?: string[] };
}
