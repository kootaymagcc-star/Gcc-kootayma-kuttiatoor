import React, { useState, useEffect } from 'react';
import { Search, Heart, Share2, Plus, X } from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../firebase';

export default function Campaigns() {
  const [filter, setFilter] = useState('All');
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

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
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredCampaigns.map((camp, i) => {
          const percent = Math.min(Math.round((camp.raised / (camp.goal || 1)) * 100) || 0, 100);
          
          return (
            <div 
              key={camp.id} 
              className={`stagger-${(i % 3) + 1}`} 
              onClick={() => setSelectedCampaign(camp)}
              style={{ 
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '12px',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.85) 100%)',
                borderRadius: '20px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 4px 15px -5px rgba(0, 0, 0, 0.05)',
                backdropFilter: 'blur(10px)',
                gap: '16px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px -5px rgba(0, 0, 0, 0.05)';
              }}
            >
              {/* Thumbnail Image (Small Size) */}
              <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '14px',
                overflow: 'hidden',
                flexShrink: 0,
                position: 'relative'
              }}>
                {camp.image ? (
                  <img 
                    src={camp.image} 
                    alt={camp.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #3b82f6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={32} color="rgba(255,255,255,0.3)" />
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 4, left: 4, background: camp.status === 'Completed' ? '#10b981' : '#f59e0b', color: 'white', padding: '2px 6px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 800 }}>
                  {camp.status}
                </div>
              </div>

              {/* Compact Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {camp.title}
                  </h3>
                  <button onClick={(e) => { e.stopPropagation(); handleShare(camp); }} style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: 0, cursor: 'pointer' }}>
                    <Share2 size={16} />
                  </button>
                </div>
                
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 10px 0', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {camp.description}
                </p>
                
                {/* Thin Progress Bar */}
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>
                    <span style={{ color: camp.status === 'Completed' ? '#10b981' : 'var(--primary)' }}>{percent}% Funded</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: camp.status === 'Completed' ? '#10b981' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)', borderRadius: '99px' }}></div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {camp.status !== 'Completed' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedCampaign(camp); }}
                  style={{ 
                    padding: '8px 16px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--primary)',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                >
                  Donate
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Campaign Details Modal (Mobile Bottom-Sheet Style) */}
      {selectedCampaign && (
        <div 
          className="animate-fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center', // Center on desktop
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            padding: '20px'
          }}
          onClick={() => setSelectedCampaign(null)}
        >
          <div 
            className="animate-slide-up"
            style={{
              background: 'white',
              width: '100%',
              maxWidth: '500px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
              marginTop: window.innerWidth <= 768 ? 'auto' : 0, // Align to bottom on mobile
              marginBottom: window.innerWidth <= 768 ? '-20px' : 0,
              borderBottomLeftRadius: window.innerWidth <= 768 ? 0 : '24px',
              borderBottomRightRadius: window.innerWidth <= 768 ? 0 : '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Image */}
            <div style={{ width: '100%', height: '250px', position: 'relative', background: '#1e293b' }}>
              {selectedCampaign.image ? (
                <img src={selectedCampaign.image} alt={selectedCampaign.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #3b82f6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart size={64} color="rgba(255,255,255,0.3)" />
                </div>
              )}
              
              <button 
                onClick={() => setSelectedCampaign(null)} 
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.9)', color: '#0f172a', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
              >
                <X size={20} />
              </button>
              
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(255,255,255,0.95)', color: 'var(--primary-dark)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                {selectedCampaign.category}
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: '1.3' }}>{selectedCampaign.title}</h2>
                <button onClick={() => handleShare(selectedCampaign)} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <Share2 size={18} />
                </button>
              </div>

              {/* Progress */}
              {(() => {
                const percent = Math.min(Math.round((selectedCampaign.raised / (selectedCampaign.goal || 1)) * 100) || 0, 100);
                return (
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>
                      <span style={{ color: selectedCampaign.status === 'Completed' ? '#10b981' : 'var(--primary)' }}>{percent}% Funded</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: selectedCampaign.status === 'Completed' ? '#10b981' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)', borderRadius: '99px' }}></div>
                    </div>
                  </div>
                );
              })()}

              <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>About this Campaign</h4>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                {selectedCampaign.description}
              </p>
            </div>

            {/* Modal Footer (Donate Button) */}
            <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', background: 'white' }}>
              {selectedCampaign.status !== 'Completed' ? (
                <button 
                  onClick={() => {
                    alert("This is a dummy payment gateway. In a real app, this would open Razorpay or Stripe.");
                    setSelectedCampaign(null);
                  }}
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    background: 'var(--primary)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '16px', 
                    fontWeight: 800, 
                    fontSize: '1.1rem', 
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Contribute Now
                </button>
              ) : (
                <div style={{ width: '100%', padding: '16px', background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem', textAlign: 'center' }}>
                  Campaign Completed Successfully! 🎉
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
