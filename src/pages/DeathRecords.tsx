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
import { Printer, ArrowRightSquare } from 'lucide-react';
// import { Pencil, Trash } from 'lucide-react';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import { useNavigate, useLocation } from 'react-router-dom';
import Searchbar from '../components/Searchbar';
import { getDeathRecords, deleteDeathRecord, addMortuaryRecord } from '../api/api';
import jsPDF from 'jspdf';
import FilterBar from '../components/FilterBar';

interface PageProps {
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}

const DeathRecords: React.FC<PageProps> = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  // Filter state
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('');
  const [autoRefresh, setAutoRefresh] = useState('15');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getDeathRecords()
      .then(data => setRecords(data))
      .catch(() => setRecords([]));
  }, []);

  // Refresh data when returning from edit page
  useEffect(() => {
    getDeathRecords()
      .then(data => setRecords(data))
      .catch(() => setRecords([]));
  }, [location.pathname]);

  const handleEdit = (id: string) => {
    navigate(`/edit-death/${id}`);
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
      await deleteDeathRecord(id);
      setRecords(records.filter(record => record.id !== id));
    } catch (error) {
      alert('Error deleting record.');
    }
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(records);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Death Records');
    XLSX.writeFile(workbook, 'DeathRecords.xlsx');
  };

  const printDeathReport = (deathRecord: any) => {
    if (!deathRecord) return;
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFont('helvetica');
    doc.setFillColor(253, 241, 230);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setDrawColor(201, 164, 122);
    doc.setLineWidth(2);
    doc.rect(10, 10, 190, 277, 'S');
    doc.setFontSize(22);
    doc.setTextColor(60, 90, 150);
    doc.text('DEATH CERTIFICATE', 105, 28, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text('This certifies that', 105, 40, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.firstName || ''} ${deathRecord.lastName || ''}`, 105, 52, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text('Date of Birth:', 40, 65);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.dateOfBirth || '-'}`, 75, 65);
    doc.setTextColor(80, 80, 80);
    doc.text('Date of Death:', 40, 75);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.dateOfDeath || '-'}`, 75, 75);
    doc.setTextColor(80, 80, 80);
    doc.text('Gender:', 40, 85);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.gender || '-'}`, 75, 85);
    doc.setTextColor(80, 80, 80);
    doc.text('Doctor Name:', 40, 95);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.doctorName || '-'}`, 75, 95);
    doc.setTextColor(80, 80, 80);
    doc.text('IP No:', 40, 105);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.ipNo || '-'}`, 75, 105);
    doc.setTextColor(80, 80, 80);
    doc.text('Cause of Death:', 40, 115);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.causeOfDeath || '-'}`, 90, 115);
    doc.setTextColor(80, 80, 80);
    doc.text('Type:', 40, 125);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.causeOfDeathType || '-'}`, 75, 125);
    doc.setTextColor(80, 80, 80);
    doc.text('Postmortem Done:', 40, 135);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.postmortemDone || '-'}`, 90, 135);
    doc.setTextColor(80, 80, 80);
    doc.text('Pathologist Name:', 40, 145);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.pathologistName || '-'}`, 90, 145);
    doc.setTextColor(80, 80, 80);
    doc.text('Place of Death:', 40, 155);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.placeOfDeath || '-'}`, 90, 155);
    doc.setTextColor(80, 80, 80);
    doc.text('Death Informed By:', 40, 165);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.deathInformedPerson || '-'}`, 90, 165);
    doc.setTextColor(80, 80, 80);
    doc.text('Contact:', 40, 175);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.deathInformedContact || '-'}`, 75, 175);
    doc.setTextColor(80, 80, 80);
    doc.text('Address:', 40, 185);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.deathInformedAddress || '-'}`, 75, 185);
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text('Relatives:', 40, 195);
    doc.setTextColor(44, 62, 80);
    if (deathRecord.relatives && Array.isArray(deathRecord.relatives)) {
      deathRecord.relatives.forEach((rel: any, idx: number) => {
        doc.text(`- ${rel.name} (${rel.relation}) - ${rel.contact}, ${rel.address}`, 50, 205 + idx * 8);
      });
    }
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text('Registered by:', 40, 245);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.registeredBy || '-'}`, 80, 245);
    doc.setTextColor(80, 80, 80);
    doc.text('Registered on:', 40, 255);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.registeredOn ? new Date(deathRecord.registeredOn).toLocaleString() : '-'}`, 80, 255);
    doc.setTextColor(80, 80, 80);
    doc.text('Registered at:', 40, 265);
    doc.setTextColor(44, 62, 80);
    doc.text(`${deathRecord.registeredAt || '-'}`, 80, 265);
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 285);
    doc.text('Signature: ____________________', 140, 285);
    doc.save(`${deathRecord.firstName || 'Death'}_Report.pdf`);
  };

  const handleMoveToMortuary = async (deathRecord: any) => {
    const confirmed = window.confirm('Are you sure you want to move this record to the mortuary?');
    if (!confirmed) return;
    try {
      await addMortuaryRecord(deathRecord);
      // await deleteDeathRecord(deathRecord.id); // Do not delete from deathRecords
      alert('Record moved to mortuary successfully.');
    } catch (error) {
      alert('Error moving record to mortuary.');
    }
  };

  const columns = [
    { key: 'deathId', header: 'Death ID' },
    { key: 'patient', header: 'Patient' },
    { key: 'doctorName', header: 'Doctor Name' },
    { key: 'ipNo', header: 'IP No' },
    { key: 'dateOfDeath', header: 'Date of Death' },
    { key: 'gender', header: 'Gender' },
    { key: 'causeOfDeath', header: 'Cause of Death' },
    { key: 'actions', header: 'Actions' },
  ];

  // Filtering logic
  const filteredRecords = records.filter(record => {
    // Date filter (use dateOfDeath for death records)
    let dateOk = true;
    if (fromDate) dateOk = new Date(record.dateOfDeath) >= new Date(fromDate);
    if (toDate && dateOk) dateOk = new Date(record.dateOfDeath) <= new Date(toDate);
    // Status filter
    let statusOk = true;
    if (status) statusOk = record.status === status;
    // Search filter
    let searchOk = true;
    if (search) searchOk = Object.values(record).join(' ').toLowerCase().includes(search.toLowerCase());
    return dateOk && statusOk && searchOk;
  });

  return (
    <>
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator /> */}
      <PageContainer>
        <SectionHeading title="Death Records" subtitle="View and manage all death records" />
        <FilterBar
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={e => setFromDate(e.target.value)}
          onToDateChange={e => setToDate(e.target.value)}
          status={status}
          onStatusChange={e => setStatus(e.target.value)}
          autoRefresh={autoRefresh}
          onAutoRefreshChange={e => setAutoRefresh(e.target.value)}
          onRefresh={() => window.location.reload()}
          search={search}
          onSearchChange={e => setSearch(e.target.value)}
          onExport={handleExportExcel}
        />

        <div className="records-table-container">
          <Table columns={columns} data={filteredRecords.map((record, idx) => {
            const isEditing = editId === record.id;
            // Calculate age if dateOfBirth is present
            let age = '';
            if (record.dateOfBirth) {
              const dob = new Date(record.dateOfBirth);
              const now = new Date();
              age = `${now.getFullYear() - dob.getFullYear()} yrs`;
            }
            return {
              ...record,
              deathId: `D${String(idx + 1).padStart(2, '0')}`,
              patient: isEditing ? (
                <input value={editForm.firstName || ''} onChange={e => handleEditChange('firstName', e.target.value)} />
              ) : (
                <div style={{ color: '#038ba4', fontWeight: 500, fontSize: 15, lineHeight: 1.1, cursor: 'pointer' }} onClick={() => navigate(`/death-profile/${record.id}`)}>
                  <div style={{ color: '#038ba4', fontWeight: 500 }}>{record.firstName} {record.lastName}</div>
                  <div style={{ color: '#444', fontWeight: 400, fontSize: 13 }}>
                    ({age}/{record.gender})<br />
                    {record.mobileNo}
                  </div>
                </div>
              ),
              doctorName: isEditing ? (
                <input value={editForm.doctorName || ''} onChange={e => handleEditChange('doctorName', e.target.value)} />
              ) : (
                <div style={{ color: '#444', fontWeight: 500, fontSize: 15, lineHeight: 1.1 }}>
                  {record.doctorName || '-'}
                </div>
              ),
              ipNo: isEditing ? (
                <input value={editForm.ipNo || ''} onChange={e => handleEditChange('ipNo', e.target.value)} />
              ) : (
                <a href="#" style={{ color: '#038ba4', fontWeight: 500, textDecoration: 'none' }}>{record.ipNo || '-'}</a>
              ),
              dateOfDeath: isEditing ? <input value={editForm.dateOfDeath || ''} onChange={e => handleEditChange('dateOfDeath', e.target.value)} /> : record.dateOfDeath,
              gender: isEditing ? <input value={editForm.gender || ''} onChange={e => handleEditChange('gender', e.target.value)} /> : record.gender,
              causeOfDeath: isEditing ? <input value={editForm.causeOfDeath || ''} onChange={e => handleEditChange('causeOfDeath', e.target.value)} /> : record.causeOfDeath,
              actions: (
                <div className="action-buttons">
                  <button title="Print PDF" className="icon-btn print-btn" onClick={() => printDeathReport(record)}>
                    <Printer size={20} />
                  </button>
                  <button title="Move to Mortuary" className="icon-btn mortuary-btn" onClick={() => handleMoveToMortuary(record)}>
                    <ArrowRightSquare size={20} />
                  </button>
                  {isEditing ? (
                    <>
                      <button onClick={() => handleSave(record.id)} className="edit-btn">Save</button>
                      <button onClick={() => { setEditId(null); setEditForm({}); }} className="delete-btn">Cancel</button>
                    </>
                  ) : (
                    <>
                      <EditButton onClick={() => handleEdit(record.id)} />
                      <DeleteButton onClick={() => handleDelete(record.id)} size={18} className="delete-btn" />
                    </>
                  )}
                </div>
              ),
            };
          })} />
        </div>
      </PageContainer>
      {/* <Footer /> */}
      
    </>
  );
};

export default DeathRecords;















