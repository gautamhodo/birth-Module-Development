import React, { useState, useEffect } from 'react';
import '../styles/page.css';
import '../styles/form.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import Input from '../components/Input';
import DropInput from '../components/DropInput';
import AddInput from '../components/AddInput';
import DateInput from '../components/DateInput';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { updateDeathRecord, getDeathRecords } from '../api/api';
import SearchPatientInput from '../components/SearchPatientInput';

interface PageProps {
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}

const Popup = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="popup-overlay">
      <div className="popup-content">
          <p>{message}</p>
          <button onClick={onClose} className="btn-with-gradient">Close</button>
      </div>
  </div>
);

const API_BASE = `${window.location.protocol}//${window.location.hostname}:3000`;

const DeathRegistration: React.FC<PageProps> = ({ sidebarCollapsed = false, toggleSidebar }) => {
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    dateOfDeath: '',
    idProof: '',
    idProofOther: '',
    gender: '',
    permanentAddress: '',
    causeOfDeath: '',
    causeOfDeathOther: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showDownload, setShowDownload] = useState(false);
  const [lastRegistered, setLastRegistered] = useState<any>(null);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [allDeathRecords, setAllDeathRecords] = useState<any[]>([]);
  const [searchPatient, setSearchPatient] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      setIsLoadingRecord(true);
      fetch(`${API_BASE}/deathRecords`)
        .then(res => res.json())
        .then(data => {
          const rec = data.find((r: any) => String(r.id) === id);
          if (rec) setForm(rec);
          setIsLoadingRecord(false);
        })
        .catch(() => {
          setIsLoadingRecord(false);
        });
    }
  }, [location.search]);

  useEffect(() => {
    getDeathRecords().then(setAllDeathRecords);
  }, []);

  useEffect(() => {
    if (!searchPatient) {
      setSearchResults([]);
      return;
    }
    const q = searchPatient.toLowerCase();
    setSearchResults(
      allDeathRecords.filter(r =>
        (r.firstName + ' ' + r.lastName + ' ' + (r.cardNo || '') + ' ' + (r.mobileNo || '')).toLowerCase().includes(q)
      )
    );
  }, [searchPatient, allDeathRecords]);

  const handleSelectPatient = (id: string) => {
    const rec = allDeathRecords.find(r => String(r.id) === id);
    if (rec) setForm(rec);
    setSearchPatient('');
    setSearchResults([]);
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleRegisterDeath = async () => {
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'dateOfDeath', 'idProof', 'gender', 'permanentAddress', 'causeOfDeath'];
    let isFormValid = requiredFields.every(field => (form as any)[field].trim() !== '');

    if (form.idProof === 'other' && form.idProofOther.trim() === '') {
      isFormValid = false;
    }
    if (form.causeOfDeath === 'other' && form.causeOfDeathOther.trim() === '') {
      isFormValid = false;
    }

    if (!isFormValid) {
      setPopupMessage('Please fill all required fields before registering.');
      setShowPopup(true);
      setShowDownload(false);
      return;
    }

    setIsLoading(true);

    try {
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      if (id) {
        // Edit mode: PUT
        await updateDeathRecord(id, form);
        setPopupMessage('Death record updated successfully!');
        setShowDownload(false);
      } else {
        // POST to json-server
        const response = await fetch(`${API_BASE}/deathRecords`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await response.json();
        setLastRegistered({ ...form, id: data.id });
        setPopupMessage('Death registered successfully!');
        setShowDownload(true);
      }
      setIsLoading(false);
      setShowPopup(true);
    } catch (error) {
      setIsLoading(false);
      setPopupMessage('Failed to register death. Please try again.');
      setShowPopup(true);
      setShowDownload(false);
    }
  };

  const handleDownloadCertificate = async () => {
    setTimeout(async () => {
      const input = document.getElementById('certificate-pdf-view');
      if (input) {
        const canvas = await html2canvas(input);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${lastRegistered.firstName || 'Death'}_Certificate.pdf`);
      }
    }, 100);
  };

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator />
      <PageContainer>
        <SectionHeading 
          title={location.search.includes('id=') ? "Edit Death Registration" : "Death Registration"} 
          subtitle={location.search.includes('id=') ? "Edit existing death record" : "Register a new death and generate certificate"} 
        />
        <SearchPatientInput
          value={searchPatient}
          onChange={e => setSearchPatient(e.target.value)}
          count={searchPatient.length}
          results={searchResults.map(r => ({ id: r.id, label: `${r.firstName} ${r.lastName} (${r.cardNo || r.id})` }))}
          onSelectResult={handleSelectPatient}
        />
        {isLoadingRecord ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p>Loading death record...</p>
          </div>
        ) : (
        <form className="death-registration-form">
          <div className="form-section">
            <h3>Deceased Details</h3>
            <div className="form-row">
              <div className="form-col">
                <Input label="First Name" value={form.firstName} onChange={handleChange('firstName')} placeholder="Enter first name" />
              </div>
              <div className="form-col">
                <Input label="Middle Name" value={form.middleName} onChange={handleChange('middleName')} placeholder="Enter middle name" />
              </div>
              <div className="form-col">
                <Input label="Last Name" value={form.lastName} onChange={handleChange('lastName')} placeholder="Enter last name" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
                <DateInput label="Date of Birth" value={form.dateOfBirth} onChange={handleChange('dateOfBirth')} />
              </div>
              <div className="form-col">
                <DateInput label="Date of Death" value={form.dateOfDeath} onChange={handleChange('dateOfDeath')} />
              </div>
              <div className="form-col">
                <DropInput label="Gender" value={form.gender} onChange={handleChange('gender')} options={[
                  { label: 'Male', value: 'male' },
                  { label: 'Female', value: 'female' },
                ]} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
                <DropInput label="ID Proof" value={form.idProof} onChange={handleChange('idProof')} options={[
                  { label: 'Aadhaar', value: 'aadhaar' },
                  { label: 'Pan Card', value: 'pan' },
                  { label: 'Driving Licence', value: 'driving' },
                  { label: 'Other', value: 'other' },
                ]} />
              </div>
              {form.idProof === 'other' && (
                <div className="form-col">
                  <Input label="Specify Other ID Proof" value={form.idProofOther} onChange={handleChange('idProofOther')} placeholder="Enter other ID proof" />
                </div>
              )}
            </div>
            <div className="form-row">
              <div className="form-col">
                <AddInput label="Permanent Address" value={form.permanentAddress} onChange={handleChange('permanentAddress')} placeholder="Enter permanent address" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
                <DropInput label="Cause of Death" value={form.causeOfDeath} onChange={handleChange('causeOfDeath')} options={[
                  { label: 'Natural', value: 'natural' },
                  { label: 'Accident', value: 'accident' },
                  { label: 'Suicide', value: 'suicide' },
                  { label: 'Pending Investigation', value: 'pending' },
                  { label: 'Other', value: 'other' },
                ]} />
              </div>
              {form.causeOfDeath === 'other' && (
                <div className="form-col">
                  <Input label="Specify Other Cause" value={form.causeOfDeathOther} onChange={handleChange('causeOfDeathOther')} placeholder="Enter other cause" />
                </div>
              )}
            </div>
          </div>
          <div className="form-row" style={{ justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={handleRegisterDeath} className="btn-with-gradient" disabled={isLoading}>
              {isLoading ? <span className="spinner" /> : (location.search.includes('id=') ? 'Update Death' : 'Register Death')}
            </button>
          </div>
        </form>
        )}
        {showPopup && (
          <div>
            <Popup message={popupMessage} onClose={() => { setShowPopup(false); setShowDownload(false); navigate('/death-records'); }} />
            {showDownload && lastRegistered && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button className="btn-with-gradient" onClick={handleDownloadCertificate}>Download Certificate</button>
                <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                  <div className="certificate-container" id="certificate-pdf-view">
                    <div className="certificate-header">
                      <div className="certificate-title">REGISTRATION DEPARTMENT</div>
                      <div className="certificate-subtitle">Govt. of Kerala</div>
                      <div style={{ fontWeight: 500, color: '#2d4a6a', marginTop: '0.2rem' }}>
                        (Export of Online Token Registration)
                      </div>
                    </div>
                    <table className="certificate-table">
                      <tbody>
                        <tr>
                          <th>Name of Deceased</th>
                          <td>{lastRegistered.firstName} {lastRegistered.middleName} {lastRegistered.lastName}</td>
                          <th>Date of Death</th>
                          <td>{lastRegistered.dateOfDeath}</td>
                        </tr>
                        <tr>
                          <th>Gender</th>
                          <td>{lastRegistered.gender}</td>
                          <th>Permanent Address</th>
                          <td>{lastRegistered.permanentAddress}</td>
                        </tr>
                        <tr>
                          <th>Cause of Death</th>
                          <td colSpan={3}>{lastRegistered.causeOfDeath === 'other' ? lastRegistered.causeOfDeathOther : lastRegistered.causeOfDeath}</td>
                        </tr>
                        <tr>
                          <th>ID Proof</th>
                          <td colSpan={3}>{lastRegistered.idProof === 'other' ? lastRegistered.idProofOther : lastRegistered.idProof}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="certificate-footer">
                      <div>Generated on: {new Date().toLocaleDateString()}</div>
                      <div>Signature: ____________________</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </PageContainer>
      <Footer />
    </>
  );
};

export default DeathRegistration;
