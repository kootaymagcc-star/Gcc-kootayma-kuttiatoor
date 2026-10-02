import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Trash2, MessageCircle } from 'lucide-react';

export default function ManageClassifieds() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'classifieds'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setPosts(data);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deleteDoc(doc(db, 'classifieds', id));
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <MessageCircle size={32} color="var(--primary)" /> Manage Classifieds
      </h1>

      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '2rem', maxWidth: '1000px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {posts.map(post => (
            <div key={post.id} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1.5rem', position: 'relative' }}>
              <button 
                onClick={() => handleDelete(post.id)} 
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
              >
                <Trash2 size={18} />
              </button>
              
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                  {post.category}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>
                  {post.timestamp ? new Date(post.timestamp.toDate()).toLocaleDateString() : ''}
                </span>
              </div>
              
              <p style={{ margin: '0 0 1rem 0', color: '#f8fafc', whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: 1.5 }}>
                {post.message}
              </p>
              
              <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                <strong>Name:</strong> {post.contactName}<br/>
                <strong>Number:</strong> {post.contactNumber || 'N/A'}
              </div>
            </div>
          ))}
          {posts.length === 0 && <p style={{ color: '#94a3b8' }}>No classifieds posted yet.</p>}
        </div>
      </div>
    </div>
  );
}
