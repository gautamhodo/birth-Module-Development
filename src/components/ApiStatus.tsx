import React, { useState, useEffect } from 'react';

const ApiStatus: React.FC = () => {
    const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [message, setMessage] = useState('Checking API connection...');

    useEffect(() => {
        const checkApiStatus = async () => {
            try {
                const response = await fetch('http://192.168.50.171:5000/test');
                if (response.ok) {
                    const data = await response.json();
                    setStatus('connected');
                    setMessage(`Connected - DB: ${data.dbTest}`);
                } else {
                    setStatus('error');
                    setMessage(`HTTP ${response.status}`);
                }
            } catch (error) {
                setStatus('error');
                setMessage('Connection failed');
            }
        };

        checkApiStatus();
        const interval = setInterval(checkApiStatus, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const statusStyles = {
        checking: { color: '#856404', backgroundColor: '#fff3cd' },
        connected: { color: '#155724', backgroundColor: '#d4edda' },
        error: { color: '#721c24', backgroundColor: '#f8d7da' }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            padding: '8px 12px',
            borderRadius: '4px',
            display:"none",
            fontSize: '12px',
            zIndex: 1000,
            ...statusStyles[status]
        }}>
            {/* API: {message} */}
        </div>
    );
};

export default ApiStatus;