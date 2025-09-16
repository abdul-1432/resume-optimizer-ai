import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* ambient blobs */}
      <div className="blob one" />
      <div className="blob two" />
      <div className="blob three" />

      {/* Nav */}
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
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="section" style={{ position: 'relative' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'center' }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: 44, lineHeight: 1.1, marginBottom: 12 }}>
              Land more interviews with AI-tailored resumes
            </h1>
            <p style={{ opacity: 0.9, marginBottom: 16 }}>
              Paste your resume and the Job Description. Our AI analyzes the JD and edits your resume content for ATS systems — clarity, keywords, and relevance — without locking you into rigid templates.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>Get Started</Link>
              <a href="#how" className="btn-ghost" style={{ textDecoration: 'none' }}>How it works</a>
            </div>
          </div>
          <div>
            <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>AI Resume Editor (Preview)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                <div className="card" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Paste Resume</div>
                  <div style={{ height: 90, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }} />
                </div>
                <div className="card" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Paste Job Description</div>
                  <div style={{ height: 90, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="btn-primary" style={{ textDecoration: 'none' }}>Analyze & Edit</div>
                  <div className="btn-ghost">Preview Output</div>
                </div>
              </div>
              <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, background: 'rgba(59,130,246,0.15)', filter: 'blur(28px)', borderRadius: '50%' }} />
            </div>
          </div>
        </div>
      </header>

      {/* How it works */}
      <section id="how" className="section dark">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[{
            title: 'Upload & Analyze', desc: 'Upload your resume and the job description. Our AI extracts keywords, required skills and role intent.'
          }, {
            title: 'AI Edits', desc: 'We rewrite bullet points, fill gaps, and align your resume to the JD — preserving your voice.'
          }, {
            title: 'ATS Optimized', desc: 'Formatting and content optimized for ATS scanning — without restrictive templates.'
          }, {
            title: 'Export & Apply', desc: 'Download your updated resume or copy to clipboard and apply with confidence.'
          }].map((c) => (
            <div key={c.title} className="card">
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{c.title}</div>
              <div style={{ opacity: 0.9 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="section">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, alignItems: 'center' }}>
          <div>
            <h2 className="gradient-text" style={{ marginBottom: 10 }}>Why no templates?</h2>
            <p style={{ opacity: 0.9 }}>
              Templates often break ATS parsing and restrict your expression. We focus on content quality and keyword alignment — maintain your preferred style while improving impact.
            </p>
          </div>
          <div className="card">
            <div style={{ height: 160, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }} />
          </div>
        </div>
      </section>

      {/* Contact */}
      <footer id="contact" className="section dark">
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="brand" style={{ gap: 8 }}>
            <div className="badge">A</div>
            <div style={{ fontWeight: 700 }}>ATS Resume Editor</div>
          </div>
          <div style={{ opacity: 0.8 }}>
            © {new Date().getFullYear()} — All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
