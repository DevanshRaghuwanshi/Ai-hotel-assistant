import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', date: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async (f = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.name) params.append('name', f.name);
      if (f.email) params.append('email', f.email);
      if (f.date) params.append('date', f.date);

      const token = localStorage.getItem('token');
const res = await fetch(`http://localhost:5000/rooms/bookings?${params}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
      const data = await res.json();
      setBookings(data.bookings);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const handleFilter = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    fetchBookings(updated);
  };

  const clearFilters = () => {
    const cleared = { name: '', email: '', date: '' };
    setFilters(cleared);
    fetchBookings(cleared);
  };

  const getStatusColor = (status) => {
    return status === 'confirmed' ? '#16a34a' : '#dc2626';
  };

  const nights = (checkIn, checkOut) => {
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>
            Booking History
          </h1>
          <p style={{ color: "#888", fontSize: "13px", margin: "4px 0 0" }}>
            The Grand Hotel — All Reservations
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
<Link to="/staff" style={{ padding: "8px 16px", background: "#f9f9f9", color: "#1a1a1a", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer", fontSize: "13px", textDecoration: "none" }}>
            Staff Dashboard
          </Link>
          <Link to="/" style={{ padding: "8px 16px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", textDecoration: "none" }}>
            ← Back to PMS
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "16px", marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>
              Search by Name
            </label>
            <input
              value={filters.name}
              onChange={e => handleFilter('name', e.target.value)}
              placeholder="e.g. Rahul Sharma"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>
              Search by Email
            </label>
            <input
              value={filters.email}
              onChange={e => handleFilter('email', e.target.value)}
              placeholder="e.g. rahul@gmail.com"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>
              Filter by Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={e => handleFilter('date', e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <button
            onClick={clearFilters}
            style={{ padding: "8px 16px", background: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer", fontSize: "13px", color: "#888" }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center" }}>
        <span style={{ fontSize: "13px", color: "#888" }}>
          {loading ? 'Loading...' : `${bookings.length} booking${bookings.length !== 1 ? 's' : ''} found`}
        </span>
        {(filters.name || filters.email || filters.date) && (
          <span style={{ fontSize: "12px", background: "#e8f4fd", color: "#0f3460", padding: "2px 10px", borderRadius: "20px" }}>
            Filtered
          </span>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: "#888", textAlign: "center", padding: "40px" }}>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p style={{ color: "#888", textAlign: "center", padding: "40px" }}>No bookings found.</p>
      ) : (
        <div style={{ border: "1px solid #e5e5e5", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #e5e5e5" }}>
                {["ID", "Guest", "Contact", "Room", "Check-in", "Check-out", "Nights", "Amount", "Status"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", color: "#888", fontWeight: "600", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={b.reservation_id} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#888" }}>#{b.reservation_id}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: "#1a1a1a" }}>{b.guest_name}</td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "#555" }}>
                    <div>{b.email}</div>
                    <div style={{ color: "#888" }}>{b.phone}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px" }}>
                    <span style={{ fontWeight: "600" }}>Room {b.room_number}</span>
                    <span style={{ color: "#888", fontSize: "12px" }}> · {b.room_type}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#555" }}>
                    {b.check_in_date?.toString().slice(0, 10)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#555" }}>
                    {b.check_out_date?.toString().slice(0, 10)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#555", textAlign: "center" }}>
                    {nights(b.check_in_date, b.check_out_date)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: "#1a1a1a" }}>
                    ₹{Number(b.total_amount).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                      background: getStatusColor(b.status) + '20',
                      color: getStatusColor(b.status)
                    }}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}