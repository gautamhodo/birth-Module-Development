import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';

const DeathReportDownload: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchAndDownload = async () => {
      const res = await fetch('/db.json');
      const data = await res.json();
      const record = (data.deathRecords || []).find((r: any) => String(r.id) === id);
      if (!record) return;
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setFont('helvetica');
      doc.setFillColor(253, 241, 230);
      doc.rect(0, 0, 210, 297, 'F');
      doc.setDrawColor(201, 164, 122);
      doc.setLineWidth(2);
      doc.rect(10, 10, 190, 277, 'S');
      doc.setFontSize(22);
      doc.setTextColor(60, 90, 150);
      doc.text('DEATH CERTIFICATE', 105, 28, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text('This certifies that', 105, 40, { align: 'center' });
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.firstName || ''} ${record.lastName || ''}`, 105, 52, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text('Date of Birth:', 40, 65);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.dateOfBirth || '-'}`, 75, 65);
      doc.setTextColor(80, 80, 80);
      doc.text('Date of Death:', 40, 75);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.dateOfDeath || '-'}`, 75, 75);
      doc.setTextColor(80, 80, 80);
      doc.text('Gender:', 40, 85);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.gender || '-'}`, 75, 85);
      doc.setTextColor(80, 80, 80);
      doc.text('Doctor Name:', 40, 95);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.doctorName || '-'}`, 75, 95);
      doc.setTextColor(80, 80, 80);
      doc.text('IP No:', 40, 105);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.ipNo || '-'}`, 75, 105);
      doc.setTextColor(80, 80, 80);
      doc.text('Cause of Death:', 40, 115);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.causeOfDeath || '-'}`, 90, 115);
      doc.setTextColor(80, 80, 80);
      doc.text('Type:', 40, 125);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.causeOfDeathType || '-'}`, 75, 125);
      doc.setTextColor(80, 80, 80);
      doc.text('Postmortem Done:', 40, 135);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.postmortemDone || '-'}`, 90, 135);
      doc.setTextColor(80, 80, 80);
      doc.text('Pathologist Name:', 40, 145);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.pathologistName || '-'}`, 90, 145);
      doc.setTextColor(80, 80, 80);
      doc.text('Place of Death:', 40, 155);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.placeOfDeath || '-'}`, 90, 155);
      doc.setTextColor(80, 80, 80);
      doc.text('Death Informed By:', 40, 165);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.deathInformedPerson || '-'}`, 90, 165);
      doc.setTextColor(80, 80, 80);
      doc.text('Contact:', 40, 175);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.deathInformedContact || '-'}`, 75, 175);
      doc.setTextColor(80, 80, 80);
      doc.text('Address:', 40, 185);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.deathInformedAddress || '-'}`, 75, 185);
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text('Relatives:', 40, 195);
      doc.setTextColor(44, 62, 80);
      if (record.relatives && Array.isArray(record.relatives)) {
        record.relatives.forEach((rel, idx) => {
          doc.text(`- ${rel.name} (${rel.relation}) - ${rel.contact}, ${rel.address}`, 50, 205 + idx * 8);
        });
      }
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text('Registered by:', 40, 245);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.registeredBy || '-'}`, 80, 245);
      doc.setTextColor(80, 80, 80);
      doc.text('Registered on:', 40, 255);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.registeredOn ? new Date(record.registeredOn).toLocaleString() : '-'}`, 80, 255);
      doc.setTextColor(80, 80, 80);
      doc.text('Registered at:', 40, 265);
      doc.setTextColor(44, 62, 80);
      doc.text(`${record.registeredAt || '-'}`, 80, 265);
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 285);
      doc.text('Signature: ____________________', 140, 285);
      doc.save(`${record.firstName || 'Death'}_Report.pdf`);
    };
    fetchAndDownload();
  }, [id]);

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>Generating Death Report PDF...</h2>
      <p>Your download should begin automatically. You may close this tab after the download.</p>
    </div>
  );
};

export default DeathReportDownload; 