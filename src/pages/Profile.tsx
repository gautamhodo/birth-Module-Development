import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Profile: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/db.json')
      .then(res => res.json())
      .then(data => {
        let found;
        if (type === 'birth') {
          found = (data.birthRecords || []).find((r: any) => String(r.id) === id);
        } else if (type === 'death') {
          found = (data.deathRecords || []).find((r: any) => String(r.id) === id);
        }
        if (found) {
          setRecord(found);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      });
  }, [type, id]);

  if (loading) return <div style={{padding:32}}>Loading...</div>;
  if (notFound) return <div style={{padding:32, color:'red'}}>Profile not found.</div>;

  return (
    <div style={{ maxWidth: 900, margin: '3rem auto', background: '#fff', borderRadius: 18, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '3rem 2.5rem' }}>
      <h1 style={{ marginBottom: 40, color: '#038ba4', fontSize: 38, fontWeight: 700, letterSpacing: 1 }}>Profile Details</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, fontSize: 22, color: '#222' }}>
        {type === 'birth' ? (
          <>
            <div><strong>Name:</strong> <span style={{ fontWeight: 500 }}>{record.firstName} {record.middleName} {record.lastName}</span></div>
            <div><strong>Date of Birth:</strong> <span style={{ fontWeight: 500 }}>{record.dateOfBirth}</span></div>
            <div><strong>Gender:</strong> <span style={{ fontWeight: 500 }}>{record.gender}</span></div>
            <div><strong>Place of Birth:</strong> <span style={{ fontWeight: 500 }}>{record.placeOfBirth}</span></div>
            <div><strong>Parent Name:</strong> <span style={{ fontWeight: 500 }}>{record.parentName}</span></div>
            <div><strong>Address:</strong> <span style={{ fontWeight: 500 }}>{record.parentAddress}</span></div>
          </>
        ) : (
          <>
            <div><strong>Name:</strong> <span style={{ fontWeight: 500 }}>{record.firstName} {record.middleName} {record.lastName}</span></div>
            <div><strong>Date of Birth:</strong> <span style={{ fontWeight: 500 }}>{record.dateOfBirth}</span></div>
            <div><strong>Gender:</strong> <span style={{ fontWeight: 500 }}>{record.gender}</span></div>
            <div><strong>Permanent Address:</strong> <span style={{ fontWeight: 500 }}>{record.permanentAddress}</span></div>
            <div><strong>Cause of Death:</strong> <span style={{ fontWeight: 500 }}>{record.causeOfDeath}</span></div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile; 