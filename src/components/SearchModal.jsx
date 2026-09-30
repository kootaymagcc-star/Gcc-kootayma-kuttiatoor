import React, { useState, useEffect } from 'react';
import { Search, X, Heart, Image as ImageIcon, Calendar as CalendarIcon } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const searchData = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      const q = query.toLowerCase();
      
      try {
        const [campsSnap, postsSnap, evsSnap] = await Promise.all([
          getDocs(collection(db, 'campaigns')),
          getDocs(collection(db, 'posts')),
          getDocs(collection(db, 'calendarEvents'))
        ]);
        
        let arr = [];
        
        campsSnap.forEach(d => {
          const data = d.data();
          if (data.title?.toLowerCase().includes(q) || data.description?.toLowerCase().includes(q) || data.category?.toLowerCase().includes(q)) {
            arr.push({ id: d.id, ...data, _type: 'campaign' });
          }
        });
        
        postsSnap.forEach(d => {
          const data = d.data();
          if (data.title?.toLowerCase().includes(q) || data.description?.toLowerCase().includes(q)) {
            arr.push({ id: d.id, ...data, _type: 'post' });
          }
        });
        
        evsSnap.forEach(d => {
          const data = d.data();
          if (data.title?.toLowerCase().includes(q) || data.description?.toLowerCase().includes(q) || data.location?.toLowerCase().includes(q)) {
            arr.push({ id: d.id, ...data, _type: 'event' });
          }
        });

        setResults(arr);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      searchData();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', justifyContent: 'center', paddingTop: '10vh' }}>
      <div style={{ background: '#1e293b', width: '90%', maxWidth: '600px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', maxHeight: '70vh', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        
        <div style={{ padding: '1rem', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Search size={20} color="var(--text-muted)" />
          <input 
            autoFocus
            type="text" 
            placeholder="Search campaigns, events, and posts..." 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '1.125rem', outline: 'none' }} 
          />
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Searching...</div>
          ) : query.length > 0 && query.length < 2 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Type at least 2 characters to search.</div>
          ) : results.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {results.map(res => {
                let icon = null;
                let link = '/';
                let typeLabel = '';
                if (res._type === 'campaign') { icon = <Heart size={16} color="#ef4444" />; link = '/campaigns'; typeLabel = 'Campaign'; }
                if (res._type === 'post') { icon = <ImageIcon size={16} color="#3b82f6" />; link = '/events'; typeLabel = 'Media Post'; }
                if (res._type === 'event') { icon = <CalendarIcon size={16} color="#10b981" />; link = '/calendar'; typeLabel = 'Event'; }
                
                return (
                  <div 
                    key={res.id} 
                    onClick={() => { onClose(); navigate(link); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#0f172a', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <div style={{ background: '#1e293b', padding: '0.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      {icon}
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '4px' }}>{typeLabel}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'white' }}>{res.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginTop: '4px' }}>{res.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : query.length >= 2 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No results found for "{query}".</div>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>What are you looking for today?</div>
          )}
        </div>
      </div>
    </div>
  );
}
