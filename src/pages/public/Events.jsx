import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Image as ImageIcon, Video, Calendar } from 'lucide-react';

export default function Events() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setPosts(data);
    });
    return () => unsub();
  }, []);

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 2rem 0' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Community Media & Events</h2>
          <p style={{ color: 'var(--text-muted)' }}>Latest videos and pictures from our charity programs.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {posts.map(post => (
          <div key={post.id} className="glass-card" style={{ overflow: 'hidden' }}>
            {post.type === 'video' ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
                <iframe 
                  src={post.mediaUrl && post.mediaUrl.includes('youtube.com/watch?v=') ? post.mediaUrl.replace('youtube.com/watch?v=', 'youtube.com/embed/').split('&')[0] : post.mediaUrl && post.mediaUrl.includes('youtu.be/') ? post.mediaUrl.replace('youtu.be/', 'youtube.com/embed/').split('?')[0] : (post.mediaUrl || '')} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} 
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <img src={post.mediaUrl || ''} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            )}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {post.type === 'video' ? <Video size={14} /> : <ImageIcon size={14} />} {post.type.toUpperCase()}
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>{post.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{post.description}</p>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>No media posts yet.</p>
        )}
      </div>
    </div>
  );
}
