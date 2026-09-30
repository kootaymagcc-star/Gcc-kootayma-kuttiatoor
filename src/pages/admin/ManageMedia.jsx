import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { PlusCircle, Image as ImageIcon, Video, UploadCloud } from 'lucide-react';

export default function ManageMedia() {
  const [formData, setFormData] = useState({ title: '', type: 'image', mediaUrl: '', description: '' });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setPosts(data);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, 'posts', id));
      } catch (err) {
        console.error(err);
        alert("Error deleting post");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalUrl = formData.mediaUrl;

      // Automatically convert standard Imgur links (https://imgur.com/XYZ) to direct image links (https://i.imgur.com/XYZ.jpeg)
      if (finalUrl && finalUrl.includes('imgur.com') && !finalUrl.includes('i.imgur.com') && formData.type === 'image') {
        const parts = finalUrl.split('/');
        const id = parts[parts.length - 1];
        if (id) {
          finalUrl = `https://i.imgur.com/${id}.jpeg`;
        }
      }

      if (file) {
        const storageRef = ref(storage, `media/${Date.now()}_${file.name}`);
        const uploadTask = await uploadBytes(storageRef, file);
        finalUrl = await getDownloadURL(uploadTask.ref);
      }

      await addDoc(collection(db, 'posts'), {
        title: formData.title,
        type: formData.type,
        description: formData.description,
        mediaUrl: finalUrl,
        timestamp: serverTimestamp()
      });
      alert("Post added successfully!");
      setFormData({ title: '', type: 'image', mediaUrl: '', description: '' });
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Error adding post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Manage Posts & Media</h1>
      
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '2rem', maxWidth: '800px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={20} color="var(--primary)" /> Add New Post
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Post Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }} placeholder="e.g., Annual Iftar Meetup" />
          </div>

          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Media Type</label>
              <select name="type" value={formData.type} onChange={handleChange} style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#0f172a', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #475569' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'white', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UploadCloud size={16} /> Upload Media Directly
              </label>
              <input type="file" accept={formData.type === 'video' ? 'video/*' : 'image/*'} onChange={handleFileChange} style={{ color: '#cbd5e1' }} />
              {file && <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)' }}>Selected: {file.name}</span>}
            </div>

            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>— OR —</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>External Link (Optional if uploading)</label>
              <input type="url" name="mediaUrl" value={formData.mediaUrl} onChange={handleChange} style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white' }} placeholder="https://..." />
            </div>

            {(file || formData.mediaUrl) && (
              <div style={{ marginTop: '1rem' }}>
                <label style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Media Preview</label>
                {formData.type === 'image' ? (
                  <img 
                    src={file ? URL.createObjectURL(file) : (formData.mediaUrl.includes('imgur.com') && !formData.mediaUrl.includes('i.imgur.com') ? `https://i.imgur.com/${formData.mediaUrl.split('/').pop()}.jpeg` : formData.mediaUrl)} 
                    alt="Preview" 
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #334155', background: '#000' }} 
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '200px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                     <Video size={32} style={{ marginRight: '8px' }}/> Video Preview Not Available Inline
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white', resize: 'vertical' }} placeholder="Write a description for the post..." />
          </div>

          <button type="submit" disabled={isSubmitting} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            {isSubmitting ? 'Publishing...' : <><PlusCircle size={18} /> Publish Post</>}
          </button>
        </form>
      </div>

      {/* Existing Posts Section */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '2rem', maxWidth: '800px', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Existing Posts ({posts.length})</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map(post => (
            <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {post.type === 'image' ? (
                   <img src={post.mediaUrl} alt={post.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                ) : (
                   <div style={{ width: '60px', height: '60px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}><Video size={24} color="#64748b" /></div>
                )}
                <div>
                  <div style={{ fontWeight: 600, color: 'white' }}>{post.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{post.type.toUpperCase()}</div>
                </div>
              </div>
              <button onClick={() => handleDelete(post.id)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
            </div>
          ))}
          {posts.length === 0 && <p style={{ color: '#94a3b8' }}>No posts available.</p>}
        </div>
      </div>
    </div>
  );
}
