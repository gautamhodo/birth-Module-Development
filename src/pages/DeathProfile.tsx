import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import { Printer, ArrowRightSquare } from 'lucide-react';

import jsPDF from 'jspdf';
import { getDeathRecords } from '../api/api';
import { DeathCertificateGenerator } from '../utils/DeathCertificateGenerator';

const DeathProfile: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [deathRecord, setDeathRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();
  const [deathId, setDeathId] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    fetch(`http://192.168.50.171:5000/deathRecords/${id}`)
      .then(res => res.json())
      .then(data => {
        console.log(data);

        if (data) {
          setDeathRecord(data);
          setNotFound(false);
          // If you want to set a formatted Death ID:
          setDeathId(`D${String(data.deathId).padStart(2, '0')}`);
          setLoading(false);
        } else {
          setNotFound(true);
        }
      })
  }, [id]);
  useEffect(() => {
    if (deathRecord) {
      console.log('Updated deathRecord:', deathRecord);
    }
  }, [deathRecord]);

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (notFound) return <div style={{ padding: 32, color: 'red' }}>Profile not found.</div>;

  // Helper for initials
  const initials = (first: string, last: string) => `${first?.[0]?.toUpperCase() || ''}${last?.[0]?.toUpperCase() || ''}`;

  const printDeathReport = async () => {
    if (!deathRecord) return;
    
    try {
      // Create death certificate generator
      const generator = new DeathCertificateGenerator();

      // Calculate age from dateOfBirth and dateOfDeath if available
      let calculatedAge = 'Not Provided';
      if (deathRecord.dateOfBirth && deathRecord.dateOfDeath) {
        const birthDate = new Date(deathRecord.dateOfBirth);
        const deathDate = new Date(deathRecord.dateOfDeath);
        const ageInYears = Math.floor((deathDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        calculatedAge = `${ageInYears} years`;
      } else if (deathRecord.age) {
        calculatedAge = typeof deathRecord.age === 'number' ? `${deathRecord.age} years` : deathRecord.age;
      }

      // Prepare death record data from profile
      const deathRecordData = {
        fullName: deathRecord.fullName || `${deathRecord.firstName || ''} ${deathRecord.lastName || ''}`.trim(),
        gender: deathRecord.gender,
        dateOfDeath: deathRecord.dateOfDeath,
        deathId: deathRecord.deathId,
        ipNo: deathRecord.ipNo,
        age: calculatedAge,
        causeOfDeath: deathRecord.causeOfDeath || 'As per medical records',
        address: deathRecord.deathInformedAddress || deathRecord.address || 'Not Provided',
        dateOfBirth: deathRecord.dateOfBirth // Pass dateOfBirth for reference
      };

      // Generate and download certificate
      await generator.generateAndDownloadCertificate(deathRecordData);

      // Log successful generation
      console.log('Death certificate generated successfully for:', deathRecordData.fullName);

    } catch (error) {
      console.error('Error generating death certificate:', error);
      
      if (error instanceof Error && error.name === 'DeathValidationError') {
        alert(
          'Certificate Validation Failed\n\n' +
          `${error.message}\n\n` +
          'Please check the record information and try again.'
        );
      } else if (error instanceof Error && error.name === 'DeathCertificateGenerationError') {
        alert(
          'Certificate Generation Failed\n\n' +
          `${error.message}\n\n` +
          'Please try again. If the problem persists, contact system administrator.'
        );
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(
          'Failed to Generate Certificate\n\n' +
          `Error: ${errorMessage}\n\n` +
          'Please try again. If the problem persists, contact system administrator.'
        );
      }
    }
  };

  // Add phoneIcon SVG from PatientProfile
  const phoneIcon = (
    <svg style={{ verticalAlign: 'middle', marginRight: 6 }} width="18" height="18" fill="none" stroke="#009688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h4.09a2 2 0 0 1 2 1.72c.13 1.13.37 2.23.72 3.28a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c1.05.35 2.15.59 3.28.72A2 2 0 0 1 22 16.92z"></path></svg>
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
            <div style={{ color: '#009688', fontWeight: 600, fontSize: 16, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
              <span style={{ color: '#888', fontSize: 13 }}>Name</span>
              <span style={{ fontWeight: 600, color: '#038ba4', fontSize: 18, flex: 1 }}>{deathRecord.firstName + ' ' + deathRecord.lastName}</span>
            </div>
            <div style={{ color: '#009688', fontWeight: 600, fontSize: 16, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
              <span style={{ color: '#888', fontSize: 13 }}>Mobile Number</span>
              <span style={{ display: 'flex', alignItems: 'center' }}>{phoneIcon}{deathRecord.mobileNumber || '-'}</span>
            </div>

          </div>
          {/* Row 2: Doctor, IP No, Date of Death, Gender */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, margin: '24px 0' }}>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>Date of Birth</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.dateOfBirth ? new Date(deathRecord.dateOfBirth).toISOString().split('T')[0] : '-'}</span></div>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>IP No</span><br /><span style={{ fontWeight: 600, color: '#038ba4' }}>{deathRecord.ipNo}</span></div>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>Death ID</span><br /><span style={{ fontWeight: 600 }}>{deathId}</span></div>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>Date of Death</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.dateOfDeath ? new Date(deathRecord.dateOfDeath).toISOString().split('T')[0] : '-'}</span></div>
            {/* <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>Gender</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.gender}</span></div> */}
            <div style={{ flex: 1 }}>
              <span style={{ color: '#888', fontSize: 13 }}>Gender</span><br />
              <span style={{ fontWeight: 600 }}>
                {Number(deathRecord.gender) === 1 ? 'Female' : Number(deathRecord.gender) === 2 ? 'Male' : 'Unknown'}
              </span>
            </div>

            <div style={{ flex: 1 }}>
              <span style={{ color: '#888', fontSize: 13 }}>Age</span><br />
              <span style={{ fontWeight: 600 }}>
                {deathRecord.dateOfBirth && deathRecord.dateOfDeath ? (() => {
                  const birthDate = new Date(deathRecord.dateOfBirth);
                  const deathDate = new Date(deathRecord.dateOfDeath);
                  let years = deathDate.getFullYear() - birthDate.getFullYear();
                  let months = deathDate.getMonth() - birthDate.getMonth();
                  
                  if (months < 0) {
                    years--;
                    months += 12;
                  }
                  
                  const ageStr = [];
                  if (years > 0) ageStr.push(`${years}yr`);
                  if (months > 0) ageStr.push(`${months}mon`);
                  
                  return ageStr.length > 0 ? ageStr.join(' ') : '0mon';
                })() : '-'}
              </span>
            </div>
          </div>
          {/* Row 3: Cause of Death, Type, Postmortem, Pathologist, Place of Death */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: 24, marginBottom: 24 }}>
            {/* <div><span style={{ color: '#888', fontSize: 13 }}>Cause of Death</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.causeOfDeath}</span></div> */}
            <div><span style={{ color: '#888', fontSize: 13 }}>Type</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.causeOfDeathType}</span></div>
            {/* <div><span style={{ color: '#888', fontSize: 13 }}>Postmortem Done</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.postmortemDone}</span></div>
            <div><span style={{ color: '#888', fontSize: 13 }}>Pathologist Name</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.pathologistName}</span></div> */}
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>Doctor Name</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.doctorName || '-'}</span></div>

            <div><span style={{ color: '#888', fontSize: 13 }}>Place of Death</span><br /><span style={{ fontWeight: 600 }}>{deathRecord.placeOfDeath}</span></div>
          </div>
          {/* Row 4: Death informed, Relatives */}
          <div style={{ display: 'flex', gap: 32, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              {/* <div style={{ color: '#888', fontSize: 13 }}>Death First Informed Person</div>
              <div style={{ fontWeight: 600 }}>{deathRecord.deathInformedPerson}</div> */}
              <div style={{ color: '#888', fontSize: 13 }}>Relative Contact</div>
              <div style={{ fontWeight: 600 }}>{deathRecord.deathInformedContact}</div>
              {/* <div style={{ color: '#888', fontSize: 13 }}>Address</div>
              <div style={{ fontWeight: 600 }}>{deathRecord.deathInformedAddress}</div> */}
            </div>
            <div style={{ flex: 2 }}>
              <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>Relative Name</div>
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
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(window.location.origin + '/death-certificate/' + (deathRecord.deathId || id || ''))}`} alt="QR Code" style={{ marginTop: 4, cursor: 'pointer' }} onClick={printDeathReport} />
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
                  <svg width="18" height="18" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></svg>
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

