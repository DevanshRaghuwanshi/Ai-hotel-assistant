import { useState, useEffect } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
  .mr-page * { box-sizing: border-box; }
  .mr-page { font-family: 'DM Sans', sans-serif; }
  .mr-input { width: 100%; padding: 10px 12px; border: 1px solid #e5e5e5; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s; font-family: 'DM Sans', sans-serif; background: #fff; color: #1a1a1a; }
  .mr-input:focus { border-color: #c9a96e; }
  .mr-select { width: 100%; padding: 10px 12px; border: 1px solid #e5e5e5; border-radius: 8px; font-size: 14px; outline: none; font-family: 'DM Sans', sans-serif; background: #fff; color: #1a1a1a; cursor: pointer; }
  .mr-select:focus { border-color: #c9a96e; }
  .mr-label { font-size: 12px; color: #888; display: block; margin-bottom: 6px; font-weight: 500; }
  .mr-btn { padding: 12px 32px; background: #1a1a1a; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
  .mr-btn:hover { background: #333; transform: translateY(-1px); }
  .mr-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .mr-btn-gold { background: #c9a96e; color: #0a0a0a; }
  .mr-btn-gold:hover { background: #d4b87a; }
`;

export default function ManualReservation() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    id_proof_type: 'Aadhar', id_proof_number: '',
    room_id: '', check_in_date: '', check_out_date: '',
    num_guests: '1'
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('http://localhost:5000/rooms/available', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (e) {}
  };

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
    setError('');
    setSuccess(null);
  };

  const calculateNights = () => {
    if (!form.check_in_date || !form.check_out_date) return 0;
    const diff = new Date(form.check_out_date) - new Date(form.check_in_date);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const calculateTotal = () => {
    const room = rooms.find(r => r.id === parseInt(form.room_id));
    if (!room) return 0;
    return calculateNights() * parseFloat(room.price_per_night);
  };

  const selectedRoom = rooms.find(r => r.id === parseInt(form.room_id));

  const handleSubmit = async () => {
    // Validate
    if (!form.full_name || !form.email || !form.phone || !form.id_proof_number || !form.room_id || !form.check_in_date || !form.check_out_date) {
      setError('All fields are required');
      return;
    }
    if (calculateNights() <= 0) {
      setError('Check-out must be after check-in');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/reservations/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          num_guests: parseInt(form.num_guests),
          room_id: parseInt(form.room_id)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create reservation');
        setLoading(false);
        return;
      }

      setSuccess(data);
      setForm({
        full_name: '', email: '', phone: '',
        id_proof_type: 'Aadhar', id_proof_number: '',
        room_id: '', check_in_date: '', check_out_date: '',
        num_guests: '1'
      });
      fetchRooms(); // refresh available rooms

    } catch (e) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="mr-page" style={{ padding: "32px 40px", minHeight: "100vh", background: "#f4f4f2" }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Staff Portal</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: "700", color: "#1a1a1a", margin: "0 0 6px" }}>
          New Reservation
        </h1>
        <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>Create a reservation manually for walk-in or phone guests.</p>
      </div>

      {/* Success message */}
      {success && (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "12px", padding: "20px 24px", marginBottom: "24px" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "700", color: "#16a34a", marginBottom: "12px" }}>
            ✓ Reservation Created!
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {[
              { label: "Reservation ID", value: `#${success.reservation_id}` },
              { label: "Guest", value: success.guest_name },
              { label: "Room", value: `${success.room_number} (${success.room_type})` },
              { label: "Check-in", value: success.check_in },
              { label: "Check-out", value: success.check_out },
              { label: "Total Amount", value: `₹${Number(success.total_amount).toLocaleString()}` },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: "11px", color: "#888", marginBottom: "2px" }}>{item.label}</div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a1a" }}>{item.value}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setSuccess(null)} className="mr-btn mr-btn-gold" style={{ marginTop: "16px" }}>
            + New Reservation
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>

        {/* Form */}
        <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: "12px", padding: "28px" }}>

          {/* Guest Details */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: "#1a1a1a", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f0f0f0" }}>
              Guest Details
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label className="mr-label">Full Name *</label>
                <input className="mr-input" value={form.full_name} onChange={e => handleChange('full_name', e.target.value)} placeholder="Rahul Sharma" />
              </div>
              <div>
                <label className="mr-label">Email *</label>
                <input className="mr-input" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="rahul@gmail.com" type="email" />
              </div>
              <div>
                <label className="mr-label">Phone *</label>
                <input className="mr-input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="9876543210" />
              </div>
              <div>
                <label className="mr-label">Number of Guests</label>
                <select className="mr-select" value={form.num_guests} onChange={e => handleChange('num_guests', e.target.value)}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="mr-label">ID Proof Type *</label>
                <select className="mr-select" value={form.id_proof_type} onChange={e => handleChange('id_proof_type', e.target.value)}>
                  <option>Aadhar</option>
                  <option>Passport</option>
                  <option>Driving License</option>
                  <option>Voter ID</option>
                </select>
              </div>
              <div>
                <label className="mr-label">ID Proof Number *</label>
                <input className="mr-input" value={form.id_proof_number} onChange={e => handleChange('id_proof_number', e.target.value)} placeholder="1234-5678-9012" />
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: "#1a1a1a", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f0f0f0" }}>
              Booking Details
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label className="mr-label">Room *</label>
                <select className="mr-select" value={form.room_id} onChange={e => handleChange('room_id', e.target.value)}>
                  <option value="">Select room</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      Room {room.room_number} — {room.room_type} (₹{room.price_per_night}/night)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mr-label">Check-in Date *</label>
                <input className="mr-input" type="date" value={form.check_in_date} onChange={e => handleChange('check_in_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="mr-label">Check-out Date *</label>
                <input className="mr-input" type="date" value={form.check_out_date} onChange={e => handleChange('check_out_date', e.target.value)}
                  min={form.check_in_date || new Date().toISOString().split('T')[0]} />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ marginTop: "16px", padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "13px", color: "#dc2626" }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
            <button className="mr-btn mr-btn-gold" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create Reservation →'}
            </button>
            <button className="mr-btn" style={{ background: "transparent", color: "#888", border: "1px solid #e5e5e5" }}
              onClick={() => { setForm({ full_name: '', email: '', phone: '', id_proof_type: 'Aadhar', id_proof_number: '', room_id: '', check_in_date: '', check_out_date: '', num_guests: '1' }); setError(''); }}>
              Clear
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div>
          <div style={{ background: "#1a1a1a", borderRadius: "12px", padding: "24px", position: "sticky", top: "24px" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: "#f0ede6", marginBottom: "20px" }}>
              Booking Summary
            </div>

            {selectedRoom ? (
              <>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "14px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#f0ede6", fontFamily: "'Playfair Display', serif" }}>
                    Room {selectedRoom.room_number}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{selectedRoom.room_type} · Max {selectedRoom.max_guests} guests</div>
                  <div style={{ fontSize: "14px", color: "#c9a96e", fontWeight: "600", marginTop: "8px" }}>₹{selectedRoom.price_per_night}/night</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  {[
                    { label: "Check-in", value: form.check_in_date || '—' },
                    { label: "Check-out", value: form.check_out_date || '—' },
                    { label: "Nights", value: calculateNights() || '—' },
                    { label: "Guests", value: form.num_guests },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "12px", color: "#666" }}>{item.label}</span>
                      <span style={{ fontSize: "13px", color: "#f0ede6", fontWeight: "500" }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "#888" }}>Total Amount</span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "700", color: "#c9a96e" }}>
                      ₹{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#444", fontSize: "13px" }}>
                Select a room to see<br />booking summary
              </div>
            )}

            {form.full_name && (
              <div style={{ marginTop: "16px", padding: "12px", background: "rgba(201,169,110,0.08)", borderRadius: "8px", border: "1px solid rgba(201,169,110,0.15)" }}>
                <div style={{ fontSize: "11px", color: "#c9a96e", marginBottom: "4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Guest</div>
                <div style={{ fontSize: "13px", color: "#f0ede6", fontWeight: "600" }}>{form.full_name}</div>
                <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>{form.email}</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
