import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Welcome to Admin Portal</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Members</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>1,248</p>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Pending Requests</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>14</p>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Funds Raised (This Month)</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-light)' }}>₹ 125,400</p>
        </div>
      </div>

      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>Recent Admin Activity</h2>
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '1.5rem' }}>
        <p style={{ color: '#94a3b8' }}>No recent activity to display.</p>
      </div>
    </div>
  );
}
