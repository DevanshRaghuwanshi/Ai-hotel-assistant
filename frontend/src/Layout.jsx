import { Link, useLocation, useNavigate } from "react-router-dom";

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
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif", background: "#f8f9fa" }}>

      {/* Sidebar */}
      <div style={{
        width: "240px", minHeight: "100vh", background: "#fff",
        borderRight: "1px solid #e5e5e5", display: "flex",
        flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50
      }}>

        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", background: "#1a1a1a", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
              🏨
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a1a", lineHeight: 1.2 }}>
                {hotel.hotel_name || 'Hotel PMS'}
              </div>
              <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>Property Management</div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
          {menuItems.map(section => (
            <div key={section.section} style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", color: "#bbb", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 8px", marginBottom: "6px" }}>
                {section.section}
              </div>
              {section.items.map(item => (
                <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "9px 10px", borderRadius: "8px", marginBottom: "2px",
                    background: isActive(item.path) ? "#f0f0f0" : "transparent",
                    cursor: "pointer", transition: "background 0.15s"
                  }}
                    onMouseEnter={e => { if (!isActive(item.path)) e.currentTarget.style.background = "#f8f8f8" }}
                    onMouseLeave={e => { if (!isActive(item.path)) e.currentTarget.style.background = "transparent" }}
                  >
                    <span style={{ fontSize: "15px", width: "20px", textAlign: "center" }}>{item.icon}</span>
                    <span style={{ fontSize: "13px", fontWeight: isActive(item.path) ? "600" : "400", color: isActive(item.path) ? "#1a1a1a" : "#555" }}>
                      {item.label}
                    </span>
                    {isActive(item.path) && (
                      <div style={{ marginLeft: "auto", width: "4px", height: "4px", borderRadius: "50%", background: "#1a1a1a" }} />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* User Profile + Logout */}
        <div style={{ padding: "12px", borderTop: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", borderRadius: "8px", background: "#f8f9fa" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: "#fff", fontWeight: "600", flexShrink: 0 }}>
              {hotel.hotel_name?.charAt(0) || 'H'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {hotel.hotel_name}
              </div>
              <div style={{ fontSize: "11px", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {hotel.email}
              </div>
            </div>
            <button onClick={logout} title="Logout"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "16px", padding: "2px", flexShrink: 0 }}>
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
