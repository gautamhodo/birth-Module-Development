import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import '../styles/page.css';
import '../styles/form.css';
import '../styles/RecordsTable.css';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import Table from '../components/Table';
import { Printer, ArrowRightSquare, Eye } from 'lucide-react';
import { useNavigate, useLocation, Link, data } from 'react-router-dom';
import Searchbar from '../components/Searchbar';
import { getDeathRecords, deleteDeathRecord } from '../api/api';
import jsPDF from 'jspdf';
import FilterBar from '../components/FilterBar';
import { DeathCertificateGenerator } from '../utils/DeathCertificateGenerator';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface PageProps {
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}

const DeathRecords: React.FC<PageProps> = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Filter state
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('');
  const [autoRefresh, setAutoRefresh] = useState('15');
  const [isLoading, setIsLoading] = useState(false);

  const handleMoveToMortuary = async (record: any) => {
    try {
      // Add your mortuary API call here
      // await moveToMortuary(record.id);
      toast.success('Moved to mortuary successfully');
    } catch (error) {
      toast.error('Error moving to mortuary');
    }
  };

  const fetchDeathRecords = () => {

    setIsLoading(true);
    let url = 'http://192.168.50.171:5000/deathRecords';
    const params = new URLSearchParams();

    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    console.log('Raw death records from API:', data);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {

        // const mappedRecords = data.map((r: any) => ({
        //   id: r.IDS_PK,
        //   deathId: r.IDS_ID_PK || `D${r.IDS_PK}`,
        //   firstName: r.PM_FirstName || '',
        //   lastName: r.PM_LastName || '',
        //   fullName: `${r.PM_FirstName || ''} ${r.PM_LastName || ''}`.trim(),
        //   dateOfDeath: r.IDS_DateOfDeath,
        //   gender: r.IDS_Gender,
        //   ipNo: r.IDS_IPNo,
        //   addedOn: r.IDS_AddedDate || new Date().toISOString()
        // }));

        const mappedRecords = data.map((r: any) => ({
          id: r.id,
          deathId: r.deathId || `D${r.id}`,
          fullName: r.fullName || '',
          gender: r.gender === 1 ? 'Female' : r.gender === 2 ? 'Male' : 'Unknown',

          //To display date and time:
          // dateOfDeath: r.dateOfDeath
          //   ? r.dateOfDeath.replace('T', ' ').split('.')[0]
          //   : 'Not Available', ipNo: r.ipNo,

          //To display only date:
          dateOfDeath: r.dateOfDeath
            ? r.dateOfDeath.split('T')[0]
            : 'Not Available',

            ipNo: r.ipNo || 'Not Available', // show IP number, or 'Not Available' if missing

          addedOn: r.addedOn
            ? r.addedOn.replace('T', ' ').split('.')[0]
            : new Date().toISOString().replace('T', ' ').split('.')[0],

        }));



        setRecords(mappedRecords);
      })
      .catch(err => {
        console.error('Error fetching records:', err);
        setRecords([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
    console.log('Raw death records from API:', data);

  };

  useEffect(() => {
    fetchDeathRecords();
  }, [fromDate, toDate, location.pathname]);

  const handleEdit = (id: string) => {
    navigate(`/edit-death/${id}`);
  };

  const handlePrintCertificate = async (record: any) => {
    try {
      // Simple confirmation
      const proceed = confirm('Click Ok to proceed');
      if (!proceed) {
        return;
      }

      // Fetch detailed death record data to get age and gender information
      let detailedRecord = record;
      try {
        const response = await fetch(`http://192.168.50.171:5000/deathRecords/${record.deathId}`);
        if (response.ok) {
          detailedRecord = await response.json();
          console.log('Detailed death record fetched:', detailedRecord);
        }
      } catch (error) {
        console.warn('Failed to fetch detailed death record, using basic data:', error);
      }

      // Create death certificate generator
      const generator = new DeathCertificateGenerator();

      // Calculate age from dateOfBirth and dateOfDeath if available
      let calculatedAge = 'Not Provided';
      if (detailedRecord.dateOfBirth && detailedRecord.dateOfDeath) {
        const birthDate = new Date(detailedRecord.dateOfBirth);
        const deathDate = new Date(detailedRecord.dateOfDeath);
        const ageInYears = Math.floor((deathDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        calculatedAge = `${ageInYears} years`;
      }

      // Prepare death record data with detailed information
      const deathRecordData = {
        fullName: detailedRecord.fullName || record.fullName,
        gender: detailedRecord.gender || record.gender,
        dateOfDeath: detailedRecord.dateOfDeath || record.dateOfDeath,
        deathId: detailedRecord.deathId || record.deathId,
        ipNo: detailedRecord.ipNo || record.ipNo,
        age: calculatedAge,
        causeOfDeath: detailedRecord.causeOfDeath || 'As per medical records',
        address: detailedRecord.address || 'Not Provided',
        dateOfBirth: detailedRecord.dateOfBirth // Pass dateOfBirth for age calculation
      };

      // Generate and download certificate
      await generator.generateAndDownloadCertificate(deathRecordData);

      // Log successful generation
      console.log('Death certificate generated successfully for:', deathRecordData.fullName);

    } catch (error) {
      console.error('Error generating death certificate:', error);
      
      if (error instanceof Error && error.name === 'DeathValidationError') {
        alert(
          'Certificate Validation Failed\n\n' +
          `${error.message}\n\n` +
          'Please check the record information and try again.'
        );
      } else if (error instanceof Error && error.name === 'DeathCertificateGenerationError') {
        alert(
          'Certificate Generation Failed\n\n' +
          `${error.message}\n\n` +
          'Please try again. If the problem persists, contact system administrator.'
        );
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(
          'Failed to Generate Certificate\n\n' +
          `Error: ${errorMessage}\n\n` +
          'Please try again. If the problem persists, contact system administrator.'
        );
      }
    }
  };

  /**
   * Preview death certificate in a new window
   */
  const handlePreviewCertificate = async (record: any) => {
    try {
      // Use the same logic as handlePrintCertificate but open in new window instead of downloading
      
      // Fetch detailed death record data to get age and gender information
      let detailedRecord = record;
      try {
        const response = await fetch(`http://192.168.50.171:5000/deathRecords/${record.deathId}`);
        if (response.ok) {
          detailedRecord = await response.json();
          console.log('Detailed death record fetched for preview:', detailedRecord);
        }
      } catch (error) {
        console.warn('Failed to fetch detailed death record for preview, using basic data:', error);
      }

      // Calculate age from dateOfBirth and dateOfDeath if available
      let calculatedAge = 'Not Provided';
      if (detailedRecord.dateOfBirth && detailedRecord.dateOfDeath) {
        const birthDate = new Date(detailedRecord.dateOfBirth);
        const deathDate = new Date(detailedRecord.dateOfDeath);
        const ageInYears = Math.floor((deathDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        calculatedAge = `${ageInYears} years`;
      }

      // Prepare death record data with detailed information
      const deathRecordData = {
        fullName: detailedRecord.fullName || record.fullName,
        gender: detailedRecord.gender || record.gender,
        dateOfDeath: detailedRecord.dateOfDeath || record.dateOfDeath,
        deathId: detailedRecord.deathId || record.deathId,
        ipNo: detailedRecord.ipNo || record.ipNo,
        age: calculatedAge,
        causeOfDeath: detailedRecord.causeOfDeath || 'As per medical records',
        address: detailedRecord.address || 'Not Provided',
        dateOfBirth: detailedRecord.dateOfBirth
      };

      // Create generator for preview
      const generator = new DeathCertificateGenerator();
      
      // Generate the certificate for preview
      const pdfBlob = await generator.generateForPreview(deathRecordData);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');

      console.log('Death certificate preview opened for:', deathRecordData.fullName);

    } catch (error) {
      console.error('Error previewing death certificate:', error);
      alert('Failed to preview certificate. Please try again.');
    }
  };

  const handleEditChange = (field: string, value: string) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const validateRecord = (form: any) => {
    if (!form.firstName || !/^[A-Za-z]{2,}$/.test(form.firstName.trim())) {
      toast.error('First Name is required and must be at least 2 letters.');
      return false;
    }
    if (!form.lastName || !/^[A-Za-z ]{2,}$/.test(form.lastName.trim())) {
      toast.error('Last Name is required and must be at least 2 letters.');
      return false;
    }
    if (form.mobileNo && !/^\d{10}$/.test(form.mobileNo)) {
      toast.error('Mobile Number must be 10 digits.');
      return false;
    }
    return true;
  };

  const handleSave = (id: number) => {
    if (!validateRecord(editForm)) return;
    setRecords(records.map(r => r.id === id ? { ...editForm, id } : r));
    setEditId(null);
    setEditForm({});
    toast.success('Updated successfully!');
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (!confirmed) return;
    try {
      await deleteDeathRecord(id);
      setRecords(records.filter(record => record.id !== id));
      toast.success('Deleted successfully!');
    } catch (error) {
      toast.error('Error deleting record.');
    }
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(records);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Death Records');
    XLSX.writeFile(workbook, 'DeathRecords.xlsx');
  };

  // ... rest of the component code remains the same ...
  // [Previous printing and rendering logic would go here]

  const columns = [
    { key: 'deathId', header: 'Death ID', sortable: true },
    { key: 'fullName', header: 'Deceased Name', sortable: true },
    { key: 'gender', header: 'Gender', sortable: true },
    { key: 'dateOfDeath', header: 'Date of Death', sortable: true },
    { key: 'ipNo', header: 'IP No', sortable: true },
    { key: 'addedOn', header: 'Added On', sortable: true },
    { key: 'actions', header: 'Actions', sortable: false }
  ];

  // Filtering logic
  const filteredRecords = records.filter(record => {
    const matchesSearch = search === '' ||
      Object.values(record).some(
        (val: any) => val &&
          val.toString().toLowerCase().includes(search.toLowerCase())
      );

    let dateOk = true;
    if (fromDate) dateOk = new Date(record.dateOfDeath) >= new Date(fromDate);
    if (toDate && dateOk) dateOk = new Date(record.dateOfDeath) <= new Date(toDate);

    return matchesSearch && dateOk;
  });

  return (
    <>
      <ToastContainer />
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
          onRefresh={fetchDeathRecords}
          search={search}
          onSearchChange={e => setSearch(e.target.value)}
          onExport={handleExportExcel}
        />

        <div className="records-table-container">
          <Table
            columns={columns}
            data={filteredRecords.map(record => ({
              ...record,
              deathId: (
                <Link
                  to={`/death-profile/${record.deathId}`}
                  style={{ color: '#038ba4', fontWeight: 500, fontSize: 14, textDecoration: 'none', cursor: 'pointer' }}
                  title="View Death Profile"
                >
                  {record.deathId}
                </Link>
              ),
              actions: (
                <div className="action-buttons">
                  <button
                    title="Move to Mortuary"
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveToMortuary(record);
                    }}
                    style={{ color: '#4CAF50', marginRight: '8px' }}
                  >
                    <ArrowRightSquare size={20} />
                  </button>
                  <button
                    title="Preview Certificate"
                    className="icon-btn preview-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewCertificate(record);
                    }}
                    style={{ marginRight: '8px' }}
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    title="Print Certificate"
                    className="icon-btn print-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintCertificate(record);
                    }}
                    style={{ marginRight: '8px' }}
                  >
                    <Printer size={20} />
                  </button>

                </div>
              )
            }))}
          //   onRowClick={(row) => {
          //     // Handle row click if needed
          //     console.log('Row clicked:', row);
          //   }
          // }
          // isLoading={isLoading}
          // emptyMessage="No death records found"
          />
        </div>
      </PageContainer>
    </>
  );
};

export default DeathRecords;
