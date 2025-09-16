import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, uploadAvatar, updateName } from '../api/user';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string; name: string; email: string; avatarUpdatedAt?: number } | null>(null);
  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [cacheBust, setCacheBust] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await getProfile();
        setUser(u);
        setName(u.name);
        if (u.avatarUpdatedAt) {
          setCacheBust(u.avatarUpdatedAt);
          localStorage.setItem('avatarUpdatedAt', String(u.avatarUpdatedAt));
        }
      } catch {
        localStorage.removeItem('token');
        navigate('/login');
      }
    })();
  }, [navigate]);

  const avatarUrl = useMemo(() => {
    if (!user) return '';
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const t = cacheBust ? `?t=${cacheBust}` : '';
    return `${API_URL}/api/users/${user.id}/avatar${t}`;
  }, [user, cacheBust]);

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSelectedFile(file);
    // Show local preview until save
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  async function onSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingName(true);
    setError(null);
    setMsg(null);
    try {
      const promises: Promise<any>[] = [updateName(name.trim())];
      if (selectedFile) promises.push(uploadAvatar(selectedFile));
      const [updated] = await Promise.all(promises);
      setUser(updated);

      // If an avatar was selected, ensure the server now serves it before dropping the preview
      let now = Date.now();
      if (selectedFile && updated?.id) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const targetUrl = `${API_URL}/api/users/${updated.id}/avatar?t=${now}`;
        const ok = await (async () => {
          const maxAttempts = 8;
          for (let i = 0; i < maxAttempts; i++) {
            try {
              const resp = await fetch(targetUrl, { method: 'GET', cache: 'no-store' });
              if (resp.ok) return true;
            } catch {}
            await new Promise((r) => setTimeout(r, 150));
          }
          return false;
        })();
        if (!ok) {
          // Try with a new timestamp once more
          now = Date.now();
        }
      }

      setCacheBust(now);
      localStorage.setItem('avatarUpdatedAt', String(now));

      if (selectedFile) {
        // Only remove preview after we bumped cache bust so avatarUrl will load
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
      }

      setSelectedFile(null);
      setMsg('Changes saved');
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSavingName(false);
    }
  }


  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: 16, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 10px', borderRadius: 8, color: 'white', cursor: 'pointer' }}>← Back</button>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Your Profile</h1>
        {msg && <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', padding: 10, borderRadius: 8, marginBottom: 12 }}>{msg}</div>}
        {error && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', padding: 10, borderRadius: 8, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, alignItems: 'start' }}>
          {/* Profile image section removed -> dummy icon instead */}
          <div className="card" style={{ display: 'grid', placeItems: 'center', gap: 8 }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center', background: '#0b1220', fontSize: 56 }}>👤</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Profile photo editing disabled</div>
          </div>

          <form onSubmit={onSaveName} style={{ background: 'linear-gradient(180deg, #111827, #0b1220)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Basic info</div>
            <label style={{ fontSize: 13, opacity: 0.9 }}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6, marginBottom: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'white', boxSizing: 'border-box' }} />
            <label style={{ fontSize: 13, opacity: 0.9 }}>Email</label>
            <input value={user?.email || ''} disabled style={{ width: '100%', padding: 10, marginTop: 6, marginBottom: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'white', boxSizing: 'border-box' }} />
            <button disabled={savingName} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(59,130,246,0.6)', background: 'linear-gradient(180deg, #3b82f6, #2563eb)', color: 'white', cursor: 'pointer' }}>{savingName ? 'Saving...' : 'Save changes'}</button>
          </form>

          <div style={{ background: 'linear-gradient(180deg, #111827, #0b1220)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Password</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 6 }}>Account password</div>
            <input value={'•'.repeat(10)} disabled style={{ width: '100%', padding: 10, marginTop: 6, marginBottom: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'white', boxSizing: 'border-box' }} />
            <div style={{ fontSize: 12, opacity: 0.8 }}>For security, passwords are hashed and cannot be displayed.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
