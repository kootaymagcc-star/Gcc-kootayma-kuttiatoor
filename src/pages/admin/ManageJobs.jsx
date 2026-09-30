import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', company: '', location: '', type: 'Full-time', contactEmail: '', description: '' });

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'jobs'), orderBy('timestamp', 'desc')), (snapshot) => {
      setJobs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'jobs'), { ...formData, timestamp: serverTimestamp() });
    setFormData({ title: '', company: '', location: '', type: 'Full-time', contactEmail: '', description: '' });
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this job post?")) {
      await deleteDoc(doc(db, 'jobs', id));
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Briefcase color="#3b82f6" /> Manage Jobs
        </h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Post New Job
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Job Title</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Company</label>
            <input type="text" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Location</label>
            <input type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Contact Email for CVs</label>
            <input type="email" required value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Job Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none', appearance: 'auto' }}>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Job Description & Qualifications</label>
            <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Enter the job requirements, qualifications, and full description..." style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setShowForm(false)} className="btn" style={{ background: '#334155', color: 'white', border: 'none' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ border: 'none' }}>Post Job</button>
          </div>
        </form>
      )}

      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', background: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600 }}>Role</th>
              <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600 }}>Company</th>
              <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600 }}>Location</th>
              <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No jobs posted yet.</td></tr>
            ) : jobs.map((job, i) => (
              <tr key={job.id} style={{ borderBottom: '1px solid #334155', backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '1rem 1.5rem', color: 'white', fontWeight: 500 }}>{job.title} <span style={{ fontSize: '0.75rem', background: '#334155', padding: '2px 6px', borderRadius: '4px', marginLeft: '0.5rem' }}>{job.type}</span></td>
                <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>{job.company}</td>
                <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>{job.location}</td>
                <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>{job.timestamp ? new Date(job.timestamp.seconds * 1000).toLocaleDateString() : ''}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <button onClick={() => handleDelete(job.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
