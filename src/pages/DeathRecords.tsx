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
// import { Pencil, Trash } from 'lucide-react';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import { useNavigate, useLocation } from 'react-router-dom';
import Searchbar from '../components/Searchbar';
import { getDeathRecords, deleteDeathRecord } from '../api/api';

interface PageProps {
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}

const DeathRecords: React.FC<PageProps> = ({ sidebarCollapsed = false, toggleSidebar }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
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

  const handleEdit = (id: number) => {
    navigate(`/death-registration?id=${id}`);
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

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'firstName', header: 'First Name' },
    { key: 'lastName', header: 'Last Name' },
    { key: 'dateOfDeath', header: 'Date of Death' },
    { key: 'gender', header: 'Gender' },
    { key: 'causeOfDeath', header: 'Cause of Death' },
    { key: 'actions', header: 'Actions' },
  ];

  const filteredRecords = records.filter(record =>
    Object.values(record).join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator /> */}
      <PageContainer>
        <SectionHeading title="Death Records" subtitle="View and manage all death records" />

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
          <Table columns={columns} data={filteredRecords.map((record) => ({
            ...record,
            actions: (
              <div className="action-buttons">
                {editId === record.id ? (
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
            firstName: editId === record.id ? <input value={editForm.firstName || ''} onChange={e => handleEditChange('firstName', e.target.value)} /> : record.firstName,
            lastName: editId === record.id ? <input value={editForm.lastName || ''} onChange={e => handleEditChange('lastName', e.target.value)} /> : record.lastName,
            dateOfDeath: editId === record.id ? <input value={editForm.dateOfDeath || ''} onChange={e => handleEditChange('dateOfDeath', e.target.value)} /> : record.dateOfDeath,
            gender: editId === record.id ? <input value={editForm.gender || ''} onChange={e => handleEditChange('gender', e.target.value)} /> : record.gender,
            causeOfDeath: editId === record.id ? <input value={editForm.causeOfDeath || ''} onChange={e => handleEditChange('causeOfDeath', e.target.value)} /> : record.causeOfDeath,
          }))} />
        </div>
      </PageContainer>
      {/* <Footer /> */}
      
    </>
  );
};

export default DeathRecords;















