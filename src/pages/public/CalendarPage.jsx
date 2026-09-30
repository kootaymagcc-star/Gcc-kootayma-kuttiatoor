import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin } from 'lucide-react';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'calendarEvents'), orderBy('date', 'asc')), (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const selectedDateStr = selectedDate ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}` : null;
  const selectedEvents = selectedDate ? events.filter(e => e.date === selectedDateStr) : [];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Event Calendar</h2>
      <div className="calendar-layout">
        
        {/* Calendar Grid */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
               <CalendarIcon color="var(--primary)" /> 
               {currentDate.toLocaleString('default', { month: 'long' })} {year}
            </h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handlePrevMonth} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', color: 'white' }}><ChevronLeft /></button>
              <button onClick={handleNextMonth} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', color: 'white' }}><ChevronRight /></button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
            {days.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const hasEvents = dayEvents.length > 0;
              const isSelected = day === selectedDate;
              
              return (
                <div 
                  key={idx} 
                  onClick={() => day && setSelectedDate(day)}
                  style={{ 
                    aspectRatio: '1', 
                    background: day ? (isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.05)') : 'transparent',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: day ? 'pointer' : 'default',
                    position: 'relative',
                    border: isSelected ? '2px solid white' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  {day && <span style={{ fontSize: '1.25rem', fontWeight: 500 }}>{day}</span>}
                  {hasEvents && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                      {dayEvents.map((e, i) => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: isSelected ? 'white' : 'var(--accent)' }} />)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', margin: '0 0 1.5rem 0' }}>
            {selectedDate ? `${currentDate.toLocaleString('default', { month: 'long' })} ${selectedDate}, ${year}` : 'Select a date'}
          </h2>
          
          {selectedDate ? (
            selectedEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {selectedEvents.map(e => (
                  <div key={e.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-light)', fontSize: '1.125rem' }}>{e.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      <MapPin size={14} /> {e.location}
                    </div>
                    {e.description && <p style={{ fontSize: '0.875rem', margin: 0, color: '#cbd5e1', lineHeight: '1.5' }}>{e.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>No special events marked for this date.</div>
            )
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>Click on a marked date to see what's special!</div>
          )}
        </div>
        
      </div>
    </div>
  );
}
