import React from 'react';
import { Heart, TrendingUp, Users, ShieldAlert, Calendar, ChevronRight, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const recentContributions = [
  { id: 1, name: 'Ahmed Rashid', amount: 5000, campaign: 'Health Support', date: 'Oct 18, 2023', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'Sara Al-Mansoori', amount: 2500, campaign: 'Masjid Fund', date: 'Oct 17, 2023', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'Khalid Mehmood', amount: 10000, campaign: 'Education', date: 'Oct 16, 2023', avatar: 'https://i.pravatar.cc/150?u=3' }
];

export default function Dashboard() {
  return (
    <main className="dashboard-grid">
      {/* Left Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Jobs Options */}
        <section className="hero-stats animate-fade-in stagger-1" style={{ background: 'linear-gradient(135deg, #0284c7, #3b82f6)', boxShadow: '0 15px 30px -10px rgba(59, 130, 246, 0.4)' }}>
          <div className="hero-stats-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '12px' }}>
                <Briefcase size={28} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Job Board</h2>
            </div>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1.05rem', maxWidth: '400px', lineHeight: 1.5 }}>
              Find your next career opportunity or post a job opening within our exclusive community network.
            </p>
            <Link to="/jobs" className="btn" style={{ background: 'white', color: '#0284c7', fontWeight: 600, padding: '0.75rem 1.5rem', marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: 'none' }}>
              Explore Jobs <ChevronRight size={18} />
            </Link>
          </div>
        </section>

        {/* Mobile Quick Stats */}
        <div className="hide-on-desktop animate-fade-in stagger-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'rgba(5, 150, 105, 0.05)' }}>
            <Users size={28} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>1,248</div>
            <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>Total Members</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'rgba(217, 119, 6, 0.05)' }}>
            <ShieldAlert size={28} color="var(--accent)" style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>14</div>
            <div style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>Pending Join</div>
          </div>
        </div>

        {/* Active Campaigns */}
        <section className="animate-fade-in stagger-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Active Charity Campaigns</h3>
            <a href="/campaigns" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: 500 }}>
              View All <ChevronRight size={16} />
            </a>
          </div>
          
          <div className="campaign-grid">
            {campaigns.map(camp => {
              const percent = Math.round((camp.raised / camp.goal) * 100);
              return (
                <div key={camp.id} className="glass-card campaign-card">
                  <img src={camp.image} alt={camp.title} className="campaign-image" />
                  <div className="campaign-content">
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '4px' }}>{camp.category}</div>
                    <h3>{camp.title}</h3>
                    <p>{camp.description}</p>
                    
                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px' }}>
                        <span>{percent}% Funded</span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${percent}%` }}></div>
                      </div>
                      <div className="progress-stats">
                        <span>₹ {camp.raised.toLocaleString()}</span>
                        <span>₹ {camp.goal.toLocaleString()}</span>
                      </div>
                      
                      <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        <Heart size={16} /> Donate Now
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>


        {/* Recent Contributions List */}
        <section className="glass-panel animate-fade-in stagger-3" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Recent Member Contributions</h3>
          
          <div className="desktop-table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Member</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Amount</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Campaign</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentContributions.map(contrib => (
                  <tr key={contrib.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={contrib.avatar} alt={contrib.name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                      <span style={{ fontWeight: 500 }}>{contrib.name}</span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>₹ {contrib.amount.toLocaleString()}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{contrib.campaign}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{contrib.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mobile-cards">
            {recentContributions.map(contrib => (
              <div key={contrib.id} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={contrib.avatar} alt={contrib.name} style={{ width: 36, height: 36, borderRadius: '50%' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{contrib.name}</span>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>₹ {contrib.amount.toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>{contrib.campaign}</span>
                  <span>{contrib.date}</span>
                </div>
              </div>
            ))}
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
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>1,248</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(217, 119, 6, 0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--accent)' }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pending Approvals</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>14</div>
            </div>
          </div>
        </div>

        {/* Mini Calendar / Events */}
        <div className="glass-panel animate-fade-in stagger-3" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={20} /> Events</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '8px', minWidth: '60px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>OCT</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>24</span>
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0' }}>Annual General Meeting</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dubai, UAE • 10:00 AM</p>
              </div>
            </div>
          </div>
          
          <Link to="/calendar" className="btn btn-outline" style={{ width: '100%', marginTop: '1rem', textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
            View Full Calendar
          </Link>
        </div>
      </div>
    </main>
  );
}
