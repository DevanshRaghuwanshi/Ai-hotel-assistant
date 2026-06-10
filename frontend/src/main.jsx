import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './Landing.jsx'
import PMS from './PMS.jsx'
import App from './App.jsx'
import StaffDashboard from './StaffDashboard.jsx'
import BookingHistory from './BookingHistory.jsx'
import Admin from './Admin.jsx'
import Pricing from './Pricing.jsx'
import Auth from './Auth.jsx'
import Layout from './Layout.jsx'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
}

function ProtectedLayout({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/dashboard" element={<ProtectedLayout><PMS /></ProtectedLayout>} />
        <Route path="/chat" element={<ProtectedLayout><App /></ProtectedLayout>} />
        <Route path="/staff" element={<ProtectedLayout><StaffDashboard /></ProtectedLayout>} />
        <Route path="/bookings" element={<ProtectedLayout><BookingHistory /></ProtectedLayout>} />
        <Route path="/admin" element={<ProtectedLayout><Admin /></ProtectedLayout>} />
        <Route path="/pricing" element={<ProtectedLayout><Pricing /></ProtectedLayout>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)