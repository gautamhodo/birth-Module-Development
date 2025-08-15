import React, { useState } from 'react';

const QRTestPage: React.FC = () => {
  const [testId, setTestId] = useState('BIRTH123');
  const [qrType, setQrType] = useState<'birth' | 'death'>('birth');

  const generateQRUrl = (type: 'birth' | 'death', id: string) => {
    const baseUrl = window.location.origin;
    const targetUrl = type === 'birth' 
      ? `${baseUrl}/birth-certificate/${id}`
      : `${baseUrl}/death-certificate/${id}`;
    
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(targetUrl)}`;
  };

  const testQRCode = () => {
    const targetUrl = qrType === 'birth' 
      ? `${window.location.origin}/birth-certificate/${testId}`
      : `${window.location.origin}/death-certificate/${testId}`;
    
    console.log('QR Code Target URL:', targetUrl);
    window.open(targetUrl, '_blank');
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      background: '#fff',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ color: '#038ba4', marginBottom: '2rem' }}>QR Code Functionality Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Test Configuration</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <label>
            <input 
              type="radio" 
              value="birth" 
              checked={qrType === 'birth'} 
              onChange={(e) => setQrType(e.target.value as 'birth')}
            />
            Birth Certificate
          </label>
          <label>
            <input 
              type="radio" 
              value="death" 
              checked={qrType === 'death'} 
              onChange={(e) => setQrType(e.target.value as 'death')}
            />
            Death Certificate
          </label>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>Test ID: </label>
          <input 
            type="text" 
            value={testId} 
            onChange={(e) => setTestId(e.target.value)}
            style={{ 
              padding: '8px', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              marginLeft: '8px'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h3>Generated QR Code</h3>
          <div style={{ textAlign: 'center' }}>
            <img 
              src={generateQRUrl(qrType, testId)} 
              alt="Test QR Code" 
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={testQRCode}
            />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Click QR code to test functionality
            </p>
          </div>
        </div>

        <div>
          <h3>QR Code Details</h3>
          <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
            <p><strong>Type:</strong> {qrType === 'birth' ? 'Birth Certificate' : 'Death Certificate'}</p>
            <p><strong>Test ID:</strong> {testId}</p>
            <p><strong>Target URL:</strong></p>
            <code style={{ 
              display: 'block', 
              background: '#fff', 
              padding: '8px', 
              borderRadius: '4px',
              fontSize: '12px',
              wordBreak: 'break-all'
            }}>
              {qrType === 'birth' 
                ? `${window.location.origin}/birth-certificate/${testId}`
                : `${window.location.origin}/death-certificate/${testId}`
              }
            </code>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={testQRCode}
              style={{
                background: '#038ba4',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Test QR Functionality
            </button>
            
            <button 
              onClick={() => {
                const qrUrl = generateQRUrl(qrType, testId);
                window.open(qrUrl, '_blank');
              }}
              style={{
                background: '#666',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              View QR Image
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#e8f4f8', borderRadius: '8px' }}>
        <h4>How QR Code Works:</h4>
        <ol>
          <li>QR code is generated using qrserver.com API with the target URL</li>
          <li>When scanned, it redirects to: <code>/birth-certificate/[ID]</code> or <code>/death-certificate/[ID]</code></li>
          <li>These routes automatically fetch the record data and generate the certificate</li>
          <li>The certificate is downloaded automatically</li>
          <li>User is redirected back to the profile page</li>
        </ol>
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px' }}>
        <h4>Testing Notes:</h4>
        <ul>
          <li>Make sure the backend API is running on the correct port</li>
          <li>Test with actual record IDs from your database</li>
          <li>Check browser console for any errors</li>
          <li>Verify that the certificate download routes are properly configured</li>
        </ul>
      </div>
    </div>
  );
};

export default QRTestPage;