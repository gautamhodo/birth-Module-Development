import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';

const BirthReportDownload: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchAndDownload = async () => {
      const res = await fetch('/db.json');
      const data = await res.json();
      const record = (data.birthRecords || []).find((r: any) => String(r.id) === id);
      const parent = (data.ParentData || []).find((p: any) => p.id === record?.ParentDataId);
      if (!record || !parent) return;
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setFont('helvetica');
      doc.setFillColor(253, 241, 230);
      doc.rect(0, 0, 210, 297, 'F');
      doc.setDrawColor(201, 164, 122);
      doc.setLineWidth(2);
      doc.rect(10, 10, 190, 277, 'S');
      doc.setFontSize(22);
      doc.setTextColor(60, 90, 150);
      doc.text('BIRTH CERTIFICATE', 105, 28, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text('This certifies that', 105, 40, { align: 'center' });
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.firstName || ''} ${record.lastName || ''}`, 105, 52, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text('was born to', 105, 62, { align: 'center' });
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text(`Mother: ${parent.firstName || ''} ${parent.lastName || ''}`, 105, 72, { align: 'center' });
      doc.text(`Father: ${record.fatherName || '-'}`, 105, 80, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text('On', 40, 95);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.dateOfBirth || '-'}`, 60, 95);
      doc.setTextColor(80, 80, 80);
      doc.text('at', 100, 95);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.placeOfBirth || '-'}`, 110, 95);
      doc.setTextColor(80, 80, 80);
      doc.text('Gender:', 40, 105);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.gender || '-'}`, 60, 105);
      doc.setTextColor(80, 80, 80);
      doc.text('Weight:', 100, 105);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.weight || '-'} kg`, 120, 105);
      doc.setTextColor(80, 80, 80);
      doc.text('Blood Group:', 40, 115);
      doc.setTextColor(44, 62, 80);
      doc.text(`${parent.bloodGroup || '-'}`, 75, 115);
      doc.setTextColor(80, 80, 80);
      doc.text('UHID:', 100, 115);
      doc.setTextColor(255, 0, 0);
      doc.text(`${parent.uhid || '-'}`, 120, 115);
      doc.setTextColor(80, 80, 80);
      doc.text('Consulting Doctor:', 40, 125);
      doc.setTextColor(44, 62, 80);
      doc.text(`${parent.doctor || '-'}`, 90, 125);
      doc.setTextColor(80, 80, 80);
      doc.text('Civil ID:', 40, 135);
      doc.setTextColor(44, 62, 80);
      doc.text(`${parent.civilIds || '-'}`, 70, 135);
      doc.setTextColor(80, 80, 80);
      doc.text('Registered at:', 100, 135);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.registeredAt || '-'}`, 140, 135);
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 285);
      doc.text('Signature: ____________________', 140, 285);
      doc.save(`${record.firstName || 'Birth'}_Report.pdf`);
    };
    fetchAndDownload();
  }, [id]);

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>Generating Birth Report PDF...</h2>
      <p>Your download should begin automatically. You may close this tab after the download.</p>
    </div>
  );
};

export default BirthReportDownload; 