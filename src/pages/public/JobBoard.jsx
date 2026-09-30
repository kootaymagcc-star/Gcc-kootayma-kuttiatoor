import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Building, Clock } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'jobs'), orderBy('timestamp', 'desc')), (snapshot) => {
      setJobs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)' }}>
        <Briefcase size={64} color="#3b82f6" style={{ margin: '0 auto 1rem auto' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Community Job Board</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Helping our members grow professionally. Find your next career opportunity within the community.
        </p>
      </div>

      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Latest Opportunities</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {jobs.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No jobs currently posted.
          </div>
        ) : jobs.map(job => (
          <div key={job.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: '1 1 250px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{job.title}</h3>
                  <span style={{ padding: '4px 10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>{job.type}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={16} /> {job.company}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16} /> {job.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> {job.timestamp ? new Date(job.timestamp.seconds * 1000).toLocaleDateString() : 'Recent'}</span>
                </div>
                {job.description && (
                  <p style={{ margin: '0', color: 'var(--text-main)', fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {job.description}
                  </p>
                )}
              </div>
            </div>
            <a href={`mailto:${job.contactEmail}`} className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center', padding: '0.75rem' }}>Apply Now</a>
          </div>
        ))}
      </div>
    </div>
  );
}
