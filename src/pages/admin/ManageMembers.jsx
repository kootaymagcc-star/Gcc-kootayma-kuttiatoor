import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Check, X, UserPlus, Trash2 } from 'lucide-react';

export default function ManageMembers() {
  const [requests, setRequests] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    // Listen to pending registration requests
    const qRequests = query(collection(db, 'registrationRequests'));
    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
      const reqs = [];
      snapshot.forEach(doc => reqs.push({ id: doc.id, ...doc.data() }));
      setRequests(reqs);
    });

    // Listen to active members
    const qMembers = query(collection(db, 'members'));
    const unsubMembers = onSnapshot(qMembers, (snapshot) => {
      const mems = [];
      snapshot.forEach(doc => mems.push({ id: doc.id, ...doc.data() }));
      setMembers(mems);
    });

    return () => {
      unsubRequests();
      unsubMembers();
    };
  }, []);

  const handleApprove = async (request) => {
    try {
      // 1. Add to members collection
      await addDoc(collection(db, 'members'), {
        name: request.name,
        email: request.email,
        phone: request.phone,
        profession: request.profession,
        location: request.location,
        website: request.website || '',
        type: 'Standard', // Default membership
        totalContributions: 0,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(request.name)}&background=random`,
        timestamp: serverTimestamp()
      });
      // 2. Delete from requests
      await deleteDoc(doc(db, 'registrationRequests', request.id));
    } catch (err) {
      console.error("Error approving request: ", err);
    }
  };

  const handleReject = async (id) => {
    try {
      if(window.confirm('Are you sure you want to reject this request?')) {
        await deleteDoc(doc(db, 'registrationRequests', id));
      }
    } catch (err) {
      console.error("Error rejecting request: ", err);
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await deleteDoc(doc(db, 'members', id));
      } catch (err) {
        console.error(err);
        alert("Error deleting member");
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Manage Members</h1>
      
      {/* Pending Requests Section */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={20} color="var(--accent)" /> Pending Registration Requests ({requests.length})
        </h2>
        
        {requests.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No pending requests.</p>
        ) : (
          <>
            <div className="desktop-table" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '1rem', color: '#94a3b8' }}>Name</th>
                    <th style={{ padding: '1rem', color: '#94a3b8' }}>Email</th>
                    <th style={{ padding: '1rem', color: '#94a3b8' }}>Profession</th>
                    <th style={{ padding: '1rem', color: '#94a3b8' }}>Location</th>
                    <th style={{ padding: '1rem', color: '#94a3b8' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{req.name}</td>
                      <td style={{ padding: '1rem', color: '#cbd5e1' }}>{req.email}<br/><small>{req.phone}</small></td>
                      <td style={{ padding: '1rem', color: '#cbd5e1' }}>{req.profession}</td>
                      <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                        {req.location}
                        {req.website && <div><a href={req.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: '0.75rem', textDecoration: 'none' }}>Website</a></div>}
                      </td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleApprove(req)} style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} /> Approve
                        </button>
                        <button onClick={() => handleReject(req.id)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <X size={14} /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-cards">
              {requests.map(req => (
                <div key={req.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'white' }}>{req.name}</div>
                      <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{req.profession}</div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', textAlign: 'right' }}>
                      {req.location}
                      {req.website && <div><a href={req.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>Website</a></div>}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>{req.email} <br/> {req.phone}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button onClick={() => handleApprove(req)} style={{ flex: 1, background: 'var(--primary)', border: 'none', color: 'white', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Check size={16} /> Approve
                    </button>
                    <button onClick={() => handleReject(req.id)} style={{ flex: 1, background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <X size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Active Members Section */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Active Members ({members.length})</h2>
        
        {members.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No members registered yet.</p>
        ) : (
          <>
            <div className="desktop-table" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '1rem', color: '#94a3b8' }}>Member</th>
                    <th style={{ padding: '1rem', color: '#94a3b8' }}>Type</th>
                    <th style={{ padding: '1rem', color: '#94a3b8' }}>Joined</th>
                    <th style={{ padding: '1rem', color: '#94a3b8' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={member.avatar} alt={member.name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{member.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {member.location}
                            {member.website && <span> • <a href={member.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Website</a></span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--primary-light)' }}>{member.type}</td>
                      <td style={{ padding: '1rem', color: '#cbd5e1' }}>{member.joinDate}</td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={() => handleDeleteMember(member.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-cards">
              {members.map(member => (
                <div key={member.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={member.avatar} alt={member.name} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'white' }}>{member.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)' }}>{member.type} • {member.location}</div>
                      {member.website && <div style={{ fontSize: '0.75rem', marginTop: '2px' }}><a href={member.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Website</a></div>}
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Joined {member.joinDate}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteMember(member.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}>
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
