import React, { useState, useEffect } from 'react';
import '../styles/page.css';
import '../styles/Certificate.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import { Printer } from 'lucide-react';
import Searchbar from '../components/Searchbar';

interface PageProps {
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}

const Certificates: React.FC<PageProps> = ({ sidebarCollapsed = false, toggleSidebar }) => {
  const [type, setType] = useState<'birth' | 'death'>('birth');
  const [printCert, setPrintCert] = useState<any>(null);
  const [birthCertificates, setBirthCertificates] = useState<any[]>([]);
  const [deathCertificates, setDeathCertificates] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const handlePrint = (cert: any) => {
    setPrintCert(cert);
    setTimeout(() => {
      window.print();
      setPrintCert(null);
    }, 200);
  };

  useEffect(() => {
    fetch('/db.json')
      .then(res => res.json())
      .then(data => {
        setBirthCertificates(data.birthRecords || []);
        setDeathCertificates(data.deathRecords || []);
      });
  }, []);

  const filteredBirthCertificates = birthCertificates.filter(cert =>
    Object.values(cert).join(' ').toLowerCase().includes(search.toLowerCase())
  );
  const filteredDeathCertificates = deathCertificates.filter(cert =>
    Object.values(cert).join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator />
      <PageContainer>
        <SectionHeading title="Certificates" subtitle="View and manage all certificates" />
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2rem 0', gap: '1rem', alignItems: 'center', paddingLeft: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className={`btn-with-gradient${type === 'birth' ? '' : ' outline'}`}
              style={{ marginRight: '1rem' }}
              onClick={() => setType('birth')}
            >
              Birth Certificate
            </button>
            <button
              className={`btn-with-gradient${type === 'death' ? '' : ' outline'}`}
              onClick={() => setType('death')}
            >
              Death Certificate
            </button>
          </div>
          <div style={{ minWidth: 250 }}>
            <Searchbar value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="certificate-list-container">
          {type === 'birth' ? (
            <ul className="certificate-list">
              {filteredBirthCertificates.map((cert) => (
                <li key={cert.tokenNo} className="certificate-list-item">
                  <div>
                    <strong>{cert.firstName} {cert.lastName}</strong><br />
                    DOB: {cert.dateOfBirth} | Parent: {cert.parentName}
                  </div>
                  <div className="certificate-list-actions">
                    <button title="Print" onClick={() => handlePrint(cert)}><Printer size={20} /></button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="certificate-list">
              {filteredDeathCertificates.map((cert) => (
                <li key={cert.tokenNo} className="certificate-list-item">
                  <div>
                    <strong>{cert.firstName} {cert.lastName}</strong><br />
                    DOD: {cert.dateOfDeath} | Cause: {cert.causeOfDeath}
                  </div>
                  <div className="certificate-list-actions">
                    <button title="Print" onClick={() => handlePrint(cert)}><Printer size={20} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {printCert && (
          <div className="print-certificate-only">
            {type === 'birth' ? (
              <div className="birth-certificate-template" style={{
                width: '595px',
                height: '842px',
                background: '#fdf1e6',
                border: '6px double #c9a47a',
                padding: '40px 30px',
                margin: 'auto',
                fontFamily: 'serif',
                position: 'relative',
                boxSizing: 'border-box',
                color: '#7c5a36',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', pointerEvents: 'none' }}>
                  {/* Corners and border decorations can be added with absolutely positioned SVGs or images if needed */}
                </div>
                <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '40px' }}>
                  <div style={{ fontSize: '2.1rem', fontWeight: 600, letterSpacing: '2px', fontFamily: 'serif' }}>BIRTH CERTIFICATE</div>
                </div>
                <div style={{ fontSize: '1.1rem', textAlign: 'center', marginBottom: '30px' }}>
                  This Certifies that
                </div>
                <div style={{ borderBottom: '1.5px solid #7c5a36', width: '70%', margin: '0 auto 18px', fontSize: '1.2rem', textAlign: 'center', minHeight: '28px' }}>
                  {printCert.firstName} {printCert.middleName} {printCert.lastName}
                </div>
                <div style={{ fontSize: '1.1rem', textAlign: 'center', marginBottom: '18px' }}>
                  Was born to
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '18px' }}>
                  <div style={{ borderBottom: '1.5px solid #7c5a36', minWidth: '180px', textAlign: 'center', minHeight: '28px' }}>{printCert.parentName}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '18px', fontSize: '1.1rem' }}>
                  <span>On this</span>
                  <div style={{ borderBottom: '1.5px solid #7c5a36', minWidth: '60px', textAlign: 'center', minHeight: '28px' }}>{printCert.dateOfBirth ? new Date(printCert.dateOfBirth).getDate() : ''}</div>
                  <span>Day of</span>
                  <div style={{ borderBottom: '1.5px solid #7c5a36', minWidth: '100px', textAlign: 'center', minHeight: '28px' }}>{printCert.dateOfBirth ? new Date(printCert.dateOfBirth).toLocaleString('default', { month: 'long' }) : ''}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '18px', fontSize: '1.1rem' }}>
                  <span>In the year</span>
                  <div style={{ borderBottom: '1.5px solid #7c5a36', minWidth: '80px', textAlign: 'center', minHeight: '28px' }}>{printCert.dateOfBirth ? new Date(printCert.dateOfBirth).getFullYear() : ''}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '40px', fontSize: '1.1rem' }}>
                  <span>At</span>
                  <div style={{ borderBottom: '1.5px solid #7c5a36', minWidth: '320px', textAlign: 'center', minHeight: '28px' }}>{printCert.placeOfBirth}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', fontSize: '1.1rem' }}>
                  <div style={{ borderBottom: '1.5px solid #7c5a36', minWidth: '180px', textAlign: 'center', minHeight: '28px' }}></div>
                  <div style={{ borderBottom: '1.5px solid #7c5a36', minWidth: '180px', textAlign: 'center', minHeight: '28px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', marginTop: '8px' }}>
                  <span style={{ marginLeft: '18px' }}>Doctor on duty</span>
                  <span style={{ marginRight: '18px' }}>Medical officer</span>
                </div>
              </div>
            ) : (
              <div className="death-certificate-template" style={{
                width: '800px',
                height: '570px',
                background: '#fdf1e6',
                border: '4px solid #7c5a36',
                padding: '40px 50px',
                margin: 'auto',
                fontFamily: 'serif',
                position: 'relative',
                boxSizing: 'border-box',
                color: '#7c5a36',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', pointerEvents: 'none' }}>
                  {/* Border decorations can be added with SVGs or images if needed */}
                </div>
                <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '2.1rem', fontWeight: 600, letterSpacing: '2px', fontFamily: 'serif' }}>HOSPITAL DEATH CERTIFICATE</div>
                  <div style={{ fontSize: '1.1rem', marginTop: '8px', marginBottom: '18px', fontStyle: 'italic' }}>
                    This certifies that the information below is correct
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 500, fontFamily: 'cursive', margin: '18px 0 18px 0', color: '#6d3b2c' }}>
                    {printCert.firstName} {printCert.lastName}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '1.1rem', margin: '0 0 18px 0' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <span style={{ minWidth: '120px' }}>DATE OF BIRTH:</span>
                    <div style={{ borderBottom: '1.5px solid #7c5a36', minWidth: '220px', minHeight: '28px', textAlign: 'center' }}>{printCert.dateOfBirth || ''}</div>
                    <span style={{ minWidth: '120px', marginLeft: '40px' }}>DATE OF DEATH:</span>
                    <div style={{ borderBottom: '1.5px solid #7c5a36', minWidth: '220px', minHeight: '28px', textAlign: 'center' }}>{printCert.dateOfDeath || ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <span style={{ minWidth: '120px' }}>CAUSE OF DEATH:</span>
                    <div style={{ borderBottom: '1.5px solid #7c5a36', minWidth: '600px', minHeight: '28px', textAlign: 'center' }}>{printCert.causeOfDeath || ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <span style={{ minWidth: '120px' }}>ADDRESS:</span>
                    <div style={{ borderBottom: '1.5px solid #7c5a36', minWidth: '600px', minHeight: '28px', textAlign: 'center' }}>{printCert.permanentAddress || ''}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', fontSize: '1.1rem' }}>
                  <div style={{ borderBottom: '1.5px solid #7c5a36', minWidth: '180px', textAlign: 'center', minHeight: '28px' }}></div>
                  <div style={{ borderBottom: '1.5px solid #7c5a36', minWidth: '180px', textAlign: 'center', minHeight: '28px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', marginTop: '8px' }}>
                  <span style={{ marginLeft: '18px' }}>DATE</span>
                  <span style={{ marginRight: '18px' }}>SIGNED</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.95rem', color: '#bfa07a', marginTop: '10px' }}>TemplateLAB</div>
              </div>
            )}
          </div>
        )}
      </PageContainer>
      <Footer />
    </>
  );
};

export default Certificates;
