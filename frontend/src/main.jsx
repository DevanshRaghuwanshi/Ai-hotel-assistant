import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PMS from './PMS.jsx'
import App from './App.jsx'
import StaffDashboard from './StaffDashboard.jsx'
import BookingHistory from './BookingHistory.jsx'
import Auth from './Auth.jsx'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/" element={<ProtectedRoute><PMS /></ProtectedRoute>} />
        <Route path="/chat" element={<App />} />
        <Route path="/staff" element={<ProtectedRoute><StaffDashboard /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)