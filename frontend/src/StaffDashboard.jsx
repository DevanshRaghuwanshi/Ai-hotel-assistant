import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function StaffDashboard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
const res = await fetch("http://localhost:5000/rooms/all", {
  headers: { 'Authorization': `Bearer ${token}` }
});
      const data = await res.json();
      setRooms(data.rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
    setLoading(false);
  };

  const getTypeColor = (type) => {
    const colors = {
      Standard: "#6366f1",
      Deluxe: "#8b5cf6",
      Family: "#06b6d4",
      Suite: "#f59e0b",
    };
    return colors[type] || "#6366f1";
  };

  const stats = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === "available").length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>
            Staff Dashboard
          </h1>
          <p style={{ color: "#888", fontSize: "13px", margin: "4px 0 0" }}>
            The Grand Hotel — Room Status
          </p>
        </div>
        <button
          onClick={fetchRooms}
          style={{ padding: "8px 16px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}
        >
          Refresh
        </button>
<Link to="/bookings" style={{ padding: "8px 16px", background: "#f9f9f9", color: "#1a1a1a", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer", fontSize: "13px", textDecoration: "none" }}>
  Booking History
</Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Rooms", value: stats.total, color: "#1a1a1a" },
          { label: "Available", value: stats.available, color: "#16a34a" },
          { label: "Occupied", value: stats.occupied, color: "#dc2626" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: "700", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Room Grid */}
      {loading ? (
        <p style={{ color: "#888", textAlign: "center" }}>Loading rooms...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          {rooms.map((room) => (
            <div
              key={room.id}
              style={{
                border: `2px solid ${room.status === "available" ? "#16a34a" : "#dc2626"}`,
                borderRadius: "12px",
                padding: "16px",
                background: room.status === "available" ? "#f0fdf4" : "#fef2f2",
              }}
            >
              {/* Room Number + Type */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a1a" }}>
                  Room {room.room_number}
                </span>
                <span style={{
                  background: getTypeColor(room.room_type),
                  color: "#fff",
                  padding: "2px 10px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: "600"
                }}>
                  {room.room_type}
                </span>
              </div>

              {/* Price */}
              <div style={{ fontSize: "13px", color: "#555", marginBottom: "8px" }}>
                ₹{room.price_per_night}/night · Max {room.max_guests} guests
              </div>

              {/* Status Badge */}
              <div style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                background: room.status === "available" ? "#16a34a" : "#dc2626",
                color: "#fff",
                marginBottom: "8px"
              }}>
                {room.status === "available" ? "✓ Available" : "✗ Occupied"}
              </div>

              {/* Guest Info if occupied */}
              {room.guest_name && (
                <div style={{ marginTop: "8px", padding: "10px", background: "#fff", borderRadius: "8px", border: "1px solid #fecaca" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a1a" }}>
                    {room.guest_name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
                    📅 {room.check_in_date?.toString().slice(0, 10)} → {room.check_out_date?.toString().slice(0, 10)}
                  </div>
                  {room.guest_phone && (
                    <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                      📞 {room.guest_phone}
                    </div>
                  )}
                </div>
              )}

              {/* Next Booking Warning for Available Rooms */}
              {room.status === "available" && room.next_check_in && (
                <div style={{ marginTop: "8px", padding: "8px", background: "#fef9c3", borderRadius: "8px", border: "1px solid #fde047" }}>
                  <div style={{ fontSize: "11px", color: "#854d0e", fontWeight: "600" }}>
                    ⚠️ Next booking: {room.next_check_in?.toString().slice(0, 10)}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Back to chatbot */}
      <div style={{ marginTop: "24px", textAlign: "center" }}>
<Link to="/" style={{ color: "#888", fontSize: "13px", textDecoration: "none" }}>
  ← Back to PMS
</Link>
      </div>
    </div>
  );
}