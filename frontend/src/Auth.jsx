import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    hotel_name: '', email: '', password: '', phone: '', address: ''
  });
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
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : form;

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      // Save token and hotel info
      localStorage.setItem('token', data.token);
      localStorage.setItem('hotel', JSON.stringify(data.hotel));

      // Redirect to PMS
      navigate('/dashboard');

    } catch (err) {
      setError('Network error. Is the server running?');
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "420px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🏨</div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a1a" }}>Hotel PMS</div>
          <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>Property Management System</div>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", background: "#f8f9fa", borderRadius: "8px", padding: "4px", marginBottom: "24px" }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{ flex: 1, padding: "8px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600",
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#1a1a1a" : "#888",
                boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
              }}>
              {m === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {mode === 'signup' && (
            <>
              <div>
                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Hotel Name</label>
                <input value={form.hotel_name} onChange={e => handleChange('hotel_name', e.target.value)}
                  placeholder="The Grand Hotel"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Phone</label>
                <input value={form.phone} onChange={e => handleChange('phone', e.target.value)}
                  placeholder="9876543210"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Address</label>
                <input value={form.address} onChange={e => handleChange('address', e.target.value)}
                  placeholder="42 Colaba, Mumbai"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Email</label>
            <input value={form.email} onChange={e => handleChange('email', e.target.value)}
              placeholder="hotel@email.com" type="email"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Password</label>
            <input value={form.password} onChange={e => handleChange('password', e.target.value)}
              placeholder="••••••••" type="password"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#dc2626" }}>
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ padding: "12px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600", marginTop: "4px" }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login to PMS' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}