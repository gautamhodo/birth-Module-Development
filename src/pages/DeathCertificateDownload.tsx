import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DeathCertificateGenerator } from '../utils/DeathCertificateGenerator';

const DeathCertificateDownload: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<string>('Loading...');

  useEffect(() => {
    const downloadCertificate = async () => {
      try {
        setStatus('Fetching death record...');
        
        // Fetch death record data
        const deathResponse = await fetch(`http://192.168.50.171:5000/deathRecords/${id}`);
        if (!deathResponse.ok) {
          throw new Error('Death record not found');
        }
        const deathRecord = await deathResponse.json();

        setStatus('Generating certificate...');

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

        // Prepare death record data
        const deathRecordData = {
          fullName: deathRecord.fullName || `${deathRecord.firstName || ''} ${deathRecord.lastName || ''}`.trim(),
          gender: deathRecord.gender,
          dateOfDeath: deathRecord.dateOfDeath,
          deathId: deathRecord.deathId,
          ipNo: deathRecord.ipNo,
          age: calculatedAge,
          causeOfDeath: deathRecord.causeOfDeath || 'As per medical records',
          address: deathRecord.deathInformedAddress || deathRecord.address || 'Not Provided',
          dateOfBirth: deathRecord.dateOfBirth
        };

        // Generate and download certificate
        const generator = new DeathCertificateGenerator();
        await generator.generateAndDownloadCertificate(deathRecordData);

        setStatus('Certificate downloaded successfully!');
        
        // Redirect back to profile after a short delay
        setTimeout(() => {
          window.location.href = `/death-profile/${id}`;
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
        <h2 style={{ color: '#038ba4', marginBottom: '1rem' }}>Death Certificate Download</h2>
        <p style={{ color: '#666', fontSize: '16px' }}>{status}</p>
        
        {status.includes('Error') && (
          <button 
            onClick={() => window.location.href = `/death-profile/${id}`}
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

export default DeathCertificateDownload;