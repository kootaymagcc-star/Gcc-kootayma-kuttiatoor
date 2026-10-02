import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    members: 0,
    requests: 0,
    funds: 0
  });

  useEffect(() => {
    const unsubMembers = onSnapshot(collection(db, 'members'), (snap) => {
      setStats(s => ({ ...s, members: snap.size }));
    });
    const unsubRequests = onSnapshot(collection(db, 'registrationRequests'), (snap) => {
      setStats(s => ({ ...s, requests: snap.size }));
    });
    const unsubContributions = onSnapshot(collection(db, 'contributions'), (snap) => {
      let total = 0;
      snap.forEach(doc => {
        total += Number(doc.data().amount || 0);
      });
      setStats(s => ({ ...s, funds: total }));
    });

    return () => {
      unsubMembers();
      unsubRequests();
      unsubContributions();
    };
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Welcome to Admin Portal</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Members</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.members}</p>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Pending Requests</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>{stats.requests}</p>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Funds Raised</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-light)' }}>₹ {stats.funds.toLocaleString()}</p>
        </div>
      </div>

      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>Recent Admin Activity</h2>
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '1.5rem' }}>
        <p style={{ color: '#94a3b8' }}>No recent activity to display.</p>
      </div>
    </div>
  );
}
