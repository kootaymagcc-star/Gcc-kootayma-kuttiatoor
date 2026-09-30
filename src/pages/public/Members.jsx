import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, Eye, MapPin, Calendar, Award } from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../firebase';
import MemberDetailsModal from '../../components/MemberDetailsModal';

export default function Members() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [membersList, setMembersList] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'members'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setMembersList(data);
    });
    return () => unsub();
  }, []);

  const filteredMembers = membersList.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 2rem 0' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Member Directory</h2>
          <p style={{ color: 'var(--text-muted)' }}>100% transparency on our community members and their generous contributions.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', background: 'white' }}>
            <Download size={18} /> Export List
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search members by name or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.1)',
              background: 'rgba(255,255,255,0.8)',
              fontSize: '1rem',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>
        <button className="btn" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-main)' }}>
          <Filter size={18} /> Filters
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '2rem',
        perspective: '1000px'
      }}>
        {filteredMembers.map((member, i) => (
          <div 
            key={member.id} 
            className={`stagger-${(i % 3) + 1}`} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              animation: 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.85) 100%)',
              boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255,255,255,0.5)',
              backdropFilter: 'blur(10px)',
              transform: 'translateZ(0)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              ':hover': {
                transform: 'translateY(-5px) scale(1.02)',
                boxShadow: '0 20px 40px -10px rgba(139, 92, 246, 0.2)'
              }
            }}
          >
            {/* Top decorative tech pattern or gradient */}
            <div style={{
              height: '80px',
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              background: member.type === 'Executive' 
                ? 'linear-gradient(135deg, rgba(217,119,6,0.15) 0%, rgba(251,191,36,0) 100%)' 
                : 'linear-gradient(135deg, rgba(5,150,105,0.15) 0%, rgba(52,211,153,0) 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.5)',
              zIndex: 0
            }}></div>
            
            <div style={{ padding: '1.5rem', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {/* AI-style Glowing Profile Picture */}
                <div style={{
                  position: 'relative',
                  padding: '3px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
                  borderRadius: '50%',
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.4), inset 0 0 10px rgba(255,255,255,0.5)',
                  animation: 'pulse 3s infinite alternate'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-4px', left: '-4px', right: '-4px', bottom: '-4px',
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, transparent, rgba(139,92,246,0.5), transparent)',
                    animation: 'spin 4s linear infinite',
                    zIndex: -1
                  }}></div>
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    style={{ 
                      width: 72, 
                      height: 72, 
                      borderRadius: '50%', 
                      border: '3px solid white', 
                      objectFit: 'cover',
                      display: 'block',
                      background: 'white'
                    }} 
                  />
                </div>
                
                <div>
                  <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.35rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>{member.name}</h3>
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '4px 14px', 
                    borderRadius: '99px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    background: member.type === 'Executive' 
                      ? 'linear-gradient(135deg, rgba(217,119,6,0.1), rgba(217,119,6,0.2))' 
                      : 'linear-gradient(135deg, rgba(5,150,105,0.1), rgba(5,150,105,0.2))',
                    color: member.type === 'Executive' ? '#b45309' : '#047857',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    border: member.type === 'Executive' ? '1px solid rgba(217,119,6,0.2)' : '1px solid rgba(5,150,105,0.2)'
                  }}>
                    {member.type === 'Executive' && <Award size={14} />}
                    {member.type}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                  <div style={{ background: 'rgba(14,165,233,0.1)', padding: '6px', borderRadius: '8px', color: '#0ea5e9' }}>
                    <MapPin size={16} />
                  </div>
                  <span>{member.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                  <div style={{ background: 'rgba(139,92,246,0.1)', padding: '6px', borderRadius: '8px', color: '#8b5cf6' }}>
                    <Calendar size={16} />
                  </div>
                  <span>Joined {member.joinDate}</span>
                </div>
              </div>
              
              <div style={{ 
                background: 'rgba(255,255,255,0.6)', 
                borderRadius: '16px', 
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid rgba(226,232,240,0.8)',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem', fontWeight: 600 }}>Contributions</div>
                  <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    ₹ {member.totalContributions.toLocaleString()}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMember(member)}
                  className="btn" 
                  style={{ 
                    padding: '10px 18px', 
                    fontSize: '0.9rem', 
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(15,23,42,0.2)'
                  }}
                >
                  <Eye size={16} /> Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <MemberDetailsModal 
        isOpen={!!selectedMember} 
        onClose={() => setSelectedMember(null)} 
        member={selectedMember} 
      />
    </div>
  );
}
