import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerApi } from '../api/auth';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await registerApi({ name, email, password });
      localStorage.setItem('token', res.token);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <div className="brand">
            <div className="badge">A</div>
            <div style={{ fontWeight: 700 }}>ATS Resume Editor</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <a href="/#about">About</a>
            <a href="/#contact">Contact</a>
          </div>
        </div>
      </nav>
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
        <div className="card" style={{ width: '100%', maxWidth: 480, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% -10%, rgba(96,165,250,0.18), transparent 40%), radial-gradient(circle at 120% 50%, rgba(16,185,129,0.18), transparent 40%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
            <div className="badge">A</div>
            <div style={{ fontWeight: 700, letterSpacing: 0.4 }}>Create your account</div>
          </div>
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
            <label style={{ fontSize: 13, opacity: 0.9 }}>Name</label>
            <div style={{ position: 'relative' }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)', color: 'white', outline: 'none' }}
                onFocus={(e) => (e.currentTarget.style.border = '1px solid rgba(59,130,246,0.6)')}
                onBlur={(e) => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.14)')}
              />
              <span style={{ position: 'absolute', left: 12, top: 10, opacity: 0.8 }}>👤</span>
            </div>

            <label style={{ fontSize: 13, opacity: 0.9, marginTop: 6 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)', color: 'white', outline: 'none' }}
                onFocus={(e) => (e.currentTarget.style.border = '1px solid rgba(59,130,246,0.6)')}
                onBlur={(e) => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.14)')}
              />
              <span style={{ position: 'absolute', left: 12, top: 10, opacity: 0.8 }}>📧</span>
            </div>

            <label style={{ fontSize: 13, opacity: 0.9, marginTop: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                minLength={6}
                style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)', color: 'white', outline: 'none' }}
                onFocus={(e) => (e.currentTarget.style.border = '1px solid rgba(59,130,246,0.6)')}
                onBlur={(e) => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.14)')}
              />
              <span style={{ position: 'absolute', left: 12, top: 10, opacity: 0.8 }}>🔒</span>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1.0)')}
            >
              {loading ? 'Creating…' : 'Create Account'} <span>→</span>
            </button>
            {error && <div style={{ color: '#fca5a5' }}>{error}</div>}
          </form>
          <div style={{ textAlign: 'center', marginTop: 10, opacity: 0.9 }}>
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </>
  );
}
