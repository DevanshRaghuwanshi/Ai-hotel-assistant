import { useState, useEffect } from "react";
import { Link ,useNavigate} from "react-router-dom";

function QuickStats() {
  const [stats, setStats] = useState({ total: 0, available: 0, occupied: 0, bookings: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
const headers = { 'Authorization': `Bearer ${token}` };

const [roomsRes, bookingsRes] = await Promise.all([
  fetch("http://localhost:5000/rooms/all", { headers }),
  fetch("http://localhost:5000/rooms/bookings", { headers })
]);
        const roomsData = await roomsRes.json();
        const bookingsData = await bookingsRes.json();
        setStats({
          total: roomsData.rooms.length,
          available: roomsData.rooms.filter(r => r.status === 'available').length,
          occupied: roomsData.rooms.filter(r => r.status === 'occupied').length,
          bookings: bookingsData.bookings.length
        });
      } catch (e) {}
    };
    fetchStats();
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginTop: "32px" }}>
      {[
        { label: "Total Rooms", value: stats.total, color: "#1a1a1a" },
        { label: "Available Now", value: stats.available, color: "#16a34a" },
        { label: "Occupied", value: stats.occupied, color: "#dc2626" },
        { label: "Total Bookings", value: stats.bookings, color: "#0f3460" },
      ].map(s => (
        <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "28px", fontWeight: "700", color: s.color }}>{s.value}</div>
          <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function PMS() {
    const navigate = useNavigate();
  const hotel = JSON.parse(localStorage.getItem('hotel') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hotel');
    navigate('/login');
  };
  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#f8f9fa" }}>

      {/* Header */}
      <div style={{ background: "#1a1a1a", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#fff", fontSize: "20px", fontWeight: "700" }}>The Grand Hotel</div>
          <div style={{ color: "#888", fontSize: "12px", marginTop: "2px" }}>Property Management System</div>
        </div>
<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ color: "#888", fontSize: "12px" }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ color: "#fff", fontSize: "12px", fontWeight: "600" }}>
            {hotel.hotel_name}
          </div>
          <button onClick={logout} style={{ padding: "6px 14px", background: "transparent", color: "#888", border: "1px solid #444", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "900px", margin: "60px auto", padding: "0 24px" }}>

        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a1a", margin: "0 0 8px" }}>
            Welcome to Grand Hotel PMS
          </h1>
          <p style={{ color: "#888", fontSize: "15px", margin: 0 }}>
            Manage your property with AI-powered tools
          </p>
        </div>

        {/* 3 Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {[
            { href: "/chat", emoji: "🤖", title: "AI Concierge", desc: "Guest chatbot powered by AI. Answers questions, handles bookings, checks availability.", btn: "Open Chatbot" },
            { href: "/staff", emoji: "🏨", title: "Staff Dashboard", desc: "Real-time room status. See available, occupied rooms and upcoming bookings at a glance.", btn: "View Rooms" },
            { href: "/bookings", emoji: "📋", title: "Booking History", desc: "View all reservations. Filter by guest name, email, or date. Track booking status.", btn: "View Bookings" },
          ].map(card => (
            <Link key={card.href} to={card.href} style={{ textDecoration: "none" }}>
              <div
                style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "32px 24px", textAlign: "center", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>{card.emoji}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#1a1a1a", marginBottom: "8px" }}>{card.title}</div>
                <div style={{ fontSize: "13px", color: "#888", lineHeight: "1.5" }}>{card.desc}</div>
                <div style={{ marginTop: "20px", padding: "8px 20px", background: "#1a1a1a", color: "#fff", borderRadius: "8px", fontSize: "13px", display: "inline-block" }}>
                  {card.btn} →
                </div>
              </div>
            </Link>
          ))}
        </div>

        <QuickStats />
      </div>
    </div>
  );
}