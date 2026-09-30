import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Settings, LogOut, Users, HeartHandshake, Image as ImageIcon, Wallet, Calendar as CalendarIcon, FileSpreadsheet, Briefcase } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function AdminLayout() {
  const location = useLocation();

  const adminLinks = [
    { path: '/admin', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/users', label: 'Manage Members', icon: <Users size={20} /> },
    { path: '/admin/contributions', label: 'Log Contributions', icon: <Wallet size={20} /> },
    { path: '/admin/campaigns', label: 'Manage Campaigns', icon: <HeartHandshake size={20} /> },
    { path: '/admin/media', label: 'Posts & Media', icon: <ImageIcon size={20} /> },
    { path: '/admin/calendar', label: 'Manage Calendar', icon: <CalendarIcon size={20} /> },
    { path: '/admin/jobs', label: 'Job Board', icon: <Briefcase size={20} /> },
    { path: '/admin/reports', label: 'Reports & Excel', icon: <FileSpreadsheet size={20} /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white' }}>
      {/* Admin Sidebar */}
      <aside className="admin-sidebar" style={{ backgroundColor: '#1e293b', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2.5rem' }}>
          <ShieldCheck size={28} color="var(--primary-light)" />
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'white' }}>Admin Portal</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
          {adminLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path}
                to={link.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', 
                  borderRadius: '8px', textDecoration: 'none',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? 'white' : '#94a3b8',
                  transition: 'all 0.2s'
                }}
              >
                {link.icon}
                <span className="hide-on-mobile" style={{ fontWeight: 500 }}>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <button 
          onClick={() => signOut(auth)}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#f87171', marginTop: 'auto', fontSize: '1rem', fontFamily: 'inherit' }}
        >
          <LogOut size={20} />
          <span className="hide-on-mobile">Exit Admin</span>
        </button>
      </aside>

      {/* Admin Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
