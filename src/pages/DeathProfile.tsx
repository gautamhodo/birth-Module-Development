import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import { Printer, ArrowRightSquare } from 'lucide-react';
import pencilIcon from '../assets/pencil.png';
import jsPDF from 'jspdf';

const DeathProfile: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [deathRecord, setDeathRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch('/db.json')
      .then(res => res.json())
      .then(data => {
        const record = (data.deathRecords || []).find((r: any) => String(r.id) === id);
        if (record) {
          setDeathRecord(record);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{padding:32}}>Loading...</div>;
  if (notFound) return <div style={{padding:32, color:'red'}}>Profile not found.</div>;

  // Helper for initials
  const initials = (first: string, last: string) => `${first?.[0]?.toUpperCase() || ''}${last?.[0]?.toUpperCase() || ''}`;

  const printDeathReport = () => {
    if (!deathRecord) return;
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
    doc.text(`${deathRecord.firstName || ''} ${deathRecord.lastName || ''}`, 105, 52, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text('Date of Birth:', 40, 65);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.dateOfBirth || '-'}`, 75, 65);
    doc.setTextColor(80, 80, 80);
    doc.text('Date of Death:', 40, 75);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.dateOfDeath || '-'}`, 75, 75);
    doc.setTextColor(80, 80, 80);
    doc.text('Gender:', 40, 85);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.gender || '-'}`, 75, 85);
    doc.setTextColor(80, 80, 80);
    doc.text('Doctor Name:', 40, 95);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.doctorName || '-'}`, 75, 95);
    doc.setTextColor(80, 80, 80);
    doc.text('IP No:', 40, 105);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.ipNo || '-'}`, 75, 105);
    doc.setTextColor(80, 80, 80);
    doc.text('Cause of Death:', 40, 115);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.causeOfDeath || '-'}`, 90, 115);
    doc.setTextColor(80, 80, 80);
    doc.text('Type:', 40, 125);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.causeOfDeathType || '-'}`, 75, 125);
    doc.setTextColor(80, 80, 80);
    doc.text('Postmortem Done:', 40, 135);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.postmortemDone || '-'}`, 90, 135);
    doc.setTextColor(80, 80, 80);
    doc.text('Pathologist Name:', 40, 145);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.pathologistName || '-'}`, 90, 145);
    doc.setTextColor(80, 80, 80);
    doc.text('Place of Death:', 40, 155);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.placeOfDeath || '-'}`, 90, 155);
    doc.setTextColor(80, 80, 80);
    doc.text('Death Informed By:', 40, 165);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.deathInformedPerson || '-'}`, 90, 165);
    doc.setTextColor(80, 80, 80);
    doc.text('Contact:', 40, 175);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.deathInformedContact || '-'}`, 75, 175);
    doc.setTextColor(80, 80, 80);
    doc.text('Address:', 40, 185);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.deathInformedAddress || '-'}`, 75, 185);
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text('Relatives:', 40, 195);
    doc.setTextColor(44, 62, 80);
    if (deathRecord.relatives && Array.isArray(deathRecord.relatives)) {
      deathRecord.relatives.forEach((rel: any, idx: number) => {
        doc.text(`- ${rel.name} (${rel.relation}) - ${rel.contact}, ${rel.address}`, 50, 205 + idx * 8);
      });
    }
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text('Registered by:', 40, 245);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.registeredBy || '-'}`, 80, 245);
    doc.setTextColor(80, 80, 80);
    doc.text('Registered on:', 40, 255);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.registeredOn ? new Date(deathRecord.registeredOn).toLocaleString() : '-'}`, 80, 255);
    doc.setTextColor(80, 80, 80);
    doc.text('Registered at:', 40, 265);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.registeredAt || '-'}`, 80, 265);
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 285);
    doc.text('Signature: ____________________', 140, 285);
    doc.save(`${deathRecord.firstName || 'Death'}_Report.pdf`);
  };

  // Add phoneIcon SVG from PatientProfile
  const phoneIcon = (
    <svg style={{verticalAlign:'middle',marginRight:6}} width="18" height="18" fill="none" stroke="#009688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h4.09a2 2 0 0 1 2 1.72c.13 1.13.37 2.23.72 3.28a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c1.05.35 2.15.59 3.28.72A2 2 0 0 1 22 16.92z"></path></svg>
  );

  return (
    <>
      <PageContainer>
        <SectionHeading title="Death Profile" subtitle="Death record details" />
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '1.5rem 2.5rem', margin: '2rem 0', minHeight: 400 }}>
          {/* Row 1: Name, Phone, Edit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 0 }}>
            <div style={{ minWidth: 80, minHeight: 80, background: '#f3f6fa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 600, color: '#b0b0b0' }}>
              {initials(deathRecord.firstName, deathRecord.lastName)}
            </div>
            <div style={{ fontWeight: 600, color: '#038ba4', fontSize: 18, flex: 1 }}>{deathRecord.firstName} {deathRecord.lastName}</div>
            <div style={{ color: '#009688', fontWeight: 600, fontSize: 16, flex: 1, display: 'flex', alignItems: 'center' }}>{phoneIcon}{deathRecord.mobileNo || '-'}</div>
            <button style={{ border: '1px solid #b0b0b0', borderRadius: 5, background: '#fff', padding: '6px 18px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => navigate(`/edit-death/${id}`)}>
              <img src={pencilIcon} alt="Edit" style={{ width: 18, height: 18, marginRight: 6 }} />
              Edit Profile
            </button>
          </div>
          {/* Row 2: Doctor, IP No, Date of Death, Gender */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, margin: '24px 0' }}>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>Date of Birth</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.dateOfBirth || '-'}</span></div>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>IP No</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.ipNo}</span></div>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>Date of Death</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.dateOfDeath}</span></div>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>Doctor Name</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.doctorName}</span></div>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>Gender</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.gender}</span></div>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>Age</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.dateOfBirth && deathRecord.dateOfDeath ? (new Date(deathRecord.dateOfDeath).getFullYear() - new Date(deathRecord.dateOfBirth).getFullYear()) : '-'}</span></div>
          </div>
          {/* Row 3: Cause of Death, Type, Postmortem, Pathologist, Place of Death */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: 24, marginBottom: 24 }}>
            <div><span style={{ color: '#888', fontSize: 13 }}>Cause of Death</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.causeOfDeath}</span></div>
            <div><span style={{ color: '#888', fontSize: 13 }}>Type</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.causeOfDeathType}</span></div>
            <div><span style={{ color: '#888', fontSize: 13 }}>Postmortem Done</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.postmortemDone}</span></div>
            <div><span style={{ color: '#888', fontSize: 13 }}>Pathologist Name</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.pathologistName}</span></div>
            <div><span style={{ color: '#888', fontSize: 13 }}>Place of Death</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.placeOfDeath}</span></div>
          </div>
          {/* Row 4: Death informed, Relatives */}
          <div style={{ display: 'flex', gap: 32, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#888', fontSize: 13 }}>Death First Informed Person</div>
              <div style={{ fontWeight: 600 }}>{deathRecord.deathInformedPerson}</div>
              <div style={{ color: '#888', fontSize: 13 }}>Contact</div>
              <div style={{ fontWeight: 600 }}>{deathRecord.deathInformedContact}</div>
              <div style={{ color: '#888', fontSize: 13 }}>Address</div>
              <div style={{ fontWeight: 600 }}>{deathRecord.deathInformedAddress}</div>
            </div>
            <div style={{ flex: 2 }}>
              <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>Relatives</div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {(deathRecord.relatives || []).map((rel: any, idx: number) => (
                  <li key={idx} style={{ marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{rel.name}</span> ({rel.relation}) - {rel.contact}, {rel.address}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Actions */}
        </div>
        {/* Bottom Section: Status, QR, Registration, Print Actions */}
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '1.5rem 2.5rem', margin: '2rem 0', minHeight: 120 }}>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#888', fontSize: 13 }}>Status</div>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>Discharged</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#888', fontSize: 13 }}>Scan QR</div>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(deathRecord.qrData || (window.location.origin + '/death-report/' + (deathRecord.id || id || '')) )}`} alt="QR Code" style={{ marginTop: 4, cursor: 'pointer' }} onClick={printDeathReport} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center', borderTop: '1px solid #eee', paddingTop: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#888', fontSize: 13 }}>Patient registered by</div>
              <div style={{ fontWeight: 700 }}>{deathRecord.registeredBy || '-'}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#888', fontSize: 13 }}>Patient registered on</div>
              <div style={{ fontWeight: 700 }}>{deathRecord.registeredOn ? new Date(deathRecord.registeredOn).toLocaleString() : '-'}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#888', fontSize: 13 }}>Patient registered at</div>
              <div style={{ fontWeight: 700 }}>{deathRecord.registeredAt || '-'}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', borderBottom: '1px solid #eee', paddingBottom: 2, marginBottom: 4, justifyContent: 'flex-end' }}>
                  <svg width="18" height="18" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>
                  <span style={{ color: '#888', fontSize: 13, fontWeight: 500 }}>Print Actions</span>
                </div>
                <div style={{ display: 'flex', gap: 24, marginTop: 4, width: '100%', justifyContent: 'flex-end' }}>
                  <a href="#" className="print-action-link" onClick={e => { e.preventDefault(); printDeathReport(); }}>Print Death Report</a>
                  <a href="#" className="print-action-link">Barcode</a>
                  <a href="#" className="print-action-link" onClick={e => { e.preventDefault(); alert('Move to mortuary action!'); }}>Move to Mortuary</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default DeathProfile; 