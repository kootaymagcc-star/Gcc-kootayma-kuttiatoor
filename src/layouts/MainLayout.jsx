import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Search, Bell, UserPlus, Info, Calendar as CalendarIcon, Image as ImageIcon, LayoutDashboard, Users, Briefcase, Share2, MessageCircle } from 'lucide-react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import RegisterModal from '../components/RegisterModal';
import SearchModal from '../components/SearchModal';

export default function MainLayout() {
  const location = useLocation();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/campaigns', label: 'Campaigns', icon: <Heart size={20} /> },
    { path: '/events', label: 'Media', icon: <ImageIcon size={20} /> },
    { path: '/calendar', label: 'Calendar', icon: <CalendarIcon size={20} /> },
    { path: '/jobs', label: 'Job Board', icon: <Briefcase size={20} /> },
    { path: '/classifieds', label: 'Ask & Help', icon: <MessageCircle size={20} /> },
  ];

  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const notifRef = useRef(null);
  
  const [camps, setCamps] = useState([]);
  const [posts, setPosts] = useState([]);
  const [evs, setEvs] = useState([]);

  useEffect(() => {
    const unsubC = onSnapshot(query(collection(db, 'campaigns'), orderBy('timestamp', 'desc'), limit(5)), snap => setCamps(snap.docs.map(d => ({ ...d.data(), id: d.id, _type: 'campaign' }))));
    const unsubP = onSnapshot(query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(5)), snap => setPosts(snap.docs.map(d => ({ ...d.data(), id: d.id, _type: 'post' }))));
    const unsubE = onSnapshot(query(collection(db, 'calendarEvents'), orderBy('timestamp', 'desc'), limit(5)), snap => setEvs(snap.docs.map(d => ({ ...d.data(), id: d.id, _type: 'event' }))));
    
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => { unsubC(); unsubP(); unsubE(); document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  const notifications = [...camps, ...posts, ...evs]
    .filter(n => n.timestamp)
    .sort((a,b) => b.timestamp.seconds - a.timestamp.seconds)
    .slice(0, 5);

  return (
    <div className="app-container">
      <nav className="nav-bar glass-panel animate-fade-in">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Heart size={24} />
          </div>
          <h1 style={{ fontSize: '1.25rem', margin: 0 }}><span className="text-gradient">Kuttiatoor</span> Kootayma</h1>
        </Link>
        
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => setIsSearchOpen(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Search size={20} /></button>
          
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button onClick={() => setShowNotifs(!showNotifs)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', position: 'relative' }}>
              <Bell size={20} />
              {notifications.length > 0 && <span style={{ position: 'absolute', top: -2, right: -2, background: 'var(--accent)', width: 8, height: 8, borderRadius: '50%' }}></span>}
            </button>

            {showNotifs && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '300px', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>Latest Updates</h3>
                {notifications.length > 0 ? notifications.map(notif => {
                  let icon = <Info size={16} color="var(--primary)" />;
                  let text = '';
                  let link = '/';
                  if (notif._type === 'campaign') { icon = <Heart size={16} color="#ef4444" />; text = `New Campaign: ${notif.title}`; link = '/campaigns'; }
                  if (notif._type === 'post') { icon = <ImageIcon size={16} color="#3b82f6" />; text = `New Post: ${notif.title}`; link = '/events'; }
                  if (notif._type === 'event') { icon = <CalendarIcon size={16} color="#10b981" />; text = `New Event: ${notif.title}`; link = '/calendar'; }
                  
                  return (
                    <div key={notif.id} onClick={() => { setShowNotifs(false); navigate(link); }} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px', transition: 'background 0.2s', ':hover': { background: '#334155' } }}>
                      <div style={{ marginTop: '2px' }}>{icon}</div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'white' }}>{text}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {new Date(notif.timestamp.seconds * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div style={{ fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center' }}>No recent updates.</div>
                )}
              </div>
            )}
          </div>

          <button onClick={() => setIsRegisterOpen(true)} className="btn btn-primary mobile-icon-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            <UserPlus size={16} /> <span className="hide-on-mobile">Register</span>
          </button>
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textDecoration: 'none', color: 'var(--text-main)', marginLeft: '1rem' }}>
            <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="Admin" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            <span className="hide-on-mobile" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Admin Portal</span>
          </Link>
        </div>
      </nav>

      {/* Renders the child routes */}
      <div className="animate-fade-in stagger-1">
        <Outlet />
      </div>

      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Small Glassmorphic iOS Style Nav */}
      <div className="mobile-nav-bar" style={{ 
        position: 'fixed',
        bottom: '1rem',
        left: '2rem',
        right: '2rem',
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '6px', 
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '99px',
        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.1)',
        zIndex: 1000
      }}>
        {navLinks.filter(link => link.path !== '/jobs' && link.path !== '/classifieds').map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{ 
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 2px',
                minWidth: '50px',
                textDecoration: 'none',
                color: isActive ? '#0ea5e9' : '#64748b',
                flex: 1,
                borderRadius: '99px',
                background: isActive ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                transition: 'background 0.2s ease, color 0.2s ease'
              }}
            >
              {/* Optional Notification Badge */}
              {link.label === 'Campaigns' && (
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  right: '15%',
                  background: '#ef4444', 
                  color: 'white',
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: '10px',
                  zIndex: 2
                }}>
                  3
                </div>
              )}
              
              <div style={{ marginBottom: '2px' }}>
                {React.cloneElement(link.icon, { 
                  size: 20, 
                  color: isActive ? '#0ea5e9' : '#64748b',
                  fill: isActive ? '#0ea5e9' : 'none',
                  strokeWidth: isActive ? 0 : 2
                })}
              </div>
              
              <span style={{ 
                fontSize: '9px', 
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.2px'
              }}>
                {link.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  );
}
