import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { MessageCircle, Search, Plus, X, User, Phone, Tag } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All', color: '#94a3b8' },
  { id: 'question', label: 'Question', color: '#3b82f6' },
  { id: 'housing', label: 'Housing/Room', color: '#10b981' },
  { id: 'selling', label: 'Selling/Buying', color: '#f59e0b' },
  { id: 'services', label: 'Services', color: '#8b5cf6' },
  { id: 'other', label: 'Other', color: '#64748b' }
];

export default function Classifieds() {
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    category: 'question',
    message: '',
    contactName: '',
    contactNumber: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'classifieds'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setPosts(data);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim() || !formData.contactName.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'classifieds'), {
        ...formData,
        timestamp: serverTimestamp()
      });
      setShowModal(false);
      setFormData({ category: 'question', message: '', contactName: '', contactNumber: '' });
    } catch (err) {
      console.error(err);
      alert('Error posting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesCat = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = post.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCategoryColor = (catId) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? cat.color : '#64748b';
  };
  const getCategoryLabel = (catId) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? cat.label : 'Other';
  };

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '6rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', marginBottom: '1rem', boxShadow: '0 0 20px rgba(59,130,246,0.15)' }}>
          <MessageCircle size={40} />
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, marginBottom: '1rem', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Community Help
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Ask a question, offer a service, or find what you need. Our community is here to help each other out!
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Controls */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Search */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search posts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem' }}
            />
          </div>

          <button 
            onClick={() => setShowModal(true)}
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
              color: 'white', 
              border: 'none', 
              padding: '1rem 1.5rem', 
              borderRadius: '12px', 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={20} /> Create Post
          </button>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                background: activeCategory === cat.id ? cat.color : 'rgba(30, 41, 59, 0.5)',
                color: activeCategory === cat.id ? 'white' : '#cbd5e1',
                border: `1px solid ${activeCategory === cat.id ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                padding: '0.5rem 1rem',
                borderRadius: '99px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredPosts.map(post => (
            <div key={post.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ 
                  background: `${getCategoryColor(post.category)}20`, 
                  color: getCategoryColor(post.category), 
                  padding: '4px 10px', 
                  borderRadius: '6px', 
                  fontSize: '0.75rem', 
                  fontWeight: 800, 
                  textTransform: 'uppercase',
                  border: `1px solid ${getCategoryColor(post.category)}40`
                }}>
                  {getCategoryLabel(post.category)}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {post.timestamp ? new Date(post.timestamp.toDate()).toLocaleDateString() : 'Just now'}
                </span>
              </div>

              <p style={{ color: 'white', fontSize: '1.05rem', lineHeight: 1.6, flex: 1, whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
                {post.message}
              </p>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                  <div style={{ background: '#1e293b', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={16} />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0' }}>{post.contactName}</span>
                </div>
                
                {post.contactNumber && (
                  <a 
                    href={`https://wa.me/${post.contactNumber.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                  >
                    <MessageCircle size={16} /> Reply
                  </a>
                )}
              </div>
            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <MessageCircle size={48} color="#475569" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No posts found</h3>
              <p style={{ color: '#94a3b8', margin: 0 }}>Be the first to post something in this category!</p>
            </div>
          )}
        </div>
      </div>

      {/* Post Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="animate-fade-in" style={{ background: '#0f172a', width: '100%', maxWidth: '500px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Create Post</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Category</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({...formData, category: cat.id})}
                      style={{
                        background: formData.category === cat.id ? `${cat.color}20` : 'transparent',
                        color: formData.category === cat.id ? cat.color : '#94a3b8',
                        border: `1px solid ${formData.category === cat.id ? cat.color : 'rgba(255,255,255,0.2)'}`,
                        padding: '6px 12px',
                        borderRadius: '99px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Your Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input required type="text" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} placeholder="e.g. John Doe" style={{ width: '100%', padding: '1rem 1rem 1rem 2.5rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.5rem' }}>WhatsApp Number (Optional, for replies)</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} placeholder="e.g. +971501234567" style={{ width: '100%', padding: '1rem 1rem 1rem 2.5rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Message</label>
                <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="What do you need help with?" rows={4} style={{ width: '100%', padding: '1rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', resize: 'vertical' }}></textarea>
              </div>

              <button type="submit" disabled={isSubmitting} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? 'Posting...' : 'Post to Community'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
