import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
  .pms-page { font-family: 'DM Sans', sans-serif; }
  .pms-card { background: #fff; border: 1px solid #ebebeb; border-radius: 12px; transition: box-shadow 0.2s; }
  .pms-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
  .nav-card { text-decoration: none; display: block; }
  .nav-card-inner { background: #fff; border: 1px solid #ebebeb; border-radius: 12px; padding: 28px 24px; text-align: center; cursor: pointer; transition: all 0.2s; }
  .nav-card-inner:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.08); transform: translateY(-2px); border-color: #c9a96e; }
`;

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: "12px", padding: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
      <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: color + '15', display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "28px", fontWeight: "700", color: color, fontFamily: "'Playfair Display', serif" }}>{value}</div>
        <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{label}</div>
      </div>
    </div>
  );
}

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
          total: roomsData.rooms?.length || 0,
          available: roomsData.rooms?.filter(r => r.status === 'available').length || 0,
          occupied: roomsData.rooms?.filter(r => r.status === 'occupied').length || 0,
          bookings: bookingsData.bookings?.length || 0
        });
      } catch (e) {}
    };
    fetchStats();
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
      <StatCard label="Total Rooms" value={stats.total} color="#1a1a1a" icon="🏠" />
      <StatCard label="Available Now" value={stats.available} color="#16a34a" icon="✓" />
      <StatCard label="Occupied" value={stats.occupied} color="#dc2626" icon="👤" />
      <StatCard label="Total Bookings" value={stats.bookings} color="#c9a96e" icon="📋" />
    </div>
  );
}

export default function PMS() {
  const hotel = JSON.parse(localStorage.getItem('hotel') || '{}');
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="pms-page" style={{ padding: "32px 40px", minHeight: "100vh", background: "#f4f4f2" }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>{today}</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: "700", color: "#1a1a1a", margin: "0 0 4px" }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋
        </h1>
        <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
          Here's what's happening at <strong style={{ color: "#1a1a1a" }}>{hotel.hotel_name}</strong> today.
        </p>
      </div>

      {/* Stats */}
      <QuickStats />

      {/* Nav Cards */}
      <div style={{ marginBottom: "12px" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "700", color: "#1a1a1a", marginBottom: "16px" }}>Quick Access</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[
            { href: "/chat", emoji: "🤖", title: "AI Concierge", desc: "Chat with guests, handle bookings, answer questions — all powered by AI.", btn: "Open Chat", color: "#6366f1" },
            { href: "/staff", emoji: "🏨", title: "Stay View", desc: "Real-time room status with guest info and upcoming booking alerts.", btn: "View Rooms", color: "#16a34a" },
            { href: "/bookings", emoji: "📋", title: "Reservations", desc: "All bookings in one place. Filter by guest, date range, or status.", btn: "View Bookings", color: "#c9a96e" },
            { href: "/admin", emoji: "⚙️", title: "Manage Hotel", desc: "Add rooms, upload documents, manage your hotel profile.", btn: "Open Admin", color: "#0f3460" },
            { href: "/pricing", emoji: "💳", title: "Upgrade Plan", desc: "Unlock more features. View your current plan and billing.", btn: "View Plans", color: "#dc2626" },
            { href: "/chat", emoji: "📊", title: "Today's Summary", desc: "Ask the AI: 'How many rooms are available today?' or 'Show today's bookings'.", btn: "Ask AI", color: "#888" },
          ].map(card => (
            <Link key={card.href + card.title} to={card.href} className="nav-card">
              <div className="nav-card-inner">
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>{card.emoji}</div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a1a", marginBottom: "6px", fontFamily: "'Playfair Display', serif" }}>{card.title}</div>
                <div style={{ fontSize: "12px", color: "#888", lineHeight: "1.5", marginBottom: "16px" }}>{card.desc}</div>
                <div style={{ padding: "7px 16px", background: card.color + '15', color: card.color, borderRadius: "6px", fontSize: "12px", fontWeight: "600", display: "inline-block" }}>
                  {card.btn} →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
