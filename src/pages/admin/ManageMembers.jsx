import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Check, X, UserPlus, Trash2, Eye, Search } from 'lucide-react';
import MemberDetailsModal from '../../components/MemberDetailsModal';

export default function ManageMembers() {
  const [requests, setRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);

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
    if (processingId) return;
    setProcessingId(request.id);
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
        avatar: request.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.name)}&background=random`,
        timestamp: serverTimestamp()
      });
      // 2. Delete from requests
      await deleteDoc(doc(db, 'registrationRequests', request.id));
    } catch (err) {
      console.error("Error approving request: ", err);
      alert("Failed to approve. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (processingId) return;
    try {
      if(window.confirm('Are you sure you want to reject this request?')) {
        setProcessingId(id);
        await deleteDoc(doc(db, 'registrationRequests', id));
      }
    } catch (err) {
      console.error("Error rejecting request: ", err);
    } finally {
      setProcessingId(null);
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

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
    (m.email && m.email.toLowerCase().includes(memberSearch.toLowerCase())) ||
    (m.location && m.location.toLowerCase().includes(memberSearch.toLowerCase()))
  );

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
                        <button disabled={processingId === req.id} onClick={() => handleApprove(req)} style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: processingId === req.id ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', opacity: processingId === req.id ? 0.5 : 1 }}>
                          <Check size={14} /> {processingId === req.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button disabled={processingId === req.id} onClick={() => handleReject(req.id)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', cursor: processingId === req.id ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', opacity: processingId === req.id ? 0.5 : 1 }}>
                          <X size={14} /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-cards" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map(req => (
                <div key={req.id} style={{ 
                  background: 'linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.8) 100%)', 
                  border: '1px solid rgba(148, 163, 184, 0.15)',
                  padding: '1.25rem', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem',
                        boxShadow: '0 4px 10px rgba(139, 92, 246, 0.4)'
                      }}>
                        {req.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'white', fontSize: '1.1rem' }}>{req.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: 'var(--primary-light)' }}>{req.profession}</span> • {req.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <div>✉️ {req.email}</div>
                    <div style={{ marginTop: '4px' }}>📞 {req.phone}</div>
                    {req.website && <div style={{ marginTop: '4px' }}>🔗 <a href={req.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Portfolio / Website</a></div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <button disabled={processingId === req.id} onClick={() => handleApprove(req)} style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: 'white', padding: '10px', borderRadius: '8px', cursor: processingId === req.id ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', opacity: processingId === req.id ? 0.5 : 1 }}>
                      <Check size={18} /> {processingId === req.id ? '...' : 'Approve'}
                    </button>
                    <button disabled={processingId === req.id} onClick={() => handleReject(req.id)} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '10px', borderRadius: '8px', cursor: processingId === req.id ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600, opacity: processingId === req.id ? 0.5 : 1 }}>
                      <X size={18} /> Reject
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Active Members ({members.length})</h2>
          <div style={{ position: 'relative', flex: '1 1 250px', maxWidth: '300px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search members..." 
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        
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
                  {filteredMembers.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '1rem', color: '#94a3b8', textAlign: 'center' }}>No members found matching your search.</td></tr>
                  ) : filteredMembers.map(member => (
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
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setSelectedMember(member)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="View Full Details">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleDeleteMember(member.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Delete Member">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-cards" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredMembers.length === 0 ? (
                <div style={{ padding: '1rem', color: '#94a3b8', textAlign: 'center' }}>No members found matching your search.</div>
              ) : filteredMembers.map(member => (
                <div key={member.id} style={{ 
                  background: 'linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.8) 100%)',
                  border: '1px solid rgba(148, 163, 184, 0.15)',
                  padding: '1.25rem', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Decorative glowing orb */}
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'var(--primary)', filter: 'blur(40px)', opacity: 0.2, borderRadius: '50%' }}></div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', zIndex: 1 }}>
                    <div style={{ position: 'relative' }}>
                      <img src={member.avatar} alt={member.name} style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, background: '#10b981', borderRadius: '50%', border: '2px solid #1e293b' }}></div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'white', fontSize: '1.1rem', marginBottom: '2px' }}>{member.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderRadius: '99px', fontWeight: 600 }}>{member.type}</span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• {member.location}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                        Joined {member.joinDate}
                        {member.website && <span> • <a href={member.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-light)', textDecoration: 'none' }}>Link</a></span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', zIndex: 1 }}>
                    <button onClick={() => setSelectedMember(member)} style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', ':hover': { background: '#3b82f6', color: 'white' } }}>
                      <Eye size={20} />
                    </button>
                    <button onClick={() => handleDeleteMember(member.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', ':hover': { background: '#ef4444', color: 'white' } }}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <MemberDetailsModal 
        isOpen={!!selectedMember} 
        onClose={() => setSelectedMember(null)} 
        member={selectedMember} 
      />
    </div>
  );
}
