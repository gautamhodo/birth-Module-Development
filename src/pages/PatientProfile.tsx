import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import pencilIcon from '../assets/pencil.png';
import babyIcon from '../assets/baby.png';
import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

// sample

const phoneIcon = (
  <svg style={{verticalAlign:'middle',marginRight:6}} width="18" height="18" fill="none" stroke="#009688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h4.09a2 2 0 0 1 2 1.72c.13 1.13.37 2.23.72 3.28a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c1.05.35 2.15.59 3.28.72A2 2 0 0 1 22 16.92z"></path></svg>
);
const emailIcon = (
  <svg style={{verticalAlign:'middle',marginRight:6}} width="18" height="18" fill="none" stroke="#038ba4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>
);

interface PatientProfileProps {
  id?: string | number;
  isModal?: boolean;
  onClose?: () => void;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ id: propId, isModal = false, onClose }) => {
  const params = useParams<{ id: string }>();
  const id = propId || params.id;
  const [birthRecord, setBirthRecord] = useState<any>(null);
  const [parentData, setParentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showNewBornDetails, setShowNewBornDetails] = useState(false);
  const [visitId, setVisitId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch('/db.json')
      .then(res => res.json())
      .then(data => {
        const record = (data.birthRecords || []).find((r: any) => String(r.id) === id);
        if (record) {
          setBirthRecord(record);
          const parent = (data.ParentData || []).find((p: any) => p.id === record.ParentDataId);
          setParentData(parent);
          setNotFound(false);
          // Calculate Visit ID (YYYYMMDD/NNN)
          const allRecords = data.birthRecords || [];
          const idx = allRecords.findIndex((r: any) => String(r.id) === id);
          let visit = '';
          if (record.dateOfBirth) {
            const date = new Date(record.dateOfBirth);
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            visit = `${y}${m}${d}/${String(idx + 1).padStart(3, '0')}`;
          }
          setVisitId(visit);
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

  const downloadBirthReport = () => {
    if (!birthRecord || !parentData) return;
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
    doc.text(`${birthRecord.firstName || ''} ${birthRecord.lastName || ''}`, 105, 52, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text('was born to', 105, 62, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text(`Mother: ${parentData.firstName || ''} ${parentData.lastName || ''}`, 105, 72, { align: 'center' });
    doc.text(`Father: ${birthRecord.fatherName || '-'}`, 105, 80, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text('On', 40, 95);
    doc.setTextColor(44, 62, 80);
    doc.text(`${birthRecord.dateOfBirth || '-'}`, 60, 95);
    doc.setTextColor(80, 80, 80);
    doc.text('at', 100, 95);
    doc.setTextColor(44, 62, 80);
    doc.text(`${birthRecord.placeOfBirth || '-'}`, 110, 95);
    doc.setTextColor(80, 80, 80);
    doc.text('Gender:', 40, 105);
    doc.setTextColor(44, 62, 80);
    doc.text(`${birthRecord.gender || '-'}`, 60, 105);
    doc.setTextColor(80, 80, 80);
    doc.text('Weight:', 100, 105);
    doc.setTextColor(44, 62, 80);
    doc.text(`${birthRecord.weight || '-'} kg`, 120, 105);
    doc.setTextColor(80, 80, 80);
    doc.text('Blood Group:', 40, 115);
    doc.setTextColor(44, 62, 80);
    doc.text(`${parentData.bloodGroup || '-'}`, 75, 115);
    doc.setTextColor(80, 80, 80);
    doc.text('UHID:', 100, 115);
    doc.setTextColor(255, 0, 0);
    doc.text(`${parentData.uhid || '-'}`, 120, 115);
    doc.setTextColor(80, 80, 80);
    doc.text('Consulting Doctor:', 40, 125);
    doc.setTextColor(44, 62, 80);
    doc.text(`${parentData.doctor || '-'}`, 90, 125);
    doc.setTextColor(80, 80, 80);
    doc.text('Civil ID:', 40, 135);
    doc.setTextColor(44, 62, 80);
    doc.text(`${parentData.civilIds || '-'}`, 70, 135);
    doc.setTextColor(80, 80, 80);
    doc.text('Registered at:', 100, 135);
    doc.setTextColor(44, 62, 80);
    doc.text(`${birthRecord.registeredAt || '-'}`, 140, 135);
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 285);
    doc.text('Signature: ____________________', 140, 285);
    doc.save(`${birthRecord.firstName || 'Birth'}_Report.pdf`);
  };

  return (
    <>
      {/* <Header /> */}
      <PageContainer>
        <SectionHeading title="Patient Profile" subtitle="Birth Registered profile">
          {/* <img src="/src/assets/patient-profile-heading.png" alt="Patient Profile Heading" style={{marginTop: 4, marginBottom: 4, maxWidth: '100%'}} /> */}
        </SectionHeading>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '1.5rem 2.5rem', margin: '2rem 0', minHeight: 400 }} id="birth-report-profile">
          {/* Row 1: Name, Phone, Email, Edit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 0 }}>
            <div style={{ minWidth: 80, minHeight: 80, background: '#f3f6fa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 600, color: '#b0b0b0' }}>
              {initials(birthRecord.firstName, birthRecord.lastName)}
            </div>
            <div style={{ fontWeight: 600, color: '#038ba4', fontSize: 18, flex: 1 }}>{birthRecord.firstName} {birthRecord.lastName}</div>
            <div style={{ color: '#009688', fontWeight: 600, fontSize: 16, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
              <span style={{ color: '#888', fontSize: 13 }}>Mobile Number</span>
              <span style={{ display: 'flex', alignItems: 'center' }}>{phoneIcon}{parentData?.mobileNo || '-'}</span>
            </div>
            {/* Visit ID column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
              <span style={{ color: '#888', fontSize: 13 }}>Visit ID</span>
              <span style={{ color: '#038ba4', fontWeight: 500, fontSize: 16 }}>{visitId}</span>
            </div>
            <div style={{ color: '#444', fontWeight: 500, fontSize: 16, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
              <span style={{ color: '#888', fontSize: 13 }}>Email ID</span>
              <span style={{ display: 'flex', alignItems: 'center' }}>{emailIcon}{parentData?.email || '-'}</span>
            </div>
            <button style={{ border: '1px solid #b0b0b0', borderRadius: 5, background: '#fff', padding: '6px 18px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => navigate(`/edit-patient/${id}`)}>
              <img src={pencilIcon} alt="Edit" style={{ width: 18, height: 18, marginRight: 6 }} />
              Edit Patient Profile
            </button>
          </div>
          {/* New Born Details (expandable) below edit, right aligned */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', margin: '12px 0 16px 0' }}>
              <button onClick={() => setShowNewBornDetails(v => !v)} style={{ border: '1px solid #b0b0b0', borderRadius: 5, background: '#f8fafc', padding: '8px 18px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={babyIcon} alt="New Born" style={{ width: 18, height: 18, marginRight: 6 }} />
              New Born Details {showNewBornDetails ? '▲' : '▼'}
              </button>
              {showNewBornDetails && (
                <div style={{ background: '#fff', border: '1.5px solid #fff', borderRadius: 8, padding: '1.5rem 2.5rem', marginLeft: 12, minWidth: 320, width: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                    <div><span style={{ color: '#888', fontSize: 13 }}>Mother Name</span><br /><span style={{ fontWeight: 600 }}>{birthRecord.motherName}</span></div>
                    <div><span style={{ color: '#888', fontSize: 13 }}>Weight</span><br /><span style={{ fontWeight: 600 }}>{birthRecord.weight} Kg</span></div>
                    <div><span style={{ color: '#888', fontSize: 13 }}>Birth Time</span><br /><span style={{ fontWeight: 600 }}>{birthRecord.birthTime}</span></div>
                    <div><span style={{ color: '#888', fontSize: 13 }}>Delivery Type</span><br /><span style={{ fontWeight: 600 }}>{birthRecord.deliveryType}</span></div>
                    <div><span style={{ color: '#888', fontSize: 13 }}>Length</span><br /><span style={{ fontWeight: 600 }}>{birthRecord.length} cm</span></div>
                    <div><span style={{ color: '#888', fontSize: 13 }}>Term</span><br /><span style={{ fontWeight: 600 }}>{birthRecord.term}</span></div>
                    <div><span style={{ color: '#888', fontSize: 13 }}>Head Circumference</span><br /><span style={{ fontWeight: 600 }}>{birthRecord.headCircumference} cm</span></div>
                  </div>
                </div>
              )}
          </div>
          {/* Row 2: Age & Gender, UHID, Address, Birth ID, Blood Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 16 }}>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>Age & Gender</span><br /><span style={{ fontWeight: 600 }}>{parentData?.dateOfBirth ? `${new Date().getFullYear() - new Date(parentData.dateOfBirth).getFullYear()} yrs,` : ''} {parentData?.gender || birthRecord.gender}</span></div>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>UHID</span><br /><span style={{ fontWeight: 700, color: 'red', fontSize: 15 }}>{parentData?.uhid}</span></div>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>Address</span><br /><span style={{ fontWeight: 600 }}>{parentData?.nationality}</span></div>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>Birth ID</span><br /><span style={{ fontWeight: 600 }}>{birthRecord.id}</span></div>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>Blood Group</span><br /><span style={{ fontWeight: 600 }}>{parentData?.bloodGroup || '-'}</span></div>
          </div>
          {/* Row 3: (removed, as UHID and Birth ID are now in Row 2) */}
          {/* Row 4: Birth details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: 24, marginBottom: 24 }}>
            <div><span style={{ color: '#888', fontSize: 13 }}>Date of Birth</span><br /><span style={{ fontWeight: 600 }}>{birthRecord.dateOfBirth}</span></div>
            <div><span style={{ color: '#888', fontSize: 13 }}>Place of Birth</span><br /><span style={{ fontWeight: 600 }}>{birthRecord.placeOfBirth}</span></div>
            {/* Removed Age column */}
            <div><span style={{ color: '#888', fontSize: 13 }}>Father Name</span><br /><span style={{ fontWeight: 600 }}>{birthRecord.fatherName}</span></div>
            <div><span style={{ color: '#888', fontSize: 13 }}>Consulting Doctor</span><br /><span style={{ fontWeight: 600 }}>{parentData?.doctor}</span></div>
            <div><span style={{ color: '#888', fontSize: 13 }}>Civil ID</span><br /><span style={{ fontWeight: 600 }}>{parentData?.civilIds}</span></div>
            <div><span style={{ color: '#888', fontSize: 13 }}>Mother's Medical Condition</span><br /><span style={{ fontWeight: 600 }}>{parentData?.motherCondition || '-'}</span></div>
          </div>
        </div>
        {/* Bottom Section: Status, QR, Registration, Print Actions */}
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '1.5rem 2.5rem', margin: '2rem 0', minHeight: 120 }}>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#888', fontSize: 13 }}>Status</div>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>{birthRecord.status || '-'}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#888', fontSize: 13 }}>Scan QR</div>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(birthRecord.qrData || (window.location.origin + '/birth-report/' + (birthRecord.id || id || '')) )}`} alt="QR Code" style={{ marginTop: 4, cursor: 'pointer' }} onClick={downloadBirthReport} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center', borderTop: '1px solid #eee', paddingTop: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#888', fontSize: 13 }}>Patient registered by</div>
              <div style={{ fontWeight: 700 }}>{birthRecord.registeredBy || '-'}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#888', fontSize: 13 }}>Patient registered on</div>
              <div style={{ fontWeight: 700 }}>{birthRecord.registeredOn ? new Date(birthRecord.registeredOn).toLocaleString() : '-'}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#888', fontSize: 13 }}>Patient registered at</div>
              <div style={{ fontWeight: 700 }}>{birthRecord.registeredAt || '-'}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', borderBottom: '1px solid #eee', paddingBottom: 2, marginBottom: 4, justifyContent: 'flex-end' }}>
                  <svg width="18" height="18" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>
                  <span style={{ color: '#888', fontSize: 13, fontWeight: 500 }}>Print Actions</span>
                </div>
                <div style={{ display: 'flex', gap: 24, marginTop: 4, width: '100%', justifyContent: 'flex-end' }}>
                  <a href="#" className="print-action-link" onClick={e => { e.preventDefault(); downloadBirthReport(); }}>Print Birth Report</a>
                  <a href="#" className="print-action-link">Barcode</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
      {/* <Footer /> */}
    </>
  );
};

export default PatientProfile; 