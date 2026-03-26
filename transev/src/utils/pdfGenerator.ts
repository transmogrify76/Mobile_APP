import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface Bill {
  uid: string;
  username: string;
  chargerid: string;
  energyconsumption: string;
  chargingtime: string;
  taxableamount: string;
  gstamount: string;
  totalamount: string;
  lasttransaction: string;
  createdAt: string;
}

export const generateBillPDF = (bill: Bill) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header with logo
  const logoUrl = 'https://transev.in/assets/up-B0GM0qzi.png';
  doc.addImage(logoUrl, 'PNG', 15, 15, 50, 15); // adjust size as needed
  doc.setFontSize(20);
  doc.setTextColor(0, 128, 128); // teal
  doc.text('Tax Invoice', pageWidth - 50, 25, { align: 'right' });

  // Bill Title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Charging Session Bill', 15, 45);

  // Bill Info
  doc.setFontSize(10);
  doc.text(`Bill ID: ${bill.uid}`, 15, 55);
  doc.text(`Date: ${format(new Date(bill.createdAt), 'dd MMM yyyy HH:mm')}`, 15, 61);

  // Customer Details
  doc.setFontSize(12);
  doc.text('Customer Details', 15, 75);
  autoTable(doc, {
    startY: 80,
    body: [
      ['Customer Name', bill.username],
      ['Charger ID', bill.chargerid],
    ],
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 100 } },
    margin: { left: 15 },
  });

  // Bill Items
  const tableBody = [
    ['Energy Consumed (kWh)', bill.energyconsumption],
    ['Charging Time', bill.chargingtime],
    ['Taxable Amount', `₹${bill.taxableamount}`],
    ['GST Amount', `₹${bill.gstamount}`],
    ['Total Amount', `₹${bill.totalamount}`],
  ];

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    body: tableBody,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 70 } },
    margin: { left: 15 },
  });

  // Transaction details
  doc.setFontSize(10);
  doc.text(`Transaction ID: ${bill.lasttransaction}`, 15, (doc as any).lastAutoTable.finalY + 10);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for choosing TransEV', pageWidth / 2, footerY, { align: 'center' });

  // Save PDF
  doc.save(`bill_${bill.uid}.pdf`);
};