import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import PageContainer from '../components/PageContainer';
import Input from '../components/Input';
import DateInput from '../components/DateInput';
import DropInput from '../components/DropInput';
import API_BASE from '../api/api.ts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const EditDeathProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/db.json')
      .then(res => res.json())
      .then(data => {
        const record = (data.deathRecords || []).find((r: any) => String(r.id) === id);
        if (record) {
          setForm(record);
        }
        setLoading(false);
      });
  }, [id]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = (form: any) => {
    if (!form.firstName || !/^[A-Za-z]{2,}$/.test(form.firstName.trim())) {
      toast.error('First Name is required and must be at least 2 letters.');
      return false;
    }
    if (form.firstName && form.firstName.length > 30) {
      toast.error('First Name cannot be more than 30 characters.');
      return false;
    }
    if (!form.lastName || !/^[A-Za-z ]{2,}$/.test(form.lastName.trim())) {
      toast.error('Last Name is required and must be at least 2 letters.');
      return false;
    }
    if (form.lastName && form.lastName.length > 30) {
      toast.error('Last Name cannot be more than 30 characters.');
      return false;
    }
    if (!form.mobileNo || !/^\d{10}$/.test(form.mobileNo)) {
      toast.error('Mobile Number is required and must be 10 digits.');
      return false;
    }
    if (form.mobileNo && form.mobileNo.length > 10) {
      toast.error('Mobile Number cannot be more than 10 digits.');
      return false;
    }
    if (!form.doctorName || !/^[A-Za-z ]{2,}$/.test(form.doctorName)) {
      toast.error('Doctor Name is required and must be at least 2 letters.');
      return false;
    }
    if (form.doctorName && form.doctorName.length > 50) {
      toast.error('Doctor Name cannot be more than 50 characters.');
      return false;
    }
    if (form.contactNumber !== undefined && (!/^\d{10}$/.test(form.contactNumber))) {
      toast.error('Contact Number must be 10 digits.');
      return false;
    }
    if (form.contactNumber && form.contactNumber.length > 10) {
      toast.error('Contact Number cannot be more than 10 digits.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    // Check for blank required fields
    const requiredFields = [
      'firstName', 'lastName', 'mobileNo', 'gender', 'dateOfBirth', 'doctorName', 'ipNo', 'dateOfDeath', 'causeOfDeath',
      'causeOfDeathType', 'postmortemDone', 'pathologistName', 'placeOfDeath', 'deathInformedPerson', 'deathInformedContact', 'deathInformedAddress'
    ];
    for (const field of requiredFields) {
      if (!form[field] || form[field].toString().trim() === '') {
        alert('Please fill all required fields.');
        return;
      }
    }
    if (!validateForm(form)) return;
    await fetch(`${API_BASE}/deathRecords/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    toast.success('Updated successfully!');
    setTimeout(() => {
      navigate(`/death-profile/${id}`);
    }, 1000);
  };

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;

  return (
    <PageContainer>
      <ToastContainer />
      <SectionHeading title="Edit Death Profile" subtitle="Update death record details" />
      <div style={sectionStyle}>
        <SectionHeading title="Basic Details" />
        <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <Input label="First Name" name="firstName" value={form.firstName || ''} onChange={handleFormChange} placeholder="First Name" />
          </div>
          <div>
            <Input label="Last Name" name="lastName" value={form.lastName || ''} onChange={handleFormChange} placeholder="Last Name" />
          </div>
          <div>
            <DropInput
              label="Gender"
              name="gender"
              value={form.gender || ''}
              onChange={handleFormChange}
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' },
              ]}
            />
          </div>
          <div>
            <DateInput label="Date of Birth" name="dateOfBirth" value={form.dateOfBirth || ''} onChange={handleFormChange} />
          </div>
          <div>
            <Input label="Mobile No" name="mobileNo" value={form.mobileNo || ''} onChange={handleFormChange} placeholder="Mobile No" />
          </div>
          <div>
            <Input label="Doctor Name" name="doctorName" value={form.doctorName || ''} onChange={handleFormChange} placeholder="Doctor Name" />
          </div>
          <div>
            <Input label="IP No" name="ipNo" value={form.ipNo || ''} onChange={handleFormChange} placeholder="IP No" disabled />
          </div>
          <div>
            <DateInput label="Date of Death" name="dateOfDeath" value={form.dateOfDeath || ''} onChange={handleFormChange} />
          </div>
          <div>
            <Input label="Cause of Death" name="causeOfDeath" value={form.causeOfDeath || ''} onChange={handleFormChange} placeholder="Cause of Death" />
          </div>
          <div>
            <DropInput
              label="Cause of Death Type"
              name="causeOfDeathType"
              value={form.causeOfDeathType || ''}
              onChange={handleFormChange}
              options={[
                { label: 'Natural', value: 'Natural' },
                { label: 'Accident', value: 'Accident' },
                { label: 'Suicide', value: 'Suicide' },
                { label: 'Pending investigation', value: 'Pending investigation' },
              ]}
            />
          </div>
          <div>
            <DropInput
              label="Postmortem Done"
              name="postmortemDone"
              value={form.postmortemDone || ''}
              onChange={handleFormChange}
              options={[
                { label: 'Yes', value: 'Yes' },
                { label: 'No', value: 'No' },
              ]}
            />
          </div>
          <div>
            <Input label="Pathologist Name" name="pathologistName" value={form.pathologistName || ''} onChange={handleFormChange} placeholder="Pathologist Name" />
          </div>
          <div>
            <DropInput
              label="Place of Death"
              name="placeOfDeath"
              value={form.placeOfDeath || ''}
              onChange={handleFormChange}
              options={[
                { label: 'Hospital', value: 'Hospital' },
                { label: 'Home', value: 'Home' },
                { label: 'Way', value: 'Way' },
              ]}
            />
          </div>
          <div>
            <Input label="Death First Informed Person" name="deathInformedPerson" value={form.deathInformedPerson || ''} onChange={handleFormChange} placeholder="Death First Informed Person" />
          </div>
          <div>
            <Input label="Contact Number" name="deathInformedContact" value={form.deathInformedContact || ''} onChange={handleFormChange} placeholder="Contact Number" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <Input label="Address" name="deathInformedAddress" value={form.deathInformedAddress || ''} onChange={handleFormChange} placeholder="Address" />
          </div>
        </form>
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

export default EditDeathProfile; 