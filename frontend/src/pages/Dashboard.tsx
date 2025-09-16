import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../api/user';
import { analyzeResume, enhanceResume } from '../api/ats';

function firstNameFromFullName(fullName?: string) {
  if (!fullName) return 'User';
  const tokens = fullName.split(/\s+/).filter(Boolean);
  const ignore = new Set(['mr', 'mrs', 'ms', 'dr', 'md', 'md.', 'sri', 'shri']);
  for (const t of tokens) {
    const clean = t.replace(/[.,]/g, '').toLowerCase();
    if (!ignore.has(clean)) return t;
  }
  return tokens[0];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string; name: string; email: string; avatarUpdatedAt?: number } | null>(null);
  const [hover, setHover] = useState(false);
  const [cacheBust, setCacheBust] = useState(0);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [score, setScore] = useState(0);
  const [missing, setMissing] = useState<string[]>([]);
  const [resumeText, setResumeText] = useState('');
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await getProfile();
        setUser(u);
        if (u.avatarUpdatedAt) {
          setCacheBust(u.avatarUpdatedAt);
          localStorage.setItem('avatarUpdatedAt', String(u.avatarUpdatedAt));
        }
      } catch {
        localStorage.removeItem('token');
        navigate('/login');
      }
    })();
    // pick up avatar update timestamps saved by Profile
    const t = Number(localStorage.getItem('avatarUpdatedAt')) || 0;
    setCacheBust(t);
  }, [navigate]);

  // Also respond to updates from the Profile page while this tab is active
  useEffect(() => {
    const onFocus = () => {
      const t = Number(localStorage.getItem('avatarUpdatedAt')) || 0;
      setCacheBust(t);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'avatarUpdatedAt') {
        setCacheBust(Number(e.newValue) || 0);
      }
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const avatarUrl = useMemo(() => {
    if (!user) return '';
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const t = cacheBust ? `?t=${cacheBust}` : '';
    return `${API_URL}/api/users/${user.id}/avatar${t}`;
  }, [user, cacheBust]);


  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
          width: hover ? 260 : 76,
          background: 'linear-gradient(180deg, #111827, #0b1220)',
          color: 'white',
          transition: 'width 200ms ease',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#2563eb', display: 'grid', placeItems: 'center', fontWeight: 700 }}>A</div>
          {hover && <div style={{ fontWeight: 600 }}>{firstNameFromFullName(user?.name)}</div>}
        </div>

        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => navigate('/app/profile')}
          >
            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: '#0b1220', border: '1px solid rgba(255,255,255,0.15)', flex: '0 0 auto' }}>
              {/* Dummy profile icon instead of real image */}
              <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#e5e7eb', fontWeight: 700 }}>👤</div>
            </div>
            {hover && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 600 }}>{user?.name || 'User'}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{user?.email || ''}</div>
              </div>
            )}
          </div>
          {hover && (
            <button onClick={() => navigate('/app/profile')} style={{ marginTop: 10, fontSize: 12, padding: '6px 8px', background: '#1f2937', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', width: '100%' }}>
              Edit profile
            </button>
          )}
        </div>

        <nav style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { icon: '🏠', label: 'Home', to: '/app' },
            { icon: '👤', label: 'Profile', to: '/app/profile' },
            { icon: '⚙️', label: 'Settings', to: '/app/settings' }
          ].map((item) => (
            <div
              key={item.label}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, cursor: 'pointer', color: 'white', opacity: 0.9 }}
              onMouseEnter={(e) => ((e.currentTarget.style.background = 'rgba(255,255,255,0.08)'))}
              onMouseLeave={(e) => ((e.currentTarget.style.background = 'transparent'))}
              onClick={() => item.to && navigate(item.to)}
            >
              <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.icon}</span>
              {hover && <span>{item.label}</span>}
            </div>
          ))}
        </nav>

        {hover && (
          <div style={{ marginTop: 'auto', padding: 16 }}>
            <button
              onClick={logout}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1.0)')}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #dc2626', background: 'linear-gradient(180deg, #ef4444, #dc2626)', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'transform 120ms ease, filter 120ms ease' }}
            >
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, background: '#0f172a', color: 'white' }}>
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
          <div>
            <h1 style={{ marginBottom: 8, fontSize: 28, fontWeight: 700 }}>ATS Workspace</h1>
            <p style={{ opacity: 0.85 }}>Welcome back{user ? `, ${user.name}` : ''}. Upload your resume and paste JD.</p>
            {/* 1) Resume Upload */}
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Resume</div>
              <div className="dropzone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) setResumeFile(f);
              }}>
                <div style={{ fontSize: 13, opacity: 0.9 }}>Drag & drop PDF/DOCX/TXT or
                  <label style={{ textDecoration: 'underline', cursor: 'pointer', marginLeft: 6 }}>
                    browse
                    <input id="resume-input" type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) setResumeFile(f); }} />
                  </label>
                </div>
                {resumeFile && <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>Selected: {resumeFile.name}</div>}
              </div>
            </div>
            {/* 2) JD Input */}
            <div className="card" style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Job Description</div>
              <textarea id="jd-input" placeholder="Paste the JD here..." value={jdText} onChange={(e) => setJdText(e.target.value)} style={{ width: '100%', minHeight: 120, resize: 'vertical', borderRadius: 10, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)', color: 'white', padding: 12 }} />
              <button id="analyze-btn" className="btn-primary" style={{ marginTop: 10 }} disabled={!resumeFile || jdText.trim().length < 10 || busy} onClick={async () => {
                if (!resumeFile || jdText.trim().length < 10) return;
                setBusy(true);
                try {
                  const res = await analyzeResume({ file: resumeFile, jd: jdText });
                  setScore(res.score);
                  setMissing(res.missingKeywords);
                  setResumeText(res.resumeText);
                  setPreview(res.resumeText);
                } catch (e: any) {
                  setPreview(e.message || 'Analyze failed');
                } finally {
                  setBusy(false);
                }
              }}>Analyze</button>
            </div>

            {/* 3) Enhancement & Preview */}
            <div className="card" style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700 }}>Enhance & Preview</div>
                <button id="enhance-btn" className="btn-ghost" disabled={!resumeText || missing.length === 0 || busy} onClick={async () => {
                  setBusy(true);
                  try {
                    const res = await enhanceResume({ resumeText, missingKeywords: missing, jd: jdText });
                    setPreview(res.updatedResume);
                    if (typeof res.newScore === 'number') setScore(res.newScore);
                    if (Array.isArray(res.stillMissing)) setMissing(res.stillMissing);
                    alert('Resume enhanced! You can download the updated resume below.');
                  } catch (e: any) {
                    setPreview(e.message || 'Enhance failed');
                  } finally {
                    setBusy(false);
                  }
                }}>Enhance</button>
              </div>
              <div id="preview" style={{ whiteSpace: 'pre-wrap', opacity: 0.9, marginTop: 10, maxHeight: 280, overflow: 'auto' }}>{preview || 'Paste your JD and resume, then click Analyze to see the preview.'}</div>
            </div>
          </div>

          {/* 4) Right side Score & Missing */}
          <aside>
            <div className="card" style={{ display: 'grid', placeItems: 'center' }}>
              <div className="gauge" style={{ ['--p' as any]: `${Math.max(0, Math.min(100, score))}%` }}>
                <div className="gauge-inner" id="score-label">{Math.max(0, Math.min(100, score))}%</div>
              </div>
              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 8 }}>ATS Score</div>
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700 }}>Missing Keywords</div>
                <button
                  className="btn-primary"
                  style={{ padding: '8px 10px' }}
                  onClick={() => {
                    // trigger download of updated resume as a text file for now
                    const blob = new Blob([preview || resumeText], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'enhanced_resume.txt';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  disabled={!preview}
                >
                  Download Enhanced
                </button>
              </div>
              <div className="chips" id="missing-chips">
                {missing.length === 0 ? <div style={{ opacity: 0.8, fontSize: 12 }}>No missing keywords yet.</div> : missing.slice(0, 50).map((k) => (
                  <span key={k} className="chip">{k}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
