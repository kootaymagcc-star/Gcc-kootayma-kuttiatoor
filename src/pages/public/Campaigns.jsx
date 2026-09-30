import React, { useState, useEffect } from 'react';
import { Search, Heart, Share2, Plus } from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../firebase';

export default function Campaigns() {
  const [filter, setFilter] = useState('All');
  const [allCampaigns, setAllCampaigns] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'campaigns'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setAllCampaigns(data);
    });
    return () => unsub();
  }, []);

  const filteredCampaigns = filter === 'All' 
    ? allCampaigns 
    : allCampaigns.filter(c => c.category === filter);

  const handleShare = async (camp) => {
    const shareData = {
      title: camp.title,
      text: `Check out this campaign: ${camp.title}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Website link copied to clipboard!');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 2rem 0' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Charity Campaigns</h2>
          <p style={{ color: 'var(--text-muted)' }}>Explore and contribute to our ongoing community initiatives.</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem' }}>
          <Plus size={18} /> Propose Campaign
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {['All', ...Array.from(new Set(allCampaigns.map(c => c.category)))].map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '99px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              backgroundColor: filter === cat ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
              color: filter === cat ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      
      <div className="campaign-grid">
        {filteredCampaigns.map((camp, i) => {
          const percent = Math.round((camp.raised / camp.goal) * 100);
          return (
            <div key={camp.id} className={`glass-card campaign-card stagger-${(i % 3) + 1}`} style={{ animation: 'fadeIn 0.5s ease forwards' }}>
              <div style={{ position: 'relative' }}>
                <img src={camp.image} alt={camp.title} className="campaign-image" style={{ height: '200px' }} />
                <div style={{ position: 'absolute', top: 10, right: 10, background: camp.status === 'Completed' ? '#10b981' : '#f59e0b', color: 'white', padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {camp.status}
                </div>
              </div>
              <div className="campaign-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{camp.category}</div>
                  <button onClick={() => handleShare(camp)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Share2 size={16} />
                  </button>
                </div>
                <h3>{camp.title}</h3>
                <p>{camp.description}</p>
                
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px' }}>
                    <span>{percent}% Funded</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${percent}%`, background: camp.status === 'Completed' ? '#10b981' : 'linear-gradient(90deg, var(--primary), var(--primary-light))' }}></div>
                  </div>
                  <div className="progress-stats">
                    <span>₹ {camp.raised.toLocaleString()}</span>
                    <span>₹ {camp.goal.toLocaleString()}</span>
                  </div>
                  
                  {camp.status !== 'Completed' && (
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem' }}>
                      <Heart size={16} /> Donate Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
