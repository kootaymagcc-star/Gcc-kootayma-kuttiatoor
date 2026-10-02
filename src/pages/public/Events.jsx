import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';
import { Heart, Share2, MoreHorizontal, X, Search as SearchIcon } from 'lucide-react';

export default function Events() {
  const [posts, setPosts] = useState([]);
  const [deviceId, setDeviceId] = useState(() => {
    let id = localStorage.getItem('gcc_device_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('gcc_device_id', id);
    }
    return id;
  });

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setPosts(data);
    });
    return () => unsub();
  }, []);

  const handleLike = async (post) => {
    const existingLike = (post.likes || []).find(l => l.deviceId === deviceId);
    const postRef = doc(db, 'posts', post.id);
    
    try {
      if (existingLike) {
        await updateDoc(postRef, { likes: arrayRemove(existingLike) });
      } else {
        await updateDoc(postRef, { 
          likes: arrayUnion({ deviceId, date: new Date().toISOString() })
        });
      }
    } catch(err) { console.error(err); }
  };
  const handleShare = async (post) => {
    const shareData = { title: post.title, text: post.description, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Post link copied!');
      }
    } catch (err) {}
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div style={{ width: '100%', maxWidth: '600px', marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800 }}>Community Feed</h2>
        <p style={{ color: 'var(--text-muted)' }}>Latest updates, videos, and moments from Kuttiatoor Kootayma.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '500px' }}>
        {posts.map(post => {
          const likes = post.likes || [];
          const isLiked = likes.some(l => l.deviceId === deviceId);
          
          return (
            <div key={post.id} style={{ 
              background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.85) 100%)', 
              border: '1px solid rgba(226, 232, 240, 0.8)', 
              borderRadius: '16px', 
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              backdropFilter: 'blur(10px)'
            }}>
              {/* Post Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'white', border: '2px solid white', overflow: 'hidden' }}>
                      <img src="https://ui-avatars.com/api/?name=Kuttiatoor+Kootayma&background=0f172a&color=fff" alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Kuttiatoor Kootayma</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Community Official</div>
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a' }}><MoreHorizontal size={20} /></button>
              </div>

              {/* Media Content */}
              <div style={{ width: '100%', background: '#000', position: 'relative' }}>
                {post.type === 'video' ? (
                  <div style={{ position: 'relative', paddingBottom: '100%', height: 0 }}>
                    <iframe 
                      src={post.mediaUrl && post.mediaUrl.includes('youtube.com/watch?v=') ? post.mediaUrl.replace('youtube.com/watch?v=', 'youtube.com/embed/').split('&')[0] : post.mediaUrl && post.mediaUrl.includes('youtu.be/') ? post.mediaUrl.replace('youtu.be/', 'youtube.com/embed/').split('?')[0] : (post.mediaUrl || '')} 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} 
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <img src={post.mediaUrl || ''} alt={post.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} onDoubleClick={() => handleLike(post)} />
                )}
              </div>

              {/* Action Bar */}
              <div style={{ padding: '12px 16px 8px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={() => handleLike(post)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: isLiked ? '#ef4444' : '#0f172a', transition: 'transform 0.2s', transform: isLiked ? 'scale(1.1)' : 'scale(1)' }}>
                      <Heart size={26} fill={isLiked ? '#ef4444' : 'none'} strokeWidth={isLiked ? 0 : 2} />
                    </button>
                    <button onClick={() => handleShare(post)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#0f172a' }}>
                      <Share2 size={26} strokeWidth={2} />
                    </button>
                  </div>
                </div>
                
                {/* Likes Count */}
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  {likes.length > 0 ? (
                    isLiked ? (likes.length === 1 ? `Liked by you` : `You and ${likes.length - 1} others`) : `${likes.length} ${likes.length === 1 ? 'like' : 'likes'}`
                  ) : 'Be the first to like this'}
                </div>

                {/* Caption */}
                <div style={{ fontSize: '0.9rem', color: '#0f172a', lineHeight: '1.4' }}>
                  <span style={{ fontWeight: 700, marginRight: '6px' }}>Kuttiatoor Kootayma</span>
                  <span style={{ fontWeight: 600 }}>{post.title}</span> {post.description}
                </div>
                
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '8px', textTransform: 'uppercase' }}>
                  {post.timestamp ? post.timestamp.toDate().toLocaleDateString() : 'Just now'}
                </div>
              </div>
            </div>
          )
        })}
        {posts.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No media posts yet.</p>
        )}
      </div>
    </div>
  );
}
