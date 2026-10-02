import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, Users, ShieldAlert, Calendar, ChevronRight, Briefcase, Quote, Star, Newspaper, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase';

const quotes = [
  "Charity does not decrease wealth.",
  "The best of people are those that bring most benefit to mankind.",
  "A kind word is a form of charity."
];

const campaigns = [
  {
    id: 1,
    title: 'Health Support Fund',
    description: 'Supporting medical treatments for low-income members in the community.',
    goal: 500000,
    raised: 360000,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    category: 'Health'
  },
  {
    id: 2,
    title: 'Masjid Construction',
    description: 'Ongoing project to build a community center and masjid in our hometown.',
    goal: 1800000,
    raised: 810000,
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80',
    category: 'Community'
  }
];


export default function Dashboard() {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [newsList, setNewsList] = useState(() => {
    try {
      const saved = localStorage.getItem('cachedDashboardNews');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [];
  });
  const [currentNewsIdx, setCurrentNewsIdx] = useState(0);

  const [stats, setStats] = useState({ members: 0, requests: 0 });

  useEffect(() => {
    let unsub1 = () => {};
    let unsub2 = () => {};
    try {
      unsub1 = onSnapshot(collection(db, 'members'), (snap) => {
        setStats(s => ({ ...s, members: snap.size }));
      }, (err) => console.warn("Members permission denied."));
      unsub2 = onSnapshot(collection(db, 'registrationRequests'), (snap) => {
        setStats(s => ({ ...s, requests: snap.size }));
      }, (err) => console.warn("Requests permission denied."));
    } catch(e) {}
    return () => { unsub1(); unsub2(); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => {
        const item = { id: doc.id, ...doc.data() };
        if (item.isActive === true) data.push(item);
      });
      setNewsList(data);
      try {
        localStorage.setItem('cachedDashboardNews', JSON.stringify(data));
      } catch(e) {}
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (newsList.length === 0) return;
    const interval = setInterval(() => {
      setCurrentNewsIdx((prev) => (prev + 1) % newsList.length);
    }, 8000); // 8 seconds per news item
    return () => clearInterval(interval);
  }, [newsList]);

  return (
    <div style={{ paddingBottom: '6rem' }}>




      {/* 
        NEW: BOX-LESS ANIMATED GRADIENT WAVE THEME
        Removes the 'box' entirely. Uses a flowing, organic background gradient that smoothly animates, giving a deeply immersive feel without borders.
      */}
      <section style={{
        position: 'relative',
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto 3rem auto',
        padding: '4rem 2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '30px',
        background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        backgroundSize: '400% 400%',
        animation: 'gradientWave 15s ease infinite',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      }}>
        
        {/* Organic floating shapes */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', animation: 'morph 8s ease-in-out infinite' }}></div>
        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '250px', height: '250px', background: 'rgba(255,255,255,0.05)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', animation: 'morph 10s ease-in-out infinite reverse' }}></div>

        <div style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}>
          
          <Quote size={48} color="rgba(255,255,255,0.9)" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
          
          <div style={{ minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <h2 key={quoteIdx} className="animate-fade-in" style={{
              margin: 0,
              fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
              fontWeight: 900,
              color: 'white',
              lineHeight: 1.4,
              fontFamily: '"Georgia", serif',
              fontStyle: 'italic',
              textShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}>
              "{quotes[quoteIdx]}"
            </h2>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            padding: '8px 20px',
            borderRadius: '99px',
            fontSize: '0.85rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}>
            Community Inspiration
          </div>

        </div>
      </section>

      {/* NEW MODERN NEWS SECTION - MOBILE FRIENDLY */}
      <section className="animate-fade-in stagger-1" style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto 2rem auto',
        padding: '0 1rem'
      }}>
          <div style={{
            background: 'linear-gradient(to right, #ffffff, #f8fafc)',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Soft decorative background glow */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)' }}></div>
            <div style={{ position: 'absolute', top: -100, right: -100, width: 250, height: 250, background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flexShrink: 0, background: 'linear-gradient(135deg, #ef4444, #f97316)', padding: '0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)' }}>
                <Newspaper size={22} color="white" />
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '50px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#ef4444', letterSpacing: '1px' }}>Latest News</span>
                  </div>
                  <Link to="/news" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '99px' }}>
                    View All <ChevronRight size={14} />
                  </Link>
                </div>
                
                <div key={currentNewsIdx} className="animate-fade-in" style={{ marginTop: '0.5rem' }}>
                  <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {newsList.length > 0 
                      ? (newsList[currentNewsIdx]?.text || newsList[currentNewsIdx]?.english || newsList[currentNewsIdx]?.malayalam)
                      : "Welcome to Kuttiatoor Kootayma! Stay tuned for updates."
                    }
                  </p>
                </div>
              </div>
            </div>
            
            {/* Dots indicator */}
            {newsList.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '0.5rem' }}>
                {newsList.map((_, idx) => (
                  <div key={idx} onClick={() => setCurrentNewsIdx(idx)} style={{ width: idx === currentNewsIdx ? 20 : 6, height: 6, borderRadius: '99px', background: idx === currentNewsIdx ? '#8b5cf6' : '#e2e8f0', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }}></div>
                ))}
              </div>
            )}
          </div>
        </section>

      {/* ORIGINAL DASHBOARD LAYOUT STAYS EXACTLY THE SAME BELOW THIS POINT */}
      <main className="dashboard-grid">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* BEAUTIFUL MESH GRADIENT JOB BOARD CARD */}
          <section className="animate-fade-in stagger-1" style={{ 
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            padding: 'clamp(1.25rem, 4vw, 2rem)',
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
            boxShadow: '0 20px 40px -15px rgba(14, 165, 233, 0.15)',
            border: '1px solid rgba(255,255,255,0.8)'
          }}>
            {/* Animated Mesh Gradient Blobs */}
            <div style={{ position: 'absolute', top: '-50px', right: '-20px', width: '200px', height: '200px', background: '#38bdf8', filter: 'blur(60px)', opacity: 0.25, animation: 'morph 8s infinite' }}></div>
            <div style={{ position: 'absolute', bottom: '-50px', left: '-20px', width: '200px', height: '200px', background: '#34d399', filter: 'blur(60px)', opacity: 0.25, animation: 'morph 10s infinite reverse' }}></div>
            
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
              
              <div style={{ flex: '1 1 250px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', color: '#0ea5e9', padding: '6px 14px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  <Briefcase size={14} /> Career Network
                </div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: 'clamp(1.3rem, 5vw, 1.8rem)', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                  Unlock Your <span style={{ color: '#0ea5e9' }}>Future</span>
                </h2>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.5, maxWidth: '400px' }}>
                  Discover premium opportunities or hire exceptional talent directly from our trusted community.
                </p>
              </div>

              <Link to="/jobs" style={{ 
                background: '#0f172a', 
                color: 'white', 
                textDecoration: 'none', 
                padding: '12px 24px', 
                borderRadius: '16px', 
                fontWeight: 800,
                fontSize: '0.95rem',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 10px 25px rgba(15, 23, 42, 0.25)',
                transition: 'transform 0.2s',
                flexShrink: 0
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Explore Jobs <ChevronRight size={18} />
              </Link>
            </div>
          </section>
          {/* Mobile Quick Stats */}
          <div className="hide-on-desktop animate-fade-in stagger-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'rgba(5, 150, 105, 0.05)' }}>
              <Users size={28} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{stats.members}</div>
              <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>Total Members</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'rgba(217, 119, 6, 0.05)' }}>
              <ShieldAlert size={28} color="var(--accent)" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{stats.requests}</div>
              <div style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>Pending Join</div>
            </div>
          </div>

          {/* CINEMATIC FULL-WIDTH CAMPAIGN BANNERS */}
          <section className="animate-fade-in stagger-2" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>Featured Campaigns</h3>
              <a href="/campaigns" style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', fontSize: '0.9rem', fontWeight: 700, background: 'rgba(59, 130, 246, 0.1)', padding: '8px 16px', borderRadius: '99px' }}>
                View All <ChevronRight size={18} />
              </a>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {campaigns.map((camp, i) => {
                const percent = Math.round((camp.raised / camp.goal) * 100);
                // Alternate layout direction for visual interest
                const isReversed = i % 2 !== 0;

                return (
                  <div key={camp.id} style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: '350px',
                    borderRadius: '32px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 30px 60px -15px rgba(0,0,0,0.2)',
                    background: '#000'
                  }}>
                    
                    {/* Massive Cinematic Background Image */}
                    <img 
                      src={camp.image} 
                      alt={camp.title} 
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.6,
                        transition: 'transform 0.5s ease',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />

                    {/* Dramatic Gradient Overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: isReversed 
                        ? 'linear-gradient(to left, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.6) 50%, rgba(15,23,42,0) 100%)'
                        : 'linear-gradient(to right, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.6) 50%, rgba(15,23,42,0) 100%)',
                    }}></div>

                    {/* Content Panel */}
                    <div style={{
                      position: 'relative',
                      zIndex: 2,
                      width: '100%',
                      padding: 'clamp(1.5rem, 5vw, 3rem)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isReversed ? 'flex-end' : 'flex-start'
                    }}>
                      
                      <div style={{
                        width: '100%',
                        maxWidth: '450px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                      }}>
                        <div style={{ display: 'inline-block', background: camp.category === 'Health' ? '#ef4444' : '#10b981', color: 'white', padding: '6px 14px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
                          {camp.category}
                        </div>
                        
                        <h3 style={{ margin: '0 0 12px 0', fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 900, lineHeight: 1.2 }}>
                          {camp.title}
                        </h3>
                        
                        <p style={{ margin: '0 0 20px 0', fontSize: 'clamp(0.85rem, 3vw, 0.95rem)', color: '#cbd5e1', lineHeight: 1.5 }}>
                          {camp.description}
                        </p>
                        
                        {/* Premium Progress Section */}
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: '16px', marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(0.85rem, 3vw, 1rem)', fontWeight: 800, marginBottom: '10px' }}>
                            <span style={{ color: '#38bdf8' }}>{percent}% Funded</span>
                          </div>
                          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${percent}%`, background: 'linear-gradient(90deg, #38bdf8, #818cf8)', borderRadius: '99px', boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)' }}></div>
                          </div>
                        </div>

                        <Link to="/campaigns" style={{
                          width: '100%',
                          padding: '1rem',
                          background: 'white',
                          color: '#0f172a',
                          border: 'none',
                          borderRadius: '16px',
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          textDecoration: 'none',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <Heart fill="#ef4444" color="#ef4444" /> Contribute Now
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

        </div>

        {/* Right Column (Sidebar) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Quick Stats Sidebar (Desktop Only) */}
          <div className="glass-panel hide-on-mobile animate-fade-in stagger-2" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(5, 150, 105, 0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--primary)' }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Members</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.members}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(217, 119, 6, 0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--accent)' }}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pending Approvals</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.requests}</div>
              </div>
            </div>
          </div>
          
          {/* 3D Animated Mini Calendar / Events */}
          <div className="animate-fade-in stagger-3" style={{ perspective: '1000px', height: '100%' }}>
            <div className="glass-panel" style={{ 
              padding: '1.5rem', 
              transformStyle: 'preserve-3d',
              animation: 'floatCalendar3D 6s ease-in-out infinite',
              boxShadow: '0 15px 35px -5px rgba(0,0,0,0.1), inset 0 2px 2px rgba(255,255,255,0.4)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
              border: '1px solid rgba(255,255,255,0.8)'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', transform: 'translateZ(20px)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <Calendar size={20} color="#3b82f6" /> Events
                </h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transformStyle: 'preserve-3d' }}>
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  padding: '1rem', 
                  background: 'white', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                  transform: 'translateZ(30px)' // Pops out from the card
                }}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                    color: 'white', 
                    padding: '0.5rem', 
                    borderRadius: '8px', 
                    minWidth: '60px',
                    boxShadow: '0 5px 15px rgba(59, 130, 246, 0.4)'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>OCT</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>24</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontWeight: 800 }}>Annual General Meeting</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Dubai, UAE • 10:00 AM</p>
                  </div>
                </div>
              </div>
              
              <div style={{ transform: 'translateZ(10px)', marginTop: '1rem' }}>
                <Link to="/calendar" className="btn" style={{ 
                  width: '100%', 
                  textDecoration: 'none', 
                  display: 'flex', 
                  justifyContent: 'center',
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#3b82f6',
                  fontWeight: 700,
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  View Full Calendar
                </Link>
              </div>
            </div>
          </div>

          {/* NEW COMMUNITY HELP / MARKET CARD */}
          <div className="animate-fade-in stagger-4">
            <div className="glass-panel" style={{ 
              padding: '1.5rem', 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: '#10b981', padding: '0.5rem', borderRadius: '12px', color: 'white', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                  <MessageCircle size={20} />
                </div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>Community Help & Market</h3>
              </div>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Buy, sell, or ask the community for help. A dedicated place for members to support each other.
              </p>
              <Link to="/classifieds" style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                background: '#10b981', color: 'white', textDecoration: 'none', 
                padding: '10px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem',
                transition: 'transform 0.2s', marginTop: '0.5rem'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Explore <ChevronRight size={16} />
              </Link>
            </div>
          </div>

        </div>
      </main>

      <style>{`
        @keyframes gradientWave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes morph {
          0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(0deg) scale(1); }
          50% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: rotate(180deg) scale(1.1); }
          100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(360deg) scale(1); }
        @keyframes floatCalendar3D {
          0% { transform: rotateY(-5deg) rotateX(5deg) translateY(0); }
          50% { transform: rotateY(5deg) rotateX(-5deg) translateY(-8px); }
          100% { transform: rotateY(-5deg) rotateX(5deg) translateY(0); }
        }
        @keyframes floatCampaign3D {
          0% { transform: rotateY(8deg) rotateX(-5deg) translateY(0); }
          50% { transform: rotateY(-8deg) rotateX(5deg) translateY(-10px); }
          100% { transform: rotateY(8deg) rotateX(-5deg) translateY(0); }
        }
      `}</style>
    </div>
  );
}
