import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Building, Clock, ChevronRight, Search, X } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'jobs'), orderBy('timestamp', 'desc')), (snapshot) => {
      setJobs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Helper to generate a consistent color based on company name string
  const getCompanyColor = (name) => {
    const colors = [
      'linear-gradient(135deg, #3b82f6, #2563eb)',
      'linear-gradient(135deg, #ef4444, #dc2626)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      'linear-gradient(135deg, #ec4899, #db2777)',
    ];
    let sum = 0;
    for(let i = 0; i < (name || '').length; i++) sum += (name || '').charCodeAt(i);
    return colors[sum % colors.length];
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Premium Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        borderRadius: '24px', 
        padding: '3rem 2rem', 
        marginBottom: '3rem', 
        position: 'relative', 
        overflow: 'hidden',
        boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)'
      }}>
        {/* Abstract decorative circles */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', filter: 'blur(40px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-50px', left: '20%', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.2)', filter: 'blur(40px)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <Briefcase size={16} /> CAREER PORTAL
          </div>
          <h1 style={{ fontSize: '2.5rem', margin: 0, color: 'white', fontWeight: 900, lineHeight: 1.2 }}>Find your next big opportunity.</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0, lineHeight: 1.6 }}>
            Exclusive job postings from within the community. Connect, grow, and succeed together.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Latest Openings <span style={{ color: '#94a3b8', fontSize: '1.2rem', fontWeight: 600 }}>({jobs.length})</span></h2>
        
        <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '8px 16px', borderRadius: '99px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <Search size={16} color="#94a3b8" style={{ marginRight: '8px' }} />
          <input type="text" placeholder="Search roles..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', width: '150px' }} disabled />
        </div>
      </div>
      
      {/* Sleek Modern List View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {jobs.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
            <Briefcase size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No jobs available</h3>
            <p style={{ margin: 0 }}>Check back later for new opportunities.</p>
          </div>
        ) : jobs.map((job, i) => (
          <div 
            key={job.id} 
            className={`stagger-${(i % 3) + 1}`}
            onClick={() => setSelectedJob(job)}
            style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              gap: '1.5rem',
              alignItems: 'center',
              padding: '20px', 
              background: 'white',
              borderRadius: '20px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 4px 15px -5px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(59, 130, 246, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px -5px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
            }}
          >
            {/* Dynamic Company Logo Block */}
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '16px', 
              background: getCompanyColor(job.company),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.8rem',
              fontWeight: 800,
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              {(job.company || 'C').charAt(0).toUpperCase()}
            </div>

            {/* Job Info */}
            <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{job.title}</h3>
                <span style={{ padding: '4px 10px', background: '#f1f5f9', color: '#475569', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>{job.type}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#334155' }}>
                  <Building size={16} color="#94a3b8" /> {job.company}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} color="#94a3b8" /> {job.location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} color="#94a3b8" /> {job.timestamp ? new Date(job.timestamp.seconds * 1000).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            </div>

            {/* View Details / Apply */}
            <div style={{ flexShrink: 0, marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                View Details
              </button>
              <a 
                href={`mailto:${job.contactEmail}`} 
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  textDecoration: 'none', 
                  padding: '10px 24px', 
                  background: 'var(--primary)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
              >
                Apply Now <ChevronRight size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div 
          className="animate-fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            padding: '20px'
          }}
          onClick={() => setSelectedJob(null)}
        >
          <div 
            className="animate-slide-up"
            style={{
              background: 'white',
              width: '100%',
              maxWidth: '600px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
              marginTop: window.innerWidth <= 768 ? 'auto' : 0, // Bottom-sheet on mobile
              marginBottom: window.innerWidth <= 768 ? '-20px' : 0,
              borderBottomLeftRadius: window.innerWidth <= 768 ? 0 : '24px',
              borderBottomRightRadius: window.innerWidth <= 768 ? 0 : '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ 
              padding: '30px 24px', 
              background: getCompanyColor(selectedJob.company), 
              color: 'white',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <button 
                onClick={() => setSelectedJob(null)} 
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                <X size={20} />
              </button>

              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '20px', 
                background: 'white',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 900,
                flexShrink: 0,
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
              }}>
                {(selectedJob.company || 'C').charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.75rem', fontWeight: 900, lineHeight: 1.2 }}>{selectedJob.title}</h2>
                <span style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, backdropFilter: 'blur(10px)' }}>
                  {selectedJob.type}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Company</span>
                  <span style={{ color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><Building size={16} color="var(--primary)" /> {selectedJob.company}</span>
                </div>
                <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Location</span>
                  <span style={{ color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} color="var(--primary)" /> {selectedJob.location}</span>
                </div>
                <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Posted</span>
                  <span style={{ color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} color="var(--primary)" /> {selectedJob.timestamp ? new Date(selectedJob.timestamp.seconds * 1000).toLocaleDateString() : 'Recent'}</span>
                </div>
              </div>

              <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Job Description</h4>
              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' }}>
                {selectedJob.description || "No detailed description provided for this position. Please contact the employer for more information."}
              </p>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', background: 'white' }}>
              <a 
                href={`mailto:${selectedJob.contactEmail}`} 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%', 
                  padding: '16px', 
                  background: 'var(--primary)', 
                  color: 'white', 
                  textDecoration: 'none',
                  border: 'none', 
                  borderRadius: '16px', 
                  fontWeight: 800, 
                  fontSize: '1.1rem', 
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Apply for this Position <ChevronRight size={20} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
