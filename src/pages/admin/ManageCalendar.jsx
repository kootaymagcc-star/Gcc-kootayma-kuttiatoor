import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';

export default function ManageCalendar() {
  const [formData, setFormData] = useState({ date: '', title: '', location: '', description: '' });
  const [events, setEvents] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'calendarEvents'), orderBy('date', 'asc')), (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'calendarEvents'), { ...formData, timestamp: serverTimestamp() });
      alert("Calendar event added successfully!");
      setFormData({ date: '', title: '', location: '', description: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this calendar event?")) await deleteDoc(doc(db, 'calendarEvents', id));
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Manage Calendar Events</h1>
      
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '2rem', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }} />
            </div>
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Event Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Location / Time</label>
            <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }} />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 600, border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Plus size={18} /> Add Event</button>
        </form>
      </div>

      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '2rem', maxWidth: '800px', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Existing Events</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.map(ev => (
            <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'white' }}>{ev.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{ev.date} | {ev.location}</div>
              </div>
              <button onClick={() => handleDelete(ev.id)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
            </div>
          ))}
          {events.length === 0 && <p style={{ color: '#94a3b8' }}>No calendar events scheduled yet.</p>}
        </div>
      </div>
    </div>
  );
}
