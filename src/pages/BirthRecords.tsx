import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import '../styles/page.css';
import '../styles/form.css';
import '../styles/RecordsTable.css';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import Table from '../components/Table';
import { Eye, Printer } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Searchbar from '../components/Searchbar';
import { getBirthRecords, deleteBirthRecord } from '../api/api';
import jsPDF from 'jspdf';

interface PageProps {
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}




const BirthRecords: React.FC<PageProps> = ({ sidebarCollapsed = false, toggleSidebar }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getBirthRecords()
      .then(data => setRecords(data))
      .catch(() => setRecords([]));
  }, []);

  // Refresh data when returning from edit page
  useEffect(() => {
    getBirthRecords()
      .then(data => setRecords(data))
      .catch(() => setRecords([]));
  }, [location.pathname]);

  const handleEdit = (id: number) => {
    navigate(`/birth-registration?id=${id}`);
  };

  const handleEditChange = (field: string, value: string) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleSave = (id: number) => {
    setRecords(records.map(r => r.id === id ? { ...editForm, id } : r));
    setEditId(null);
    setEditForm({});
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (!confirmed) return;
    try {
      await deleteBirthRecord(id);
      setRecords(records.filter(record => record.id !== id));
    } catch (error) {
      alert('Error deleting record.');
    }
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(records);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Birth Records');
    XLSX.writeFile(workbook, 'BirthRecords.xlsx');
  };

  const handlePrintCertificate = (record: any) => {
    // Fetch parent data if needed
    fetch('/db.json')
      .then(res => res.json())
      .then(data => {
        const parent = (data.ParentData || []).find((p: any) => p.id === record.ParentDataId);
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.setFont('helvetica');
        doc.setFillColor(253, 241, 230);
        doc.rect(0, 0, 210, 297, 'F');
        doc.setDrawColor(201, 164, 122);
        doc.setLineWidth(2);
        doc.rect(10, 10, 190, 277, 'S');
        doc.setFontSize(22);
        doc.setTextColor(60, 90, 150);
        doc.text('BIRTH CERTIFICATE', 105, 28, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        doc.text('This certifies that', 105, 40, { align: 'center' });
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text(`${record.firstName || ''} ${record.lastName || ''}`, 105, 52, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        doc.text('was born to', 105, 62, { align: 'center' });
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text(`Mother: ${parent?.firstName || ''} ${parent?.lastName || ''}`, 105, 72, { align: 'center' });
        doc.text(`Father: ${record.fatherName || '-'}`, 105, 80, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        doc.text('On', 40, 95);
        doc.setTextColor(44, 62, 80);
        doc.text(`${record.dateOfBirth || '-'}`, 60, 95);
        doc.setTextColor(80, 80, 80);
        doc.text('at', 100, 95);
        doc.setTextColor(44, 62, 80);
        doc.text(`${record.placeOfBirth || '-'}`, 110, 95);
        doc.setTextColor(80, 80, 80);
        doc.text('Gender:', 40, 105);
        doc.setTextColor(44, 62, 80);
        doc.text(`${record.gender || '-'}`, 60, 105);
        doc.setTextColor(80, 80, 80);
        doc.text('Weight:', 100, 105);
        doc.setTextColor(44, 62, 80);
        doc.text(`${record.weight || '-'} kg`, 120, 105);
        doc.setTextColor(80, 80, 80);
        doc.text('Blood Group:', 40, 115);
        doc.setTextColor(44, 62, 80);
        doc.text(`${parent?.bloodGroup || '-'}`, 75, 115);
        doc.setTextColor(80, 80, 80);
        doc.text('UHID:', 100, 115);
        doc.setTextColor(255, 0, 0);
        doc.text(`${parent?.uhid || '-'}`, 120, 115);
        doc.setTextColor(80, 80, 80);
        doc.text('Consulting Doctor:', 40, 125);
        doc.setTextColor(44, 62, 80);
        doc.text(`${parent?.doctor || '-'}`, 90, 125);
        doc.setTextColor(80, 80, 80);
        doc.text('Civil ID:', 40, 135);
        doc.setTextColor(44, 62, 80);
        doc.text(`${parent?.civilIds || '-'}`, 70, 135);
        doc.setTextColor(80, 80, 80);
        doc.text('Registered at:', 100, 135);
        doc.setTextColor(44, 62, 80);
        doc.text(`${record.registeredAt || '-'}`, 140, 135);
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 285);
        doc.text('Signature: ____________________', 140, 285);
        doc.save(`${record.firstName || 'Birth'}_Certificate.pdf`);
      });
  };

  const columns = [
    { key: 'id', header: 'ID' },
    // { key: 'id', header: 'ID' },
    { key: 'firstName', header: 'First Name' },
    { key: 'lastName', header: 'Last Name' },
    { key: 'dateOfBirth', header: 'Date of Birth' },
    { key: 'gender', header: 'Gender' },
    { key: 'placeOfBirth', header: 'Place of Birth' },
    { key: 'motherName', header: "Mother Name" },
    { key: 'actions', header: 'Actions' },
  ];

  const filteredRecords = records.filter(record =>
    Object.values(record).join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator /> */}
      <PageContainer>
        <SectionHeading title="Birth Records" subtitle="View and manage all birth records" />

        <div className="records-table-container">
          <div className="records-table-header" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', paddingLeft: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleExportExcel} className="btn-with-gradient">
                Export to Excel
              </button>
            </div>
            <div style={{ minWidth: 250 }}>
              <Searchbar value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <Table columns={columns} data={filteredRecords.map((record, idx) => ({
            id: record.id,
            ...record,
            actions: (
              <div className="action-buttons">
                <button title="Print PDF" className="icon-btn print-btn" onClick={() => handlePrintCertificate(record)}>
                  <Printer size={20} />
                </button>
              </div>
            ),
            firstName: editId === record.id ? <input value={editForm.firstName || ''} onChange={e => handleEditChange('firstName', e.target.value)} /> : record.firstName,
            lastName: editId === record.id ? <input value={editForm.lastName || ''} onChange={e => handleEditChange('lastName', e.target.value)} /> : record.lastName,
            dateOfBirth: editId === record.id ? <input value={editForm.dateOfBirth || ''} onChange={e => handleEditChange('dateOfBirth', e.target.value)} /> : record.dateOfBirth,
            gender: editId === record.id ? <input value={editForm.gender || ''} onChange={e => handleEditChange('gender', e.target.value)} /> : record.gender,
            placeOfBirth: editId === record.id ? <input value={editForm.placeOfBirth || ''} onChange={e => handleEditChange('placeOfBirth', e.target.value)} /> : record.placeOfBirth,
            motherName: editId === record.id ? <input value={editForm.motherName || ''} onChange={e => handleEditChange('motherName', e.target.value)} /> : record.motherName,
          }))} />
        </div>
      </PageContainer>
      {/* <Footer /> */}
    </>
  );
};

export default BirthRecords;
