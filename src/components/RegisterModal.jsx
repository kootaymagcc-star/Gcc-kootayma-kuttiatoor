import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import './Modal.css';

export default function RegisterModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', profession: '', location: '', website: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'registrationRequests'), {
        ...formData,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', profession: '', location: '', website: '' });
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to send request. Please try again.");
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }} className="animate-fade-in">
            <CheckCircle size={64} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>Request Sent!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Your membership request has been sent to the admin. You will be notified once accepted.</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Join the Community</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Register to become a member and start contributing to our charity campaigns.</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="Enter your full name" required />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="you@example.com" required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="+971 50 123 4567" required />
                </div>
              </div>

              <div className="form-group">
                <label>Work / Profession</label>
                <input type="text" name="profession" value={formData.profession} onChange={handleChange} className="form-input" placeholder="e.g. Software Engineer" required />
              </div>

              <div className="form-group">
                <label>Current Location (Place)</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="form-input" placeholder="e.g. Dubai, UAE" required />
              </div>

              <div className="form-group">
                <label>Website / LinkedIn Profile (Optional)</label>
                <input type="url" name="website" value={formData.website} onChange={handleChange} className="form-input" placeholder="https://..." />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}>
                Submit Registration Request
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
