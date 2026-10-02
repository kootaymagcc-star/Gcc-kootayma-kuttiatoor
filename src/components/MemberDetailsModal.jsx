import React, { useState, useEffect } from 'react';
import { X, Heart, Calendar, Mail, Phone, MapPin, Briefcase, FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import './Modal.css';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

export default function MemberDetailsModal({ isOpen, onClose, member }) {
  const [contributions, setContributions] = useState([]);
  const [campaignsCache, setCampaignsCache] = useState({});

  useEffect(() => {
    if (!isOpen || !member) return;
    const q = query(collection(db, 'contributions'), where('memberId', '==', member.id));
    const unsub = onSnapshot(q, (snapshot) => {
      setContributions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Also fetch campaigns to map campaignId to title if needed
    const qCamp = query(collection(db, 'campaigns'));
    const unsubCamp = onSnapshot(qCamp, (snapshot) => {
      const cmap = {};
      snapshot.forEach(doc => { cmap[doc.id] = doc.data(); });
      setCampaignsCache(cmap);
    });

    return () => { unsub(); unsubCamp(); };
  }, [isOpen, member]);

  if (!isOpen || !member) return null;

  // Group contributions by category
  const categoryMap = {};
  contributions.forEach(c => {
    categoryMap[c.campaignCategory] = (categoryMap[c.campaignCategory] || 0) + c.amount;
  });
  const contributionByCampaign = Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] }));

  // Group contributions by year
  const yearMap = {};
  contributions.forEach(c => {
    if (c.timestamp) {
      const year = c.timestamp.toDate().getFullYear();
      yearMap[year] = (yearMap[year] || 0) + c.amount;
    }
  });
  const yearlyContributions = Object.keys(yearMap).map(key => ({ year: key, amount: yearMap[key] })).sort((a,b) => a.year - b.year);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(13, 138, 188); 
    doc.text("Kuttiatoor Kootayma - Donor Contribution Report", 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Member Name: ${member.name}`, 14, 32);
    doc.text(`Email: ${member.email || 'N/A'}`, 14, 38);
    doc.text(`Phone: ${member.phone || 'N/A'}`, 14, 44);
    doc.text(`Total Lifetime Contributions: ₹ ${member.totalContributions?.toLocaleString() || 0}`, 14, 50);
    
    const tableColumn = ["Date", "Campaign", "Category", "Amount (₹)", "Status", "Note"];
    const tableRows = [];
    const sortedContributions = [...contributions].sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

    sortedContributions.forEach(c => {
      const date = c.timestamp ? c.timestamp.toDate().toLocaleDateString() : 'Just now';
      const campaign = campaignsCache[c.campaignId]?.title || 'Unknown Campaign';
      const category = c.campaignCategory || 'General';
      const amount = c.amount.toLocaleString();
      const status = c.status || 'Completed';
      const note = c.note || '';
      tableRows.push([date, campaign, category, amount, status, note]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'grid',
      headStyles: { fillColor: [13, 138, 188], textColor: 255, fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { cellPadding: 3 },
    });

    doc.save(`${member.name.replace(/ /g, '_')}_Report.pdf`);
  };

  const generateExcel = async () => {
    const sortedContributions = [...contributions].sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Contributions');
    
    const headers = ["Date", "Campaign", "Category", "Amount (₹)", "Status", "Note"];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 12 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    });

    let total = 0;
    sortedContributions.forEach((c, index) => {
      const date = c.timestamp ? c.timestamp.toDate().toLocaleDateString() : 'Just now';
      const campaign = campaignsCache[c.campaignId]?.title || 'Unknown Campaign';
      const category = c.campaignCategory || 'General';
      const amount = c.amount || 0;
      const status = c.status || 'Completed';
      const note = c.note || '';
      total += amount;

      const addedRow = worksheet.addRow([date, campaign, category, amount, status, note]);
      addedRow.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: colNumber === 4 ? 'right' : 'left' };
        cell.border = { top: {style:'thin', color: {argb:'FFE2E8F0'}}, left: {style:'thin', color: {argb:'FFE2E8F0'}}, bottom: {style:'thin', color: {argb:'FFE2E8F0'}}, right: {style:'thin', color: {argb:'FFE2E8F0'}} };
        if (index % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      });
    });

    // Add Total Row
    const totalRow = worksheet.addRow(["", "", "Total (₹)", total, "", ""]);
    totalRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Light amber
      cell.border = { top: {style:'medium'}, bottom: {style:'medium'} };
    });

    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) maxLength = columnLength;
      });
      column.width = maxLength < 12 ? 12 : Math.min(maxLength + 2, 50);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${member.name.replace(/ /g, '_')}_Report.xlsx`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wide" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        
        <div className="modal-header-flex">
          <img src={member.avatar} alt={member.name} style={{ width: 100, height: 100, borderRadius: '50%', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', border: '4px solid white' }} />
          <div style={{ flex: 1, width: '100%' }}>
            <div className="modal-header-info">
              <div>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{member.name}</h2>
                <div className="modal-tags">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}><Heart size={16} /> {member.type} Member</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}><Calendar size={16} /> Joined {member.joinDate}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={generateExcel} className="btn" style={{ background: '#10b981', color: 'white', display: 'flex', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', border: 'none' }}>
                  <FileSpreadsheet size={16} /> Excel
                </button>
                <button onClick={generatePDF} className="btn" style={{ background: '#ef4444', color: 'white', display: 'flex', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', border: 'none' }}>
                  <FileText size={16} /> PDF
                </button>
              </div>
            </div>
            
            <div className="modal-header-details">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}><Mail size={16} color="var(--primary)" /> {member.email || 'N/A'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}><Phone size={16} color="var(--primary)" /> {member.phone || 'N/A'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}><Briefcase size={16} color="var(--primary)" /> {member.profession || 'N/A'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}><MapPin size={16} color="var(--primary)" /> {member.location || 'N/A'}</div>
            </div>
          </div>
        </div>

        {contributions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.3)', borderRadius: '12px' }}>
            <Heart size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ color: 'var(--text-main)' }}>No Contributions Yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>This member hasn't made any donations yet.</p>
          </div>
        ) : (
          <>
            <div className="modal-charts-grid">
              {/* Pie Chart: Contributions by Category */}
              <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.7)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', textAlign: 'center', color: 'var(--text-main)', fontWeight: 700 }}>Donations by Category</h3>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contributionByCampaign}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={8}
                        dataKey="value"
                        animationDuration={1500}
                        animationEasing="ease-out"
                        stroke="none"
                      >
                        {contributionByCampaign.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: `drop-shadow(0px 4px 6px ${COLORS[index % COLORS.length]}40)` }} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value) => `₹ ${value.toLocaleString()}`} 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                  {contributionByCampaign.map((entry, index) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      <div style={{ width: 12, height: 12, borderRadius: '4px', backgroundColor: COLORS[index % COLORS.length] }}></div>
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Chart: Yearly Growth */}
              <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.7)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', textAlign: 'center', color: 'var(--text-main)', fontWeight: 700 }}>Contribution History</h3>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearlyContributions} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--text-muted)', fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--text-muted)', fontWeight: 600 }} tickFormatter={(val) => `${val/1000}k`} />
                      <RechartsTooltip 
                        cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} 
                        formatter={(value) => `₹ ${value.toLocaleString()}`} 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="amount" fill="url(#colorUv)" radius={[6, 6, 0, 0]} animationDuration={1500} animationEasing="ease-out" maxBarSize={50} />
                      <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0.6}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Detailed Transaction List */}
            <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.5)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Recent Donation History</h3>
              <div className="desktop-table" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                      <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Date</th>
                      <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Campaign</th>
                      <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Category</th>
                      <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)', textAlign: 'right' }}>Amount (₹)</th>
                      <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)', paddingLeft: '1rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)', paddingLeft: '1rem' }}>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)).map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{c.timestamp ? c.timestamp.toDate().toLocaleDateString() : 'Just now'}</td>
                        <td style={{ padding: '0.75rem 0' }}>{campaignsCache[c.campaignId]?.title || 'Unknown Campaign'}</td>
                        <td style={{ padding: '0.75rem 0' }}>
                          <span style={{ padding: '2px 8px', background: 'var(--primary-light)', color: 'var(--primary-dark)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {c.campaignCategory}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 600, color: 'var(--primary-dark)' }}>
                          {c.amount.toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem 0', paddingLeft: '1rem' }}>
                          <span style={{ color: c.status === 'Fund Pending' ? '#f59e0b' : '#10b981', fontWeight: 600 }}>{c.status || 'Completed'}</span>
                        </td>
                        <td style={{ padding: '0.75rem 0', paddingLeft: '1rem', fontStyle: 'italic', color: '#64748b' }}>
                          {c.note || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mobile-cards">
                {contributions.sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)).map(c => (
                  <div key={c.id} style={{ background: 'rgba(255,255,255,0.3)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>{campaignsCache[c.campaignId]?.title || 'Unknown Campaign'}</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>₹ {c.amount.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{c.timestamp ? c.timestamp.toDate().toLocaleDateString() : 'Just now'}</span>
                      <span style={{ padding: '2px 8px', background: 'rgba(5, 150, 105, 0.1)', color: 'var(--primary-dark)', borderRadius: '99px', fontWeight: 600 }}>
                        {c.campaignCategory}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: c.status === 'Fund Pending' ? '#f59e0b' : '#10b981', fontWeight: 600 }}>{c.status || 'Completed'}</span>
                      <span style={{ fontStyle: 'italic', color: '#64748b' }}>{c.note || '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
