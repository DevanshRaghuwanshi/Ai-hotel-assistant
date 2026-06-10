import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Admin() {
  const [activeTab, setActiveTab] = useState('rooms');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [newRoom, setNewRoom] = useState({
    room_number: '', room_type: 'Standard', price_per_night: '', max_guests: '2', description: ''
  });
  const navigate = useNavigate();
  const hotel = JSON.parse(localStorage.getItem('hotel') || '{}');
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

  const addRoom = async () => {
    if (!newRoom.room_number || !newRoom.price_per_night) {
      setMessage('Room number and price are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/rooms/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRoom)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Room added successfully!');
        setNewRoom({ room_number: '', room_type: 'Standard', price_per_night: '', max_guests: '2', description: '' });
        fetchRooms();
      } else {
        setMessage(data.error || 'Failed to add room');
      }
    } catch (e) {
      setMessage('Network error');
    }
    setLoading(false);
  };

  const [docFile, setDocFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [uploading, setUploading] = useState(false);

  const uploadDocument = async () => {
    if (!docFile) { setMessage('Please select a file'); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append('document', docFile);
    formData.append('name', docName || docFile.name);

    try {
      const res = await fetch('http://localhost:5000/documents/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Document uploaded and indexed successfully!');
        setDocFile(null);
        setDocName('');
      } else {
        setMessage(data.error || 'Upload failed');
      }
    } catch (e) {
      setMessage('Network error');
    }
    setUploading(false);
  };

  const tabStyle = (tab) => ({
    padding: "8px 20px", border: "none", borderRadius: "8px", cursor: "pointer",
    fontSize: "13px", fontWeight: "600",
    background: activeTab === tab ? "#1a1a1a" : "transparent",
    color: activeTab === tab ? "#fff" : "#888"
  });

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#f8f9fa" }}>

      {/* Header */}
      <div style={{ background: "#1a1a1a", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#fff", fontSize: "18px", fontWeight: "700" }}>Admin Panel</div>
          <div style={{ color: "#888", fontSize: "12px" }}>{hotel.hotel_name}</div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "40px auto", padding: "0 24px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", background: "#f0f0f0", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
          <button style={tabStyle('rooms')} onClick={() => setActiveTab('rooms')}>🏠 Manage Rooms</button>
          <button style={tabStyle('documents')} onClick={() => setActiveTab('documents')}>📄 Upload Documents</button>
          <button style={tabStyle('profile')} onClick={() => setActiveTab('profile')}>⚙️ Profile</button>
        </div>

        {/* Message */}
        {message && (
          <div style={{ padding: "12px 16px", background: message.includes('success') ? "#f0fdf4" : "#fef2f2", border: `1px solid ${message.includes('success') ? "#86efac" : "#fecaca"}`, borderRadius: "8px", marginBottom: "16px", fontSize: "13px", color: message.includes('success') ? "#16a34a" : "#dc2626" }}>
            {message}
            <button onClick={() => setMessage('')} style={{ float: "right", background: "none", border: "none", cursor: "pointer", color: "#888" }}>✕</button>
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a1a", marginBottom: "20px" }}>Add New Room</h2>
            <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Room Number *</label>
                  <input value={newRoom.room_number} onChange={e => setNewRoom({ ...newRoom, room_number: e.target.value })}
                    placeholder="e.g. 101"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Room Type</label>
                  <select value={newRoom.room_type} onChange={e => setNewRoom({ ...newRoom, room_type: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}>
                    <option>Standard</option>
                    <option>Deluxe</option>
                    <option>Family</option>
                    <option>Suite</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Price per Night (₹) *</label>
                  <input value={newRoom.price_per_night} onChange={e => setNewRoom({ ...newRoom, price_per_night: e.target.value })}
                    placeholder="e.g. 3500" type="number"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Max Guests</label>
                  <select value={newRoom.max_guests} onChange={e => setNewRoom({ ...newRoom, max_guests: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Description</label>
                  <input value={newRoom.description} onChange={e => setNewRoom({ ...newRoom, description: e.target.value })}
                    placeholder="e.g. Spacious room with city view"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <button onClick={addRoom} disabled={loading}
                style={{ marginTop: "16px", padding: "10px 24px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                {loading ? 'Adding...' : '+ Add Room'}
              </button>
            </div>

            {/* Existing Rooms */}
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a1a", marginBottom: "16px" }}>Your Rooms ({rooms.length})</h2>
            {rooms.length === 0 ? (
              <p style={{ color: "#888", fontSize: "13px" }}>No rooms added yet.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                {rooms.map(room => (
                  <div key={room.id} style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: "10px", padding: "16px" }}>
                    <div style={{ fontWeight: "700", fontSize: "16px", color: "#1a1a1a" }}>Room {room.room_number}</div>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>{room.room_type}</div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f3460", marginTop: "8px" }}>₹{room.price_per_night}/night</div>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Max {room.max_guests} guests</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a1a", marginBottom: "8px" }}>Upload Hotel Documents</h2>
            <p style={{ color: "#888", fontSize: "13px", marginBottom: "20px" }}>
              Upload PDF or text files. The AI will automatically learn from these documents.
            </p>
            <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Document Name (optional)</label>
                  <input value={docName} onChange={e => setDocName(e.target.value)}
                    placeholder="e.g. Hotel Policy 2026"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Select File (PDF or TXT)</label>
                  <input type="file" accept=".pdf,.txt"
                    onChange={e => setDocFile(e.target.files[0])}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
                {docFile && (
                  <div style={{ padding: "10px 12px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", fontSize: "13px", color: "#16a34a" }}>
                    Selected: {docFile.name} ({(docFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
                <button onClick={uploadDocument} disabled={uploading}
                  style={{ padding: "10px 24px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600", width: "fit-content" }}>
                  {uploading ? 'Uploading & Indexing...' : '⬆ Upload Document'}
                </button>
              </div>
            </div>

            {/* Info box */}
            <div style={{ marginTop: "16px", padding: "16px", background: "#e8f4fd", border: "1px solid #bfdbfe", borderRadius: "10px" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f3460", marginBottom: "8px" }}>📌 How it works</div>
              <div style={{ fontSize: "12px", color: "#555", lineHeight: "1.6" }}>
                1. Upload your hotel policy, room details, restaurant menu, etc.<br />
                2. The system automatically chunks and indexes the document<br />
                3. Your AI chatbot instantly knows the new information<br />
                4. Guests can ask questions and get accurate answers
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a1a", marginBottom: "20px" }}>Hotel Profile</h2>
            <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "24px" }}>
              {[
                { label: "Hotel Name", value: hotel.hotel_name },
                { label: "Email", value: hotel.email },
                { label: "Hotel ID", value: `#${hotel.id}` },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <span style={{ fontSize: "13px", color: "#888" }}>{item.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a1a" }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Embed Code */}
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a1a", margin: "24px 0 16px" }}>Your Chatbot Embed Code</h2>
            <div style={{ background: "#1a1a1a", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>Add this to your hotel website:</div>
              <code style={{ color: "#86efac", fontSize: "12px", lineHeight: "1.6" }}>
                {`<script src="https://yourpms.com/widget.js?hotel_id=${hotel.id}"></script>`}
              </code>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}