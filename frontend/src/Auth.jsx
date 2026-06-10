import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
  .auth-page * { box-sizing: border-box; margin: 0; padding: 0; }
  .auth-page { font-family: 'DM Sans', sans-serif; }
  .auth-input { width: 100%; padding: 11px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; color: #f0ede6; outline: none; transition: border-color 0.2s; font-family: 'DM Sans', sans-serif; }
  .auth-input::placeholder { color: #444; }
  .auth-input:focus { border-color: rgba(201,169,110,0.5); background: rgba(255,255,255,0.07); }
  .auth-tab { flex: 1; padding: 9px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
  .auth-tab.active { background: rgba(201,169,110,0.15); color: #c9a96e; }
  .auth-tab.inactive { background: transparent; color: #555; }
  .auth-tab.inactive:hover { color: #888; }
  .auth-btn { width: 100%; padding: 13px; background: #c9a96e; color: #0a0a0a; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em; }
  .auth-btn:hover { background: #d4b87a; transform: translateY(-1px); }
  .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`;

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ hotel_name: '', email: '', password: '', phone: '', address: '' });
  const navigate = useNavigate();

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
      const body = mode === 'login' ? { email: form.email, password: form.password } : form;
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); setLoading(false); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('hotel', JSON.stringify(data.hotel));
      navigate('/dashboard');
    } catch (err) {
      setError('Network error. Is the server running?');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page" style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex" }}>
      <style>{css}</style>

      {/* Left side - branding */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(201,169,110,0.06) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#f0ede6", marginBottom: "60px" }}>
              Grand<span style={{ color: "#c9a96e" }}>PMS</span>
            </div>
          </Link>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: "900", color: "#f0ede6", lineHeight: 1.1, marginBottom: "20px" }}>
            The smarter way<br />to run your<br /><span style={{ color: "#c9a96e", fontStyle: "italic" }}>hotel.</span>
          </div>
          <p style={{ color: "#555", fontSize: "15px", lineHeight: 1.7, maxWidth: "400px", marginBottom: "48px" }}>
            AI-powered bookings, real-time room management, and guest intelligence — all in one elegant platform.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { icon: "🤖", text: "AI concierge that books rooms through conversation" },
              { icon: "🏨", text: "Real-time staff dashboard with smart conflict detection" },
              { icon: "📄", text: "Upload your documents, AI learns instantly" },
            ].map(f => (
              <div key={f.text} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "16px" }}>{f.icon}</span>
                <span style={{ fontSize: "13px", color: "#666", lineHeight: 1.5 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div style={{ width: "440px", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", background: "#0d0d0d", borderLeft: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>

          {/* Toggle */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "4px", marginBottom: "32px" }}>
            <button className={`auth-tab ${mode === 'login' ? 'active' : 'inactive'}`} onClick={() => { setMode('login'); setError(''); }}>
              Login
            </button>
            <button className={`auth-tab ${mode === 'signup' ? 'active' : 'inactive'}`} onClick={() => { setMode('signup'); setError(''); }}>
              Sign Up
            </button>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "700", color: "#f0ede6", marginBottom: "6px" }}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{ fontSize: "13px", color: "#555" }}>
              {mode === 'login' ? 'Sign in to your hotel dashboard' : 'Start managing your hotel with AI'}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {mode === 'signup' && (
              <>
                <div>
                  <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "6px" }}>Hotel Name</label>
                  <input className="auth-input" value={form.hotel_name} onChange={e => handleChange('hotel_name', e.target.value)} placeholder="The Grand Hotel" />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "6px" }}>Phone</label>
                  <input className="auth-input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="9876543210" />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "6px" }}>Address</label>
                  <input className="auth-input" value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="42 MG Road, Mumbai" />
                </div>
              </>
            )}
            <div>
              <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "6px" }}>Email</label>
              <input className="auth-input" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="hotel@email.com" type="email" />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "6px" }}>Password</label>
              <input className="auth-input" value={form.password} onChange={e => handleChange('password', e.target.value)} placeholder="••••••••" type="password"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "8px", fontSize: "13px", color: "#f87171" }}>
                {error}
              </div>
            )}

            <button className="auth-btn" onClick={handleSubmit} disabled={loading} style={{ marginTop: "4px" }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Login to Dashboard →' : 'Create Account →'}
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: "12px", color: "#444", marginTop: "24px" }}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              style={{ background: "none", border: "none", color: "#c9a96e", cursor: "pointer", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>
              {mode === 'login' ? 'Sign up free' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
