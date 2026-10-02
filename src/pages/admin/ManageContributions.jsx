import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Wallet, Plus } from 'lucide-react';

export default function ManageContributions() {
  const [members, setMembers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [formData, setFormData] = useState({ memberId: '', campaignId: '', amount: '', status: 'Completed', note: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  useEffect(() => {
    const unsubMembers = onSnapshot(query(collection(db, 'members')), (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubCampaigns = onSnapshot(query(collection(db, 'campaigns')), (snapshot) => {
      setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubContributions = onSnapshot(query(collection(db, 'contributions'), orderBy('timestamp', 'desc')), (snapshot) => {
      setContributions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubMembers(); unsubCampaigns(); unsubContributions(); };
  }, []);

  const handleDeleteContribution = async (contrib) => {
    if (window.confirm("Are you sure you want to delete this contribution?")) {
      try {
        await deleteDoc(doc(db, 'contributions', contrib.id));
        await updateDoc(doc(db, 'members', contrib.memberId), {
          totalContributions: increment(-contrib.amount)
        });
        await updateDoc(doc(db, 'campaigns', contrib.campaignId), {
          raised: increment(-contrib.amount)
        });
      } catch (err) {
        console.error(err);
        alert("Error deleting contribution");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.memberId || !formData.campaignId || !formData.amount) return;
    
    setIsSubmitting(true);
    try {
      const amount = Number(formData.amount);
      const campaign = campaigns.find(c => c.id === formData.campaignId);
      
      // 1. Record the contribution
      await addDoc(collection(db, 'contributions'), {
        memberId: formData.memberId,
        campaignId: formData.campaignId,
        campaignCategory: campaign.category,
        amount: amount,
        status: formData.status,
        note: formData.note,
        timestamp: serverTimestamp()
      });

      // 2. Update Member's total contribution
      await updateDoc(doc(db, 'members', formData.memberId), {
        totalContributions: increment(amount)
      });

      // 3. Update Campaign's raised amount
      await updateDoc(doc(db, 'campaigns', formData.campaignId), {
        raised: increment(amount)
      });

      alert("Contribution logged successfully!");
      setFormData({ memberId: '', campaignId: '', amount: '', status: 'Completed', note: '' });
      setMemberSearch('');
    } catch (err) {
      console.error(err);
      alert("Error logging contribution.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Log Member Contribution</h1>
      
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '2rem', maxWidth: '800px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Wallet size={20} color="var(--primary)" /> Record Donation
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Select Member</label>
            {members.length === 0 ? (
              <div style={{ padding: '0.875rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', fontSize: '0.875rem' }}>No members found. Please approve a member registration first.</div>
            ) : (
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Type member name or email to search..." 
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setShowMemberDropdown(true);
                    if (formData.memberId) setFormData({...formData, memberId: ''});
                  }}
                  onFocus={() => setShowMemberDropdown(true)}
                  onBlur={() => setTimeout(() => setShowMemberDropdown(false), 200)}
                  required={!formData.memberId}
                  style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white', boxSizing: 'border-box' }}
                />
                {showMemberDropdown && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', marginTop: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                    {members.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.email.toLowerCase().includes(memberSearch.toLowerCase())).map(m => (
                      <div 
                        key={m.id} 
                        style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid #1e293b' }}
                        onMouseDown={() => {
                          setFormData({...formData, memberId: m.id});
                          setMemberSearch(`${m.name} (${m.email})`);
                          setShowMemberDropdown(false);
                        }}
                      >
                        {m.name} ({m.email})
                      </div>
                    ))}
                    {members.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.email.toLowerCase().includes(memberSearch.toLowerCase())).length === 0 && (
                      <div style={{ padding: '0.75rem', color: '#94a3b8' }}>No members found</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Select Charity Campaign</label>
            {campaigns.length === 0 ? (
              <div style={{ padding: '0.875rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', fontSize: '0.875rem' }}>No campaigns found. Please create a Charity Campaign first.</div>
            ) : (
              <select name="campaignId" value={formData.campaignId} onChange={(e) => setFormData({...formData, campaignId: e.target.value})} required style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}>
                <option value="">-- Choose Campaign --</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.title} ({c.category})</option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Donation Amount (₹)</label>
            <input type="number" name="amount" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }} placeholder="e.g., 5000" min="1" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Status</label>
            <select name="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} required style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}>
              <option value="Completed">Completed</option>
              <option value="Fund Pending">Fund Pending</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Note</label>
            <textarea name="note" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white', minHeight: '80px' }} placeholder="e.g. I gave money to this person..."></textarea>
          </div>

          <button type="submit" disabled={isSubmitting} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            {isSubmitting ? 'Saving...' : <><Plus size={18} /> Record Contribution</>}
          </button>
        </form>
      </div>

      {/* Existing Contributions Section */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '2rem', maxWidth: '800px', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Contributions ({contributions.length})</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {contributions.map(contrib => {
            const memberName = members.find(m => m.id === contrib.memberId)?.name || 'Unknown Member';
            const campaignName = campaigns.find(c => c.id === contrib.campaignId)?.title || 'Unknown Campaign';
            return (
              <div key={contrib.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{memberName} donated {contrib.amount} ₹</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>To: {campaignName} • Status: <span style={{ color: contrib.status === 'Fund Pending' ? '#f59e0b' : '#10b981' }}>{contrib.status || 'Completed'}</span></div>
                  {contrib.note && <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px', fontStyle: 'italic' }}>Note: {contrib.note}</div>}
                </div>
                <button onClick={() => handleDeleteContribution(contrib)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
              </div>
            );
          })}
          {contributions.length === 0 && <p style={{ color: '#94a3b8' }}>No contributions recorded yet.</p>}
        </div>
      </div>
    </div>
  );
}
