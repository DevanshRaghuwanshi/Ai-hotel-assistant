import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', date_from: '', date_to: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async (f = filters) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (f.name) params.append('name', f.name);
      if (f.email) params.append('email', f.email);
      if (f.date_from) params.append('date_from', f.date_from);
      if (f.date_to) params.append('date_to', f.date_to);

      const res = await fetch(`http://localhost:5000/rooms/bookings?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setBookings(data.bookings || []);
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
    const cleared = { name: '', email: '', date_from: '', date_to: '' };
    setFilters(cleared);
    fetchBookings(cleared);
  };

  const getStatusColor = (status) => status === 'confirmed' ? '#16a34a' : '#dc2626';

  const nights = (checkIn, checkOut) => {
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.total_amount), 0);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>



      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Bookings", value: bookings.length, color: "#1a1a1a" },
          { label: "Confirmed", value: bookings.filter(b => b.status === 'confirmed').length, color: "#16a34a" },
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, color: "#0f3460" },
        ].map(s => (
          <div key={s.label} style={{ background: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "700", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "16px", marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Guest Name</label>
            <input value={filters.name} onChange={e => handleFilter('name', e.target.value)}
              placeholder="e.g. Rahul Sharma"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Email</label>
            <input value={filters.email} onChange={e => handleFilter('email', e.target.value)}
              placeholder="e.g. rahul@gmail.com"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>From Date</label>
            <input type="date" value={filters.date_from} onChange={e => handleFilter('date_from', e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>To Date</label>
            <input type="date" value={filters.date_to} onChange={e => handleFilter('date_to', e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <button onClick={clearFilters}
            style={{ padding: "8px 16px", background: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer", fontSize: "13px", color: "#888" }}>
            Clear
          </button>
        </div>
      </div>

      {/* Count */}
      <div style={{ marginBottom: "16px", fontSize: "13px", color: "#888" }}>
        {loading ? 'Loading...' : `${bookings.length} booking${bookings.length !== 1 ? 's' : ''} found`}
        {(filters.name || filters.email || filters.date_from || filters.date_to) && (
          <span style={{ marginLeft: "8px", fontSize: "12px", background: "#e8f4fd", color: "#0f3460", padding: "2px 10px", borderRadius: "20px" }}>Filtered</span>
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
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", color: "#888", fontWeight: "600", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={b.reservation_id} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#888" }}>#{b.reservation_id}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: "#1a1a1a" }}>{b.guest_name || 'N/A'}</td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "#555" }}>
                    <div>{b.email}</div>
                    <div style={{ color: "#888" }}>{b.phone}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px" }}>
                    <span style={{ fontWeight: "600" }}>Room {b.room_number}</span>
                    <span style={{ color: "#888", fontSize: "12px" }}> · {b.room_type}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#555" }}>{b.check_in_date?.toString().slice(0, 10)}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#555" }}>{b.check_out_date?.toString().slice(0, 10)}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#555", textAlign: "center" }}>{nights(b.check_in_date, b.check_out_date)}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: "#1a1a1a" }}>₹{Number(b.total_amount).toLocaleString()}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: getStatusColor(b.status) + '20', color: getStatusColor(b.status) }}>
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