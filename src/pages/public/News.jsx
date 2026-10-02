import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Newspaper } from 'lucide-react';

export default function News() {
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    // Show all news on this page (or maybe just active? We'll show all for the archive)
    const q = query(collection(db, 'news'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setNewsList(data);
    });
    return () => unsub();
  }, []);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '16px', color: 'white' }}>
          <Newspaper size={32} />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>Community News</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Stay updated with the latest announcements and reports.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {newsList.map(news => (
          <div key={news.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: news.isActive ? 'var(--primary)' : '#cbd5e1' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                {news.timestamp ? new Date(news.timestamp.toDate()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
              </span>
              {news.isActive && (
                <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '99px' }}>
                  Active
                </span>
              )}
            </div>

            <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: 1.6, color: '#0f172a', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {news.text || news.english || news.malayalam}
            </p>
          </div>
        ))}
        {newsList.length === 0 && (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No news updates available.
          </div>
        )}
      </div>
    </div>
  );
}
