import React, { useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { FileSpreadsheet, Download, FileText, Printer } from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ManageReports() {
  const [loading, setLoading] = useState(false);

  const downloadCSV = (data, filename) => {
    if (data.length === 0) {
      alert("No data available to export.");
      return;
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] !== undefined && row[header] !== null ? row[header] : '';
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportMembers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'members'), orderBy('timestamp', 'desc')));
      const data = snap.docs.map(doc => {
        const d = doc.data();
        return {
          ID: doc.id,
          Name: d.name,
          Email: d.email,
          Phone: d.phone,
          Type: d.type,
          JoinDate: d.joinDate,
          TotalContributions: d.totalContributions || 0
        };
      });
      downloadCSV(data, `Members_Report_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      console.error(err);
      alert("Error generating report. Ensure you have the right permissions.");
    } finally {
      setLoading(false);
    }
  };

  const exportMembersPDF = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'members'), orderBy('timestamp', 'desc')));
      const docPdf = new jsPDF();
      docPdf.setFontSize(22);
      docPdf.setTextColor(13, 138, 188); 
      docPdf.text("GCC Koottayma - Members Directory", 14, 22);
      
      const tableColumn = ["Name", "Email", "Phone", "Type", "Joined", "Total Contributions (₹)"];
      const tableRows = [];

      snap.docs.forEach(doc => {
        const d = doc.data();
        tableRows.push([d.name, d.email || 'N/A', d.phone || 'N/A', d.type, d.joinDate, (d.totalContributions || 0).toLocaleString()]);
      });

      autoTable(docPdf, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
      });

      docPdf.save(`Members_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF.");
    } finally {
      setLoading(false);
    }
  };

  const exportContributions = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'contributions'), orderBy('timestamp', 'desc')));
      const membersSnap = await getDocs(collection(db, 'members'));
      const campsSnap = await getDocs(collection(db, 'campaigns'));
      
      const memberMap = {};
      membersSnap.forEach(m => memberMap[m.id] = m.data().name);
      
      const campMap = {};
      campsSnap.forEach(c => campMap[c.id] = c.data().title);

      const data = snap.docs.map(doc => {
        const d = doc.data();
        return {
          TransactionID: doc.id,
          MemberName: memberMap[d.memberId] || 'Unknown',
          CampaignTitle: campMap[d.campaignId] || 'Unknown',
          "Amount (₹)": d.amount,
          Date: d.timestamp ? new Date(d.timestamp.seconds * 1000).toLocaleString() : 'N/A'
        };
      });
      downloadCSV(data, `Contributions_Report_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      console.error(err);
      alert("Error generating report. Ensure you have the right permissions.");
    } finally {
      setLoading(false);
    }
  };

  const exportContributionsPDF = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'contributions'), orderBy('timestamp', 'desc')));
      const membersSnap = await getDocs(collection(db, 'members'));
      const campsSnap = await getDocs(collection(db, 'campaigns'));
      
      const memberMap = {};
      membersSnap.forEach(m => memberMap[m.id] = m.data().name);
      
      const campMap = {};
      campsSnap.forEach(c => campMap[c.id] = c.data().title);

      const docPdf = new jsPDF();
      docPdf.setFontSize(22);
      docPdf.setTextColor(16, 185, 129); 
      docPdf.text("GCC Koottayma - Contributions Ledger", 14, 22);

      const tableColumn = ["Date", "Member Name", "Campaign Title", "Amount (₹)"];
      const tableRows = [];

      let total = 0;
      snap.docs.forEach(doc => {
        const d = doc.data();
        const date = d.timestamp ? new Date(d.timestamp.seconds * 1000).toLocaleDateString() : 'N/A';
        const member = memberMap[d.memberId] || 'Unknown';
        const campaign = campMap[d.campaignId] || 'Unknown';
        const amt = d.amount || 0;
        total += amt;
        tableRows.push([date, member, campaign, amt.toLocaleString()]);
      });

      tableRows.push(["", "", "TOTAL (₹)", total.toLocaleString()]);

      autoTable(docPdf, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
      });

      docPdf.save(`Contributions_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF.");
    } finally {
      setLoading(false);
    }
  };

  const exportCampaigns = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'campaigns'), orderBy('timestamp', 'desc')));
      const data = snap.docs.map(doc => {
        const d = doc.data();
        return {
          CampaignID: doc.id,
          Title: d.title,
          Category: d.category,
          Status: d.status,
          "Goal (₹)": d.goal,
          "Raised (₹)": d.raised || 0,
          CompletionPercentage: d.goal ? Math.round(((d.raised || 0) / d.goal) * 100) + '%' : '0%'
        };
      });
      downloadCSV(data, `Campaigns_Report_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      console.error(err);
      alert("Error generating report. Ensure you have the right permissions.");
    } finally {
      setLoading(false);
    }
  };

  const exportCampaignsPDF = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'campaigns'), orderBy('timestamp', 'desc')));
      const docPdf = new jsPDF();
      docPdf.setFontSize(22);
      docPdf.setTextColor(239, 68, 68); 
      docPdf.text("GCC Koottayma - Campaigns Performance", 14, 22);

      const tableColumn = ["Title", "Category", "Status", "Goal (₹)", "Raised (₹)", "%"];
      const tableRows = [];

      snap.docs.forEach(doc => {
        const d = doc.data();
        const goal = d.goal || 0;
        const raised = d.raised || 0;
        const pct = goal ? Math.round((raised / goal) * 100) + '%' : '0%';
        tableRows.push([d.title, d.category, d.status, goal.toLocaleString(), raised.toLocaleString(), pct]);
      });

      autoTable(docPdf, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68] },
      });

      docPdf.save(`Campaigns_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Reports & Analytics</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Members Report */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '12px', color: '#3b82f6' }}>
              <FileSpreadsheet size={24} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Members Data</h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Export a full list of all registered members, their contact information, membership type, and total lifetime contributions.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={exportMembers} disabled={loading} className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: '#3b82f6' }}>
              <Download size={18} /> Excel
            </button>
            <button onClick={exportMembersPDF} disabled={loading} className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: '#1e293b', border: '1px solid #3b82f6', color: '#3b82f6' }}>
              <FileText size={18} /> PDF
            </button>
          </div>
        </div>

        {/* Contributions Report */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px', color: '#10b981' }}>
              <FileSpreadsheet size={24} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Contributions Data</h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Export a comprehensive ledger of all donations, identifying the donor, the target campaign, amount, and exact timestamp.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={exportContributions} disabled={loading} className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: '#10b981' }}>
              <Download size={18} /> Excel
            </button>
            <button onClick={exportContributionsPDF} disabled={loading} className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: '#1e293b', border: '1px solid #10b981', color: '#10b981' }}>
              <FileText size={18} /> PDF
            </button>
          </div>
        </div>

        {/* Campaigns Report */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '12px', color: '#ef4444' }}>
              <FileSpreadsheet size={24} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Campaigns Data</h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Export performance metrics for all charity campaigns, including target goals, actual amounts raised, and funding percentage.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={exportCampaigns} disabled={loading} className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: '#ef4444', border: 'none' }}>
              <Download size={18} /> Excel
            </button>
            <button onClick={exportCampaignsPDF} disabled={loading} className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: '#1e293b', border: '1px solid #ef4444', color: '#ef4444' }}>
              <FileText size={18} /> PDF
            </button>
          </div>
        </div>

      </div>

      <div style={{ marginTop: '3rem', backgroundColor: '#0f172a', padding: '2rem', borderRadius: '12px', border: '1px dashed #334155', textAlign: 'center' }}>
        <Printer size={32} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Professional Reports Ready</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.5' }}>
          All PDF exports are pre-formatted with your branding and layout, ready to print or email directly to stakeholders. Excel CSVs remain the standard for deep financial accounting.
        </p>
      </div>

    </div>
  );
}
