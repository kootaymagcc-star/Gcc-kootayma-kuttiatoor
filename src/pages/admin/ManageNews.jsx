import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Newspaper, Plus, Trash2, Edit2 } from 'lucide-react';

export default function ManageNews() {
  const [news, setNews] = useState([]);
  const [formData, setFormData] = useState({ text: '', isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setNews(data);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'news'), {
        ...formData,
        timestamp: serverTimestamp()
      });
      setFormData({ text: '', isActive: true });
      alert("News added successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding news");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this news item?")) {
      await deleteDoc(doc(db, 'news', id));
    }
  };

  const toggleActive = async (id, currentStatus) => {
    await updateDoc(doc(db, 'news', id), { isActive: !currentStatus });
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Manage Kuttiatoor News</h1>

      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '2rem', maxWidth: '800px', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Newspaper size={20} color="var(--primary)" /> Add News Report
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>News Report</label>
            <textarea required value={formData.text} onChange={(e) => setFormData({...formData, text: e.target.value})} rows={4} style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white', resize: 'vertical' }} placeholder="Enter news report in English or Malayalam..."></textarea>
          </div>

          <button type="submit" disabled={isSubmitting} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            {isSubmitting ? 'Publishing...' : <><Plus size={18} /> Publish News</>}
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '2rem', maxWidth: '800px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Published News</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {news.map(item => (
            <div key={item.id} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => toggleActive(item.id, item.isActive)} style={{ background: item.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)', border: `1px solid ${item.isActive ? '#10b981' : '#64748b'}`, color: item.isActive ? '#10b981' : '#cbd5e1', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                  {item.isActive ? 'Active' : 'Hidden'}
                </button>
                <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
              </div>
              <div style={{ paddingRight: '100px' }}>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc', whiteSpace: 'pre-wrap' }}>{item.text || item.english || item.malayalam}</p>
              </div>
            </div>
          ))}
          {news.length === 0 && <p style={{ color: '#94a3b8' }}>No news published yet.</p>}
        </div>
      </div>
    </div>
  );
}
