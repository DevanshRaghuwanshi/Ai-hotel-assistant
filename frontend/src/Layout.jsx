import { Link, useLocation, useNavigate } from "react-router-dom";
//css
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
  
  .pms-layout * { box-sizing: border-box; }
  .pms-layout { font-family: 'DM Sans', sans-serif; }
  
  .sidebar-link { text-decoration: none; display: block; }
  .sidebar-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; margin-bottom: 2px; cursor: pointer; transition: all 0.15s; }
  .sidebar-item:hover { background: rgba(201,169,110,0.08); }
  .sidebar-item.active { background: rgba(201,169,110,0.12); }
  .sidebar-item.active .sidebar-label { color: #c9a96e; font-weight: 600; }
  .sidebar-item.active .sidebar-icon { opacity: 1; }
  .sidebar-label { font-size: 13px; color: #aaa; transition: color 0.15s; }
  .sidebar-item:hover .sidebar-label { color: #f0ede6; }
  .sidebar-icon { font-size: 15px; width: 20px; text-align: center; opacity: 0.7; }
  .sidebar-item.active .sidebar-dot { display: block; }
  .sidebar-dot { display: none; margin-left: auto; width: 4px; height: 4px; border-radius: 50%; background: #c9a96e; }
  
  .section-label { font-size: 10px; color: #444; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 0 12px; margin-bottom: 4px; margin-top: 4px; }
`;

const menuItems = [
  {
    section: "Overview",
    items: [
      { path: "/dashboard", icon: "⊞", label: "Dashboard" },
      { path: "/chat", icon: "🤖", label: "AI Concierge" },
    ]
  },
  {
    section: "Operations",
    items: [
      { path: "/staff", icon: "🏨", label: "Stay View" },
      { path: "/bookings", icon: "📋", label: "Reservations" },
      { path: "/admin", icon: "⚙️", label: "Manage Hotel" },
      { path: "/reservations/new", icon: "➕", label: "New Reservation" },
    ]
  },
  {
    section: "Account",
    items: [
      { path: "/pricing", icon: "💳", label: "Upgrade Plan" },
    ]
  }
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const hotel = JSON.parse(localStorage.getItem('hotel') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hotel');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="pms-layout" style={{ display: "flex", minHeight: "100vh", background: "#f4f4f2" }}>
      <style>{css}</style>

      {/* Sidebar */}
      <div style={{
        width: "240px", minHeight: "100vh", background: "#0f0f0f",
        borderRight: "1px solid #1a1a1a", display: "flex",
        flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50
      }}>

        {/* Logo */}
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.3)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
              🏨
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: "700", color: "#f0ede6", lineHeight: 1.2, maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {hotel.hotel_name || 'Hotel PMS'}
              </div>
              <div style={{ fontSize: "10px", color: "#555", marginTop: "2px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Property Management</div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div style={{ flex: 1, padding: "16px 8px", overflowY: "auto" }}>
          {menuItems.map(section => (
            <div key={section.section} style={{ marginBottom: "20px" }}>
              <div className="section-label">{section.section}</div>
              {section.items.map(item => (
                <Link key={item.path} to={item.path} className="sidebar-link">
                  <div className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}>
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="sidebar-label">{item.label}</span>
                    <span className="sidebar-dot" />
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid #1a1a1a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "rgba(201,169,110,0.2)", border: "1px solid rgba(201,169,110,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#c9a96e", fontWeight: "700", flexShrink: 0, fontFamily: "'Playfair Display', serif" }}>
              {hotel.hotel_name?.charAt(0) || 'H'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#f0ede6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {hotel.hotel_name}
              </div>
              <div style={{ fontSize: "10px", color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {hotel.email}
              </div>
            </div>
            <button onClick={logout} title="Logout"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#444", fontSize: "14px", padding: "4px", flexShrink: 0, transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = '#c9a96e'}
              onMouseLeave={e => e.currentTarget.style.color = '#444'}
            >
              ⎋
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: "240px", flex: 1, minHeight: "100vh" }}>
        {children}
      </div>
    </div>
  );
}
