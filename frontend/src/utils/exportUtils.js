import { utils, write } from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-hot-toast';

/**
 * Clean data objects for exporting to spreadsheets
 */
const prepareExcelData = (bids) => {
  return bids.map((bid) => ({
    'Bid Title': bid.title,
    'Client Name': bid.clientName,
    'Valuation ($)': bid.value,
    'Stage/Status': bid.status,
    'Priority': bid.priority,
    'Deadline': bid.deadline ? new Date(bid.deadline).toLocaleDateString() : 'N/A',
    'Assigned Owner': bid.assignedTo?.name || bid.assignedTo || 'Unassigned',
    'Created By': bid.createdBy?.name || bid.createdBy || 'Unknown',
    'Tags': (bid.tags || []).join(', '),
    'Created At': new Date(bid.createdAt).toLocaleDateString(),
  }));
};

/**
 * Export data to Excel (.xlsx) file
 * @param {Array} bids - Raw array of bid documents
 * @param {String} fileName - Desired file name without extension
 */
export const exportToExcel = (bids, fileName = 'bids_export') => {
  try {
    const data = prepareExcelData(bids);
    
    // Create new sheet
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Bids Pipeline');

    // Auto-adjust column widths
    const columnWidths = Object.keys(data[0] || {}).map(key => {
      let maxLen = key.length;
      data.forEach(row => {
        const val = row[key] ? String(row[key]) : '';
        if (val.length > maxLen) maxLen = val.length;
      });
      return { wch: maxLen + 3 };
    });
    worksheet['!cols'] = columnWidths;

    // Trigger download
    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    
    const downloadUrl = window.URL.createObjectURL(fileBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = `${fileName}_${Date.now()}.xlsx`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    toast.success('Excel report downloaded successfully!');
  } catch (error) {
    console.error('Excel export failed:', error);
    toast.error('Failed to generate Excel sheet.');
  }
};

/**
 * Export data to CSV (.csv) file
 * @param {Array} bids - Raw array of bid documents
 * @param {String} fileName - Desired file name
 */
export const exportToCSV = (bids, fileName = 'bids_export') => {
  try {
    const data = prepareExcelData(bids);
    
    // Build CSV content
    if (data.length === 0) {
      toast.error('No data available to export.');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(fieldName => {
          const val = row[fieldName] ? String(row[fieldName]) : '';
          // Escape quotes inside field value
          const cleanVal = val.replace(/"/g, '""');
          // Wrap in quotes if it contains commas or newlines
          return (cleanVal.includes(',') || cleanVal.includes('\n') || cleanVal.includes('"'))
            ? `"${cleanVal}"`
            : cleanVal;
        }).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${fileName}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV file downloaded successfully!');
  } catch (error) {
    console.error('CSV export failed:', error);
    toast.error('Failed to generate CSV file.');
  }
};

/**
 * Export high-fidelity PDF report of bids
 * @param {Array} bids - Bids to put inside the report
 * @param {String} reportTitle - Report title heading
 * @param {String} reportSubtitle - Report subtitle/description
 */
export const exportToPDF = (bids, reportTitle = 'Executive Pipeline Audit', reportSubtitle = 'Detailed analysis of sales pipeline and bid valuations.') => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Page Dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Calculate aggregated metrics
    const totalBids = bids.length;
    const totalValuation = bids.reduce((sum, b) => sum + (b.value || 0), 0);
    const avgValuation = totalBids > 0 ? totalValuation / totalBids : 0;
    
    const approvedBids = bids.filter(b => b.status === 'Approved');
    const winRate = totalBids > 0 ? (approvedBids.length / totalBids) * 100 : 0;

    // --- Modern Brand Header (SaaS dark styling) ---
    doc.setFillColor(9, 13, 31); // #090d1f (Dark SaaS navy background)
    doc.rect(0, 0, pageWidth, 55, 'F');

    // Title text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(reportTitle.toUpperCase(), 15, 22);

    // Subtitle
    doc.setTextColor(148, 163, 184); // Slate grey
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(reportSubtitle, 15, 30);

    // Brand Label Right-Aligned
    doc.setTextColor(59, 130, 246); // Blue
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('ANTIGRAVITY BID IQ', pageWidth - 15, 22, { align: 'right' });

    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 15, 29, { align: 'right' });

    // --- KPI Cards Section (Drawn manually as cards) ---
    const drawKPICard = (x, y, w, h, title, val) => {
      // Background fill
      doc.setFillColor(248, 250, 252); // Soft light grey
      doc.roundedRect(x, y, w, h, 3, 3, 'F');
      // Border outline
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, w, h, 3, 3, 'D');

      // Title
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(title.toUpperCase(), x + 5, y + 6);

      // Value
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(val, x + 5, y + 14);
    };

    const cardWidth = (pageWidth - 40) / 4;
    const cardHeight = 20;
    const cardY = 45;

    drawKPICard(15, cardY, cardWidth, cardHeight, 'Total Proposals', `${totalBids}`);
    drawKPICard(15 + cardWidth + 3, cardY, cardWidth, cardHeight, 'Pipeline Value', `$${totalValuation.toLocaleString()}`);
    drawKPICard(15 + (cardWidth * 2) + 6, cardY, cardWidth, cardHeight, 'Average Value', `$${Math.round(avgValuation).toLocaleString()}`);
    drawKPICard(15 + (cardWidth * 3) + 9, cardY, cardWidth, cardHeight, 'Aura Win Rate', `${winRate.toFixed(1)}%`);

    // --- Main Pipeline Table Section ---
    const tableColumns = [
      { header: 'Bid Title / Client', dataKey: 'titleClient' },
      { header: 'Valuation', dataKey: 'value' },
      { header: 'Stage', dataKey: 'status' },
      { header: 'Priority', dataKey: 'priority' },
      { header: 'Deadline', dataKey: 'deadline' },
      { header: 'Assigned Owner', dataKey: 'owner' }
    ];

    const tableRows = bids.map(bid => ({
      titleClient: `${bid.title}\nClient: ${bid.clientName}`,
      value: `$${(bid.value || 0).toLocaleString()}`,
      status: bid.status,
      priority: bid.priority,
      deadline: bid.deadline ? new Date(bid.deadline).toLocaleDateString() : 'N/A',
      owner: bid.assignedTo?.name || bid.assignedTo || 'Unassigned'
    }));

    doc.autoTable({
      columns: tableColumns,
      body: tableRows,
      startY: 75,
      margin: { left: 15, right: 15 },
      theme: 'striped',
      styles: {
        fontSize: 8.5,
        cellPadding: 3.5,
        valign: 'middle'
      },
      headStyles: {
        fillColor: [15, 23, 42], // Slate-900 header
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Soft white/grey stripes
      },
      columnStyles: {
        titleClient: { fontStyle: 'bold', cellWidth: 50 },
        value: { fontStyle: 'bold', textColor: [59, 130, 246] }
      },
      didDrawPage: (data) => {
        // Footer signature and page indicators
        const footerY = pageHeight - 10;
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.text('Aura Bid - Confidential Pipeline Audit Report', 15, footerY);
        doc.text(`Page ${data.pageNumber} of ${data.pageCount || 1}`, pageWidth - 15, footerY, { align: 'right' });
      }
    });

    // Save/Download file
    doc.save(`${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    toast.success('PDF Audit Report downloaded successfully!');
  } catch (error) {
    console.error('PDF export failed:', error);
    toast.error('Failed to generate PDF Report.');
  }
};
