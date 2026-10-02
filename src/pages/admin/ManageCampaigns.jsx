import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase';
import imageCompression from 'browser-image-compression';
import { HeartHandshake, Plus, UploadCloud, FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function ManageCampaigns() {
  const [formData, setFormData] = useState({ title: '', category: '', goal: '', image: '', description: '' });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'categories'));
    const unsub = onSnapshot(q, (snapshot) => {
      const dbCats = snapshot.docs.map(doc => doc.data().name);
      const defaults = ['Health', 'Community', 'Education', 'Emergency Relief'];
      const merged = Array.from(new Set([...defaults, ...dbCats]));
      setCategories(merged);
    });
    
    const unsubCamps = onSnapshot(query(collection(db, 'campaigns'), orderBy('timestamp', 'desc')), (snapshot) => {
      setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsub(); unsubCamps(); };
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await addDoc(collection(db, 'categories'), { name: newCategory.trim() });
      setFormData({ ...formData, category: newCategory.trim() });
      setNewCategory('');
      alert(`Category "${newCategory.trim()}" added successfully!`);
    } catch (err) {
      console.error(err);
      alert("Error adding category.");
    }
  };

  const compressAndConvertToBase64 = async (file) => {
    try {
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        initialQuality: 0.7
      };
      const compressedFile = await imageCompression(file, options);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    } catch (error) {
      console.error("Error converting image:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalUrl = formData.image;

      if (file) {
        finalUrl = await compressAndConvertToBase64(file);
      }

      await addDoc(collection(db, 'campaigns'), {
        ...formData,
        image: finalUrl,
        goal: Number(formData.goal),
        raised: 0,
        status: 'Active',
        timestamp: serverTimestamp()
      });
      alert("Campaign added successfully!");
      setFormData({ title: '', category: 'Health', goal: '', image: '', description: '' });
      setFile(null);
      setPreviewUrl('');
      setIsSubmitting(false);

    } catch (err) {
      console.error(err);
      alert("Error adding campaign: " + err.message);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      try {
        await deleteDoc(doc(db, 'campaigns', id));
      } catch (err) {
        console.error(err);
        alert("Error deleting campaign");
      }
    }
  };

  const exportCampaignReportPDF = async (campaign) => {
    try {
      const q = query(collection(db, 'contributions'), where('campaignId', '==', campaign.id));
      const snap = await getDocs(q);
      
      const membersSnap = await getDocs(collection(db, 'members'));
      const memberMap = {};
      membersSnap.forEach(m => memberMap[m.id] = m.data().name);

      const docPdf = new jsPDF();
      docPdf.setFontSize(22);
      docPdf.setTextColor(13, 138, 188); 
      docPdf.text("Kuttiatoor Kootayma - Campaign Report", 14, 22);
      
      docPdf.setFontSize(12);
      docPdf.setTextColor(50, 50, 50);
      docPdf.text(`Campaign: ${campaign.title}`, 14, 32);
      docPdf.text(`Category: ${campaign.category}`, 14, 38);
      docPdf.text(`Goal: ₹ ${campaign.goal?.toLocaleString()}`, 14, 44);
      docPdf.text(`Raised: ₹ ${campaign.raised?.toLocaleString() || 0}`, 14, 50);
      
      const tableColumn = ["Date", "Donor Name", "Amount (₹)", "Status", "Note"];
      const tableRows = [];

      const sorted = snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

      let total = 0;
      sorted.forEach(c => {
        const date = c.timestamp ? c.timestamp.toDate().toLocaleDateString() : 'Just now';
        const donor = memberMap[c.memberId] || 'Unknown Donor';
        const amount = c.amount;
        const status = c.status || 'Completed';
        const note = c.note || '';
        total += amount;
        tableRows.push([date, donor, amount.toLocaleString(), status, note]);
      });
      
      tableRows.push(["", "Total (₹)", total.toLocaleString(), "", ""]);

      autoTable(docPdf, {
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        theme: 'grid',
        headStyles: { fillColor: [13, 138, 188], textColor: 255, fontSize: 10, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        styles: { cellPadding: 3 },
      });

      docPdf.save(`Campaign_${campaign.title.replace(/ /g, '_')}_Report.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error generating report");
    }
  };

  const exportCampaignReportExcel = async (campaign) => {
    try {
      const q = query(collection(db, 'contributions'), where('campaignId', '==', campaign.id));
      const snap = await getDocs(q);
      
      const membersSnap = await getDocs(collection(db, 'members'));
      const memberMap = {};
      membersSnap.forEach(m => memberMap[m.id] = m.data().name);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Campaign Report');
      
      const headers = ["Date", "Donor Name", "Amount (₹)", "Status", "Note"];
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 12 };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      });

      const sorted = snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

      let total = 0;
      sorted.forEach((c, index) => {
        const date = c.timestamp ? c.timestamp.toDate().toLocaleDateString() : 'Just now';
        const donor = memberMap[c.memberId] || 'Unknown Donor';
        const amount = c.amount || 0;
        const status = c.status || 'Completed';
        const note = c.note || '';
        total += amount;
        
        const addedRow = worksheet.addRow([date, donor, amount, status, note]);
        addedRow.eachCell((cell, colNumber) => {
          cell.alignment = { vertical: 'middle', horizontal: colNumber === 3 ? 'right' : 'left' };
          cell.border = { top: {style:'thin', color: {argb:'FFE2E8F0'}}, left: {style:'thin', color: {argb:'FFE2E8F0'}}, bottom: {style:'thin', color: {argb:'FFE2E8F0'}}, right: {style:'thin', color: {argb:'FFE2E8F0'}} };
          if (index % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        });
      });
      
      // Add Total Row
      const totalRow = worksheet.addRow(["", "Total (₹)", total, "", ""]);
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
      saveAs(new Blob([buffer]), `Campaign_${campaign.title.replace(/ /g, '_')}_Report.xlsx`);
    } catch (err) {
      console.error(err);
      alert("Error generating report");
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Manage Charity Campaigns</h1>
      
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '2rem', maxWidth: '800px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HeartHandshake size={20} color="var(--primary)" /> Add New Campaign
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 2 }}>
              <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Campaign Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }} placeholder="e.g., Winter Relief Fund" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Category</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <select name="category" value={formData.category} onChange={handleChange} required style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}>
                  <option value="">-- Select Category --</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Or add new..." style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: 'white', flex: 1, fontSize: '0.75rem' }} />
                  <button type="button" onClick={handleAddCategory} style={{ background: 'var(--primary-dark)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>Add</button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Target Goal (₹)</label>
              <input type="number" name="goal" value={formData.goal} onChange={handleChange} required style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }} placeholder="e.g., 50000" min="1" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#0f172a', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #475569' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'white', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UploadCloud size={16} /> Upload Header Image
              </label>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ color: '#cbd5e1' }} />
              {file && <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)' }}>Selected: {file.name}</span>}
            </div>

            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>— OR —</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>External Image URL (Optional if uploading)</label>
              <input type="url" name="image" value={formData.image} onChange={handleChange} style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white' }} placeholder="https://..." />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white', resize: 'vertical' }} placeholder="Describe the purpose of this charity campaign..." />
          </div>

          <button type="submit" disabled={isSubmitting} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            {isSubmitting ? 'Creating...' : <><Plus size={18} /> Create Campaign</>}
          </button>
        </form>
      </div>

      {/* Existing Campaigns Section */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '2rem', maxWidth: '800px', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Existing Campaigns ({campaigns.length})</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {campaigns.map(camp => (
            <div key={camp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={camp.image || 'https://via.placeholder.com/60'} alt={camp.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'white' }}>{camp.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{camp.category} | Goal: {camp.goal} ₹</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => exportCampaignReportExcel(camp)} style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#10b981', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileSpreadsheet size={16} />
                </button>
                <button onClick={() => exportCampaignReportPDF(camp)} style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={16} />
                </button>
                <button onClick={() => handleDelete(camp.id)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, marginLeft: '0.5rem' }}>Delete</button>
              </div>
            </div>
          ))}
          {campaigns.length === 0 && <p style={{ color: '#94a3b8' }}>No campaigns available.</p>}
        </div>
      </div>
    </div>
  );
}
