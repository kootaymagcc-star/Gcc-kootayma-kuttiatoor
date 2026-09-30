import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Dashboard from './pages/public/Dashboard';
import Campaigns from './pages/public/Campaigns';
import Events from './pages/public/Events';
import Members from './pages/public/Members';
import CalendarPage from './pages/public/CalendarPage';
import JobBoard from './pages/public/JobBoard';

// Admin Pages
// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageMembers from './pages/admin/ManageMembers';
import ManageCampaigns from './pages/admin/ManageCampaigns';
import ManageMedia from './pages/admin/ManageMedia';
import ManageContributions from './pages/admin/ManageContributions';
import ManageCalendar from './pages/admin/ManageCalendar';
import ManageJobs from './pages/admin/ManageJobs';
import ManageReports from './pages/admin/ManageReports';
import AdminLogin from './pages/admin/AdminLogin';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

const ProtectedRoute = ({ children, user, loading }) => {
  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: 'white' }}>Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="events" element={<Events />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="members" element={<Members />} />
          <Route path="jobs" element={<JobBoard />} />
        </Route>

        {/* Admin Login Route */}
        <Route path="/admin/login" element={user ? <Navigate to="/admin" replace /> : <AdminLogin />} />

        {/* Admin Portal Routes */}
        <Route path="/admin" element={<ProtectedRoute user={user} loading={loading}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageMembers />} />
          <Route path="contributions" element={<ManageContributions />} />
          <Route path="campaigns" element={<ManageCampaigns />} />
          <Route path="media" element={<ManageMedia />} />
          <Route path="calendar" element={<ManageCalendar />} />
          <Route path="jobs" element={<ManageJobs />} />
          <Route path="reports" element={<ManageReports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
