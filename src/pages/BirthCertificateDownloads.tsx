import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TemplateCertificateGenerator } from '../utils/TemplateCertificateGenerator';

const BirthCertificateDownload: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<string>('Loading...');

  useEffect(() => {
    const downloadCertificate = async () => {
      try {
        setStatus('Fetching birth record...');
        
        // Fetch birth record data
        const birthResponse = await fetch(`http://192.168.50.171:5000/birthRecords/${id}`);
        if (!birthResponse.ok) {
          throw new Error('Birth record not found');
        }
        const birthRecord = await birthResponse.json();

        setStatus('Fetching parent data...');
        
        // Fetch parent data if available
        let parentData = null;
        if (birthRecord.ParentDataId) {
          try {
            const parentResponse = await fetch(`http://192.168.50.171:5000/ParentData/${birthRecord.ParentDataId}`);
            if (parentResponse.ok) {
              parentData = await parentResponse.json();
            }
          } catch (error) {
            console.warn('Failed to fetch parent data:', error);
          }
        }

        setStatus('Generating certificate...');

        // Calculate Visit ID
        let visitId = '';
        if (birthRecord.dateOfBirth) {
          const date = new Date(birthRecord.dateOfBirth);
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          visitId = `${y}${m}${d}/${String(birthRecord.id).slice(-3)}`;
        }

        // Prepare birth record data
        const birthRecordData = {
          firstName: birthRecord.babyName || birthRecord.firstName,
          lastName: birthRecord.lastName || '',
          babyName: birthRecord.babyName || birthRecord.firstName,
          gender: birthRecord.gender,
          dateOfBirth: birthRecord.dateOfBirth,
          birthId: birthRecord.birthId || birthRecord.id,
          visitId: visitId,
          admittedDate: birthRecord.admittedDate
        };

        // Prepare parent data
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

        // Generate and download certificate
        const generator = new TemplateCertificateGenerator();
        await generator.generateAndDownloadCertificate(birthRecordData, parentDataForCert);

        setStatus('Certificate downloaded successfully!');
        
        // Redirect back to profile after a short delay
        setTimeout(() => {
          window.location.href = `/profile/patient/${id}`;
        }, 2000);

      } catch (error) {
        console.error('Error downloading certificate:', error);
        setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      }
    };

    if (id) {
      downloadCertificate();
    }
  }, [id]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{ 
        background: '#fff', 
        borderRadius: '10px', 
        padding: '2rem', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h2 style={{ color: '#038ba4', marginBottom: '1rem' }}>Birth Certificate Download</h2>
        <p style={{ color: '#666', fontSize: '16px' }}>{status}</p>
        
        {status.includes('Error') && (
          <button 
            onClick={() => window.location.href = `/profile/patient/${id}`}
            style={{
              marginTop: '1rem',
              padding: '10px 20px',
              background: '#038ba4',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Back to Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default BirthCertificateDownload;