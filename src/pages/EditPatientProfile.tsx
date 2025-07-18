import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import PageContainer from '../components/PageContainer';
import Input from '../components/Input';
import DateInput from '../components/DateInput';
import DropInput from '../components/DropInput';
import API_BASE from '../api/api.ts';


const tabStyle = {
  padding: '12px 32px',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  fontWeight: 600,
  fontSize: 18,
  borderBottom: '2px solid transparent',
  outline: 'none',
};

const activeTabStyle = {
  ...tabStyle,
  borderBottom: '2px solid #038ba4',
  color: '#038ba4',
};

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  fontSize: 16,
  border: '1px solid #ccc',
  borderRadius: 4,
  marginBottom: 16,
};

const labelStyle = {
  fontWeight: 500,
  marginBottom: 4,
  display: 'block',
};

// Update the main container and section styles to match DeathProfile
const sectionStyle = {
  background: '#fff',
  borderRadius: 10,
  boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
  padding: '1.5rem 2.5rem',
  margin: '2rem 0',
  minHeight: 400,
  maxWidth: 1400,
  width: '96vw',
};

const EditPatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'basic' | 'newborn'>('basic');
  const [loading, setLoading] = useState(true);
  const [birthRecord, setBirthRecord] = useState<any>(null);
  const [parentData, setParentData] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [newBornForm, setNewBornForm] = useState<any>({});

  useEffect(() => {
    setLoading(true);
    fetch('/db.json')
      .then(res => res.json())
      .then(data => {
        const record = (data.birthRecords || []).find((r: any) => String(r.id) === id);
        const parent = (data.ParentData || []).find((p: any) => p.id === record?.ParentDataId);
        setBirthRecord(record);
        setParentData(parent);
        setForm({
          firstName: record?.firstName || '',
          lastName: record?.lastName || '',
          gender: record?.gender || '',
          dateOfBirth: record?.dateOfBirth || '',
          placeOfBirth: record?.placeOfBirth || '',
          email: parent?.email || '',
          mobileNo: parent?.mobileNo || '',
          uhid: parent?.uhid || '',
          bloodGroup: parent?.bloodGroup || '',
          nationality: parent?.nationality || '',
          motherName: parent?.motherName || '',
          motherCondition: parent?.motherCondition || '',
        });
        setNewBornForm({
          weight: record?.weight || '',
          length: record?.length || '',
          headCircumference: record?.headCircumference || '',
          term: record?.term || '',
          deliveryType: record?.deliveryType || '',
          birthTime: record?.birthTime || '',
        });
        setLoading(false);
      });
  }, [id]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleNewBornChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewBornForm({ ...newBornForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Update birthRecords
    await fetch(`${API_BASE}/birthRecords/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...birthRecord,
        ...form,
        ...newBornForm,
        motherName: form.motherName,
      }),
    });
    // Update ParentData
    if (birthRecord.ParentDataId) {
      // Split motherName into firstName and lastName
      let motherFirstName = parentData.firstName;
      let motherLastName = parentData.lastName;
      if (form.motherName) {
        const parts = form.motherName.trim().split(' ');
        motherFirstName = parts[0] || '';
        motherLastName = parts.slice(1).join(' ') || '';
      }
      await fetch(`${API_BASE}/ParentData/${birthRecord.ParentDataId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parentData,
          email: form.email,
          mobileNo: form.mobileNo,
          uhid: form.uhid,
          bloodGroup: form.bloodGroup,
          nationality: form.nationality,
          motherName: form.motherName,
          motherCondition: form.motherCondition,
          firstName: motherFirstName,
          lastName: motherLastName,
        }),
      });
    }
    navigate(`/profile/birth/${id}`);
  };

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;

  return (
    <PageContainer>
      <SectionHeading title="Edit Patient Profile" subtitle="Update patient and new born details" />
      <div style={sectionStyle}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: 32 }}>
          <button style={tab === 'basic' ? activeTabStyle : tabStyle} onClick={() => setTab('basic')}>Basic Details</button>
          <button style={tab === 'newborn' ? activeTabStyle : tabStyle} onClick={() => setTab('newborn')}>New Born</button>
        </div>
        {tab === 'basic' && (
          <>
            <SectionHeading title="Basic Details" />
            <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div>
                <Input label="First Name" name="firstName" value={form.firstName} onChange={handleFormChange} placeholder="First Name" />
              </div>
              <div>
                <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleFormChange} placeholder="Last Name" />
              </div>
              <div>
                <DropInput
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleFormChange}
                  options={[
                    { label: 'Male', value: 'male' },
                    { label: 'Female', value: 'female' },
                    { label: 'Other', value: 'other' },
                  ]}
                />
              </div>
              <div>
                <DateInput label="Date of Birth" name="dateOfBirth" value={form.dateOfBirth} onChange={handleFormChange} />
              </div>
              <div>
                <Input label="Place of Birth" name="placeOfBirth" value={form.placeOfBirth} onChange={handleFormChange} placeholder="Place of Birth" />
              </div>
              <div>
                <Input label="Email" name="email" value={form.email} onChange={handleFormChange} placeholder="Email" />
              </div>
              <div>
                <Input label="Mobile No" name="mobileNo" value={form.mobileNo} onChange={handleFormChange} placeholder="Mobile No" />
              </div>
              <div>
                <Input label="UHID" name="uhid" value={form.uhid} onChange={handleFormChange} placeholder="UHID" />
              </div>
              <div>
                <DropInput
                  label="Blood Group"
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleFormChange}
                  options={[
                    { label: 'A+', value: 'A+' },
                    { label: 'A-', value: 'A-' },
                    { label: 'B+', value: 'B+' },
                    { label: 'B-', value: 'B-' },
                    { label: 'AB+', value: 'AB+' },
                    { label: 'AB-', value: 'AB-' },
                    { label: 'O+', value: 'O+' },
                    { label: 'O-', value: 'O-' },
                  ]}
                />
              </div>
              <div>
                <Input label="Nationality" name="nationality" value={form.nationality} onChange={handleFormChange} placeholder="Nationality" />
              </div>
              <div>
                <Input label="Mother's Name" name="motherName" value={form.motherName} onChange={handleFormChange} placeholder="Mother's Name" />
              </div>
              <div>
                <Input label="Mother's Medical Condition" name="motherCondition" value={form.motherCondition} onChange={handleFormChange} placeholder="Mother's Medical Condition" />
              </div>
            </form>
          </>
        )}
        {tab === 'newborn' && (
          <>
              <SectionHeading title="New Born Details" />



            <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div>
                <Input label="Weight (kg)" name="weight" value={newBornForm.weight} onChange={handleNewBornChange} placeholder="Weight (kg)" />
              </div>
              <div>
                <Input label="Length (cm)" name="length" value={newBornForm.length} onChange={handleNewBornChange} placeholder="Length (cm)" />
              </div>
              <div>
                <Input label="Head Circumference (cm)" name="headCircumference" value={newBornForm.headCircumference} onChange={handleNewBornChange} placeholder="Head Circumference (cm)" />
              </div>
              <div>
                <DropInput
                  label="Term"
                  name="term"
                  value={newBornForm.term}
                  onChange={handleNewBornChange}
                  options={[
                    { label: 'Full Term', value: 'Full Term' },
                    { label: 'Pre Term', value: 'Pre Term' },
                    { label: 'Post Term', value: 'Post Term' },
                  ]}
                />
              </div>
              <div>
                <DropInput
                  label="Delivery Type"
                  name="deliveryType"
                  value={newBornForm.deliveryType}
                  onChange={handleNewBornChange}
                  options={[
                    { label: 'Normal', value: 'Normal' },
                    { label: 'Cesarean', value: 'Cesarean' },
                    { label: 'Forceps', value: 'Forceps' },
                    { label: 'Vacuum', value: 'Vacuum' },
                  ]}
                />
              </div>
              <div>
                <Input label="Birth Time" name="birthTime" value={newBornForm.birthTime} onChange={handleNewBornChange} type="time" placeholder="Birth Time" />
              </div>
            </form>
          </>
        )}
        <div style={{ textAlign: 'right', marginTop: 32 }}>
          <button
            type="button"
            className="nav-list-button"
            style={{ border: 'none', borderRadius: 5, padding: '1px 32px', fontWeight: 500, fontSize: 16, cursor: 'pointer', color: '#fff' }}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </PageContainer>
  );
};

export default EditPatientProfile; 