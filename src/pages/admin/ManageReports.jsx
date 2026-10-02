import React, { useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { FileSpreadsheet, Download, FileText, Printer } from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function ManageReports() {
  const [loading, setLoading] = useState(false);

  const downloadExcel = async (data, filename, sheetName = 'Report') => {
    if (data.length === 0) {
      alert("No data available to export.");
      return;
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    const headers = Object.keys(data[0]);
    
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F172A' } // Dark blue/slate header
      };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 12 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
      };
    });

    data.forEach((row, index) => {
      const addedRow = worksheet.addRow(Object.values(row));
      addedRow.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.border = {
          top: {style:'thin', color: {argb:'FFE2E8F0'}}, left: {style:'thin', color: {argb:'FFE2E8F0'}}, bottom: {style:'thin', color: {argb:'FFE2E8F0'}}, right: {style:'thin', color: {argb:'FFE2E8F0'}}
        };
        // Alternating row colors
        if (index % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        }
      });
    });

    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 12 ? 12 : Math.min(maxLength + 2, 50);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), filename + '.xlsx');
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
          Profession: d.profession || 'N/A',
          Location: d.location || 'N/A',
          Website: d.website || 'N/A',
          Type: d.type,
          JoinDate: d.joinDate,
          TotalContributions: d.totalContributions || 0
        };
      });
      await downloadExcel(data, `Members_Report_${new Date().toISOString().split('T')[0]}`, 'Members');
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
      docPdf.text("Kuttiatoor Kootayma - Members Directory", 14, 22);
      
      const tableColumn = ["Name", "Contact", "Profession", "Location", "Type", "Joined", "Total (₹)"];
      const tableRows = [];

      snap.docs.forEach(doc => {
        const d = doc.data();
        const contact = `${d.email || 'N/A'}\n${d.phone || 'N/A'}`;
        tableRows.push([
          d.name, 
          contact, 
          d.profession || 'N/A', 
          d.location || 'N/A', 
          d.type, 
          d.joinDate, 
          (d.totalContributions || 0).toLocaleString()
        ]);
      });

      autoTable(docPdf, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [13, 138, 188], textColor: 255, fontSize: 10, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        styles: { cellPadding: 3 },
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
      await downloadExcel(data, `Contributions_Report_${new Date().toISOString().split('T')[0]}`, 'Contributions');
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
      docPdf.text("Kuttiatoor Kootayma - Contributions Ledger", 14, 22);

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
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 10, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        styles: { cellPadding: 3 },
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
      await downloadExcel(data, `Campaigns_Report_${new Date().toISOString().split('T')[0]}`, 'Campaigns');
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
      docPdf.text("Kuttiatoor Kootayma - Campaigns Performance", 14, 22);

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
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68], textColor: 255, fontSize: 10, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [254, 242, 242] },
        styles: { cellPadding: 3 },
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
