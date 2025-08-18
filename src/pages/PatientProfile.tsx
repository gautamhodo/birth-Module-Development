import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';

import babyIcon from '../assets/baby.png';
import jsPDF from 'jspdf';
import { TemplateCertificateGenerator, ValidationError, CertificateGenerationError } from '../utils/TemplateCertificateGenerator';
// import html2canvas from 'html2canvas';

// sample

const phoneIcon = (
  <svg style={{ verticalAlign: 'middle', marginRight: 6 }} width="18" height="18" fill="none" stroke="#009688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h4.09a2 2 0 0 1 2 1.72c.13 1.13.37 2.23.72 3.28a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c1.05.35 2.15.59 3.28.72A2 2 0 0 1 22 16.92z"></path></svg>
);
const emailIcon = (
  <svg style={{ verticalAlign: 'middle', marginRight: 6 }} width="18" height="18" fill="none" stroke="#038ba4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,6 12,13 2,6" /></svg>
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
    fetch(`http://192.168.50.171:5000/birthRecords/${id}`)
      .then(res => res.json())
      .then(record => {
        if (record && record.ParentDataId) {
          setBirthRecord(record);
          fetch(`http://192.168.50.171:5000/ParentData/${record.ParentDataId}`)
            .then(res => res.json())
            .then(parent => {
              setParentData(parent);
              setNotFound(false);
              // Calculate Visit ID (YYYYMMDD/NNN) - fallback to record.id only
              let visit = '';
              if (record.dateOfBirth) {
                const date = new Date(record.dateOfBirth);
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                visit = `${y}${m}${d}/${String(record.id).slice(-3)}`;
              }
              setVisitId(visit);
              setLoading(false);
            })
            .catch(() => {
              setParentData(null);
              setLoading(false);
            });
        } else if (record) {
          setBirthRecord(record);
          setParentData(null);
          setNotFound(false);
          setLoading(false);
        } else {
          setNotFound(true);
          setLoading(false);
        }
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (notFound) return <div style={{ padding: 32, color: 'red' }}>Profile not found.</div>;

  // Helper for initials
  const initials = (first: string, last: string) => `${first?.[0]?.toUpperCase() || ''}${last?.[0]?.toUpperCase() || ''}`;

  const downloadBirthReport = async () => {
    try {
      // Enhanced error handling for missing data scenarios
      // Requirements: 3.5 - Comprehensive data validation and user-friendly error messages
      if (!birthRecord) {
        showUserFriendlyError(
          'Birth Record Missing',
          'Birth record data is not available. Please refresh the page and try again.',
          'If the problem persists, contact system administrator.'
        );
        return;
      }

      // Handle cases where parentData might be null or incomplete
      // Requirements: 3.5 - Handle cases where parentData might be null or incomplete
      if (!parentData) {
        const proceedWithoutParent = confirm(
          'click ok to proceed '
        );
        if (!proceedWithoutParent) {
          return;
        }
        // showUserFriendlyError(
        //   'Parent Data Missing',
        //   'Parent data is not available. Please refresh the page and try again.',
        //   'If the problem persists, contact system administrator.'
        // );
      }

      // Pre-validate critical data before attempting generation
      const validationResult = validateCertificateData(birthRecord, parentData);
      if (!validationResult.canProceed) {
        if (validationResult.criticalErrors.length > 0) {
          showCriticalDataError(validationResult.criticalErrors);
          return;
        }
        
        if (validationResult.warnings.length > 0) {
          const proceedWithWarnings = confirm(
            `The following information is missing or incomplete:\n\n${validationResult.warnings.join('\n')}\n\n` +
            'The certificate will be generated with default values for missing information.\n\n' +
            'Do you want to proceed?'
          );
          if (!proceedWithWarnings) {
            return;
          }
        }
      }

      // Create enhanced template certificate generator instance
      const generator = new TemplateCertificateGenerator();

      // Prepare birth record data for certificate generation with enhanced validation
      // Requirements: 1.1, 3.5 - Integration with existing birth record and parent data
      const birthRecordData = {
        firstName: birthRecord.babyName || birthRecord.firstName,
        lastName: birthRecord.lastName || '',
        babyName: birthRecord.babyName || birthRecord.firstName,
        gender: birthRecord.gender,
        dateOfBirth: birthRecord.dateOfBirth,
        birthId: birthRecord.birthId || visitId,
        visitId: visitId,
        admittedDate: birthRecord.admittedDate
      };

      // Prepare parent data for certificate generation (handle null case)
      const parentDataForCert = parentData ? {
        firstName: parentData.firstName || '',
        lastName: parentData.lastName || '',
        nationality: parentData.nationality || '',
        address: parentData.address || parentData.nationality || ''
      } : {
        firstName: '',
        lastName: '',
        nationality: '',
        address: ''
      };

      // Generate the professional birth certificate with enhanced error handling
      // Requirements: 1.1, 3.5 - Generate PDF birth certificate using template with comprehensive validation
      await generator.generateAndDownloadCertificate(birthRecordData, parentDataForCert);

      // Log successful generation for debugging
      const babyName = birthRecord.babyName || birthRecord.firstName;
      console.log('Birth certificate generated successfully for:', babyName);

    } catch (error) {
      // Enhanced error handling with specific error types
      // Requirements: 3.5 - Handle PDF generation failures gracefully with user-friendly messages
      console.error('Error generating birth certificate:', error);
      
      if (error instanceof Error && error.name === 'ValidationError') {
        // Handle validation errors specifically
        showValidationError(error);
      } else if (error instanceof Error && error.name === 'CertificateGenerationError') {
        // Handle certificate generation errors
        showGenerationError(error);
      } else {
        // Handle unexpected errors
        showUnexpectedError(error);
      }
    }
  };

  /**
   * Validate certificate data before generation
   * Requirements: 3.5 - Validate required fields before certificate generation
   */
  const validateCertificateData = (birthRecord: any, parentData: any) => {
    const criticalErrors: string[] = [];
    const warnings: string[] = [];

    // Critical field validation
    const babyName = birthRecord?.babyName || birthRecord?.firstName;
    if (!babyName?.trim()) {
      criticalErrors.push('Baby name is required');
    }

    if (!birthRecord?.dateOfBirth?.trim()) {
      criticalErrors.push('Date of birth is required');
    }

    // Optional field warnings
    if (!parentData) {
      warnings.push('• Parent information is missing');
    } else {
      const parentName = parentData.firstName || parentData.lastName;
      if (!parentName?.trim()) {
        warnings.push('• Parent name is missing');
      }
      if (!parentData.address?.trim() && !parentData.nationality?.trim()) {
        warnings.push('• Parent address information is missing');
      }
    }

    if (!birthRecord?.gender) {
      warnings.push('• Gender information is missing');
    }

    if (!birthRecord?.birthId && !birthRecord?.visitId) {
      warnings.push('• Registration number is missing');
    }

    return {
      canProceed: criticalErrors.length === 0,
      criticalErrors,
      warnings
    };
  };

  /**
   * Show user-friendly error dialog
   * Requirements: 3.5 - Display user-friendly error messages
   */
  const showUserFriendlyError = (title: string, message: string, suggestion?: string) => {
    const fullMessage = suggestion ? `${message}\n\n${suggestion}` : message;
    alert(`${title}\n\n${fullMessage}`);
  };

  /**
   * Show critical data error dialog
   * Requirements: 3.5 - Display user-friendly error messages for critical missing data
   */
  const showCriticalDataError = (criticalErrors: string[]) => {
    alert(
      'Cannot Generate Certificate\n\n' +
      'The following critical information is missing:\n\n' +
      criticalErrors.map(error => `• ${error}`).join('\n') + '\n\n' +
      'Please update the patient profile with complete information before generating the certificate.'
    );
  };

  /**
   * Show validation error dialog
   * Requirements: 3.5 - Handle validation errors with user-friendly messages
   */
  const showValidationError = (error: Error) => {
    alert(
      'Certificate Validation Failed\n\n' +
      `${error.message}\n\n` +
      'Please check the patient information and try again.'
    );
  };

  /**
   * Show generation error dialog with fallback options
   * Requirements: 3.5 - Handle generation errors with fallback options
   */
  const showGenerationError = (error: Error) => {
    const useBasicReport = confirm(
      'Certificate Generation Failed\n\n' +
      `${error.message}\n\n` +
      'Would you like to generate a basic birth report instead?'
    );
    
    if (useBasicReport) {
      generateBasicBirthReport();
    }
  };

  /**
   * Show unexpected error dialog
   * Requirements: 3.5 - Handle unexpected errors gracefully
   */
  const showUnexpectedError = (error: any) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    const tryAgain = confirm(
      'Unexpected Error\n\n' +
      `An unexpected error occurred: ${errorMessage}\n\n` +
      'Would you like to try again?'
    );
    
    if (tryAgain) {
      // Retry after a short delay
      setTimeout(() => {
        downloadBirthReport();
      }, 1000);
    }
  };

  // Fallback function for basic birth report generation
  // Requirements: 3.4 - Provide fallback options for missing optional data
  const generateBasicBirthReport = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setFont('helvetica');
      
      // Simple white background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, 'F');
      
      // Basic border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1);
      doc.rect(10, 10, 190, 277, 'S');
      
      // Title
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text('BASIC BIRTH REPORT', 105, 30, { align: 'center' });
      
      // Hospital name
      doc.setFontSize(12);
      doc.text('HODO HOSPITAL, KAZHAKOOTTAM', 105, 45, { align: 'center' });
      
      // Basic information
      let yPos = 70;
      const addBasicField = (label: string, value: string) => {
        doc.setFontSize(10);
        doc.text(`${label}: ${value || 'Not Available'}`, 20, yPos);
        yPos += 10;
      };
      
      addBasicField('Baby Name', birthRecord?.babyName || birthRecord?.firstName || '');
      addBasicField('Date of Birth', birthRecord?.dateOfBirth || '');
      addBasicField('Gender', birthRecord?.gender || '');
      addBasicField('Parent Name', parentData ? `${parentData.firstName || ''} ${parentData.lastName || ''}`.trim() : '');
      addBasicField('Visit ID', visitId || birthRecord?.birthId || '');
      
      // Footer
      doc.setFontSize(8);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 270);
      doc.text('Basic Report - For detailed certificate, ensure all data is complete', 20, 280);
      
      // Proper filename generation with baby name
      // Requirements: 3.5 - Implement proper filename generation with baby name
      const babyName = birthRecord?.babyName || birthRecord?.firstName || 'Baby';
      const sanitizedName = babyName.replace(/[^a-zA-Z0-9]/g, '_');
      const timestamp = new Date().toISOString().slice(0, 10);
      doc.save(`${sanitizedName}_Basic_Report_${timestamp}.pdf`);
      
    } catch (fallbackError) {
      console.error('Error generating basic report:', fallbackError);
      alert('Unable to generate any report. Please contact system administrator.');
    }
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
              {initials(birthRecord.babyName, birthRecord.lastName)}
            </div>
            <div style={{ color: '#009688', fontWeight: 600, fontSize: 16, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
              <span style={{ color: '#888', fontSize: 13 }}>Name</span>
              <span style={{ fontWeight: 600, color: '#038ba4', fontSize: 16, flex: 1 }}>{birthRecord.babyName || '-'}</span>
            </div>
            <div style={{ color: '#009688', fontWeight: 600, fontSize: 16, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
              <span style={{ color: '#888', fontSize: 13 }}>Mobile Number</span>
              <span style={{ display: 'flex', alignItems: 'center' }}>{phoneIcon}{birthRecord.mobileNo || '-'}</span>
            </div>
            {/* Visit ID column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
              <span style={{ color: '#888', fontSize: 13 }}>Visit ID</span>
              <span style={{ color: '#038ba4', fontWeight: 500, fontSize: 16 }}>{birthRecord.birthId}</span>
            </div>
            {/* <div style={{ color: '#444', fontWeight: 500, fontSize: 16, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
              <span style={{ color: '#888', fontSize: 13 }}>Email ID</span>
              <span style={{ display: 'flex', alignItems: 'center' }}>{emailIcon}{parentData?.email || '-'}</span>
            </div> */}

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
            {/* <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>Age & Gender</span><br /><span style={{ fontWeight: 600 }}>{parentData?.dateOfBirth ? `${new Date().getFullYear() - new Date(parentData.dateOfBirth).getFullYear()} yrs,` : ''} {parentData?.gender || birthRecord.gender}</span></div> */}
            <div style={{ flex: 1 }}>
              <span style={{ color: '#888', fontSize: 13 }}>Age & Gender</span><br />
              <span style={{ fontWeight: 600 }}>
                {birthRecord.dateOfBirth ? (() => {
                  const birthDate = new Date(birthRecord.dateOfBirth);
                  const today = new Date();
                  let years = today.getFullYear() - birthDate.getFullYear();
                  let months = today.getMonth() - birthDate.getMonth();
                  
                  if (months < 0) {
                    years--;
                    months += 12;
                  }
                  
                  const ageStr = [];
                  if (years > 0) ageStr.push(`${years}yr`);
                  if (months > 0) ageStr.push(`${months}mon`);
                  
                  return ageStr.length > 0 ? `${ageStr.join(' ')}, ` : '';
                })() : ''}
                {
                  (() => {
                    const genderValue = birthRecord.gender;
                    const genderNum = Number(genderValue);
                    return genderNum === 1 ? 'Female' : genderNum === 2 ? 'Male' : 'Unknown';
                  })()
                }
              </span>
            </div>

            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>UHID</span><br /><span style={{ fontWeight: 700, color: 'red', fontSize: 15 }}>{parentData?.uhid}</span></div>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>Address</span><br /><span style={{ fontWeight: 600 }}>{parentData?.nationality}</span></div>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>IP No</span><br /><span style={{ fontWeight: 600 }}>{birthRecord.ipNumber}</span></div>
          </div>
          {/* Row 3: (removed, as UHID and Birth ID are now in Row 2) */}
          {/* Row 4: Birth details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: 24, marginBottom: 24 }}>
            <div><span style={{ color: '#888', fontSize: 13 }}>Date of Birth</span><br /><span style={{ fontWeight: 600 }}>{birthRecord.dateOfBirth ? new Date(birthRecord.dateOfBirth).toISOString().split('T')[0] : '-'}</span></div>
            <div><span style={{ color: '#888', fontSize: 13 }}>Remarks</span><br /><span style={{ fontWeight: 600 }}>{birthRecord.remarks}</span></div>
            {/* Removed Age column */}
            {/* <div><span style={{ color: '#888', fontSize: 13 }}>Father Name</span><br /><span style={{ fontWeight: 600 }}>{birthRecord.fatherName}</span></div> */}
            <div><span style={{ color: '#888', fontSize: 13 }}>Internal Comments</span><br /><span style={{ fontWeight: 600 }}>{parentData?.motherCondition || '-'}</span></div>
            <div><span style={{ color: '#888', fontSize: 13 }}>Consulting Doctor</span><br /><span style={{ fontWeight: 600 }}>{parentData?.doctor || '-'}</span></div>
            <div><span style={{ color: '#888', fontSize: 13 }}>Admitted Date</span><br /><span style={{ fontWeight: 600 }}>{birthRecord.admittedDate ? new Date(birthRecord.admittedDate).toISOString().split('T')[0] : '-'}</span></div>
            <div style={{ flex: 1 }}><span style={{ color: '#888', fontSize: 13 }}>Blood Group</span><br /><span style={{ fontWeight: 600 }}>{birthRecord.bloodGroup || '-'}</span></div>
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
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(window.location.origin + '/birth-certificate/' + (birthRecord.birthId || id || ''))}`} alt="QR Code" style={{ marginTop: 4, cursor: 'pointer' }} onClick={downloadBirthReport} />
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
                  <svg width="18" height="18" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></svg>
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