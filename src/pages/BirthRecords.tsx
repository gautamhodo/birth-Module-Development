import React, { useEffect, useState } from 'react';
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
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Searchbar from '../components/Searchbar';
import { getBirthRecords, deleteBirthRecord } from '../api/api';
import jsPDF from 'jspdf';
import { TemplateCertificateGenerator, ValidationError, CertificateGenerationError } from '../utils/TemplateCertificateGenerator';
import FilterBar from '../components/FilterBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface BirthRecordsProps {
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}

const BirthRecords: React.FC<BirthRecordsProps> = ({ sidebarCollapsed, toggleSidebar }) => {
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


  const fetchBirthRecords = () => {
    setIsLoading(true);
    let url = 'http://192.168.50.171:5000/birthRecords';
    const params = new URLSearchParams();

    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log(data)
        const mappedRecords = data.map((r: any) => ({
          ...r, // Include all original fields
          birthId: r.birthId,
          motherId: r.motherId,
          babyName: r.babyName || 'B/O Unknown',
          motherName: r.motherName || 'Unknown',
          addedOn: r.addedOn ? new Date(r.addedOn).toISOString().split('T')[0] : '',
          addedOnRaw: r.addedOn, // Keep raw date for filtering
          ipNumber: r.ipNumber,
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
  };

  useEffect(() => {
    fetchBirthRecords();
  }, [fromDate, toDate, location.pathname]);

  const handleEdit = (id: number) => {
    navigate(`/birth-registration?id=${id}`);
  };

  const handleEditChange = (field: string, value: string) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const validateRecord = (form: any) => {
    if (!form.babyName || !/^[A-Za-z]{2,}$/.test(form.babyName.trim())) {
      toast.error('First Name is required and must be at least 2 letters.');
      return false;
    }
    if (!form.lastName || !/^[A-Za-z ]{2,}$/.test(form.lastName.trim())) {
      toast.error('Last Name is required and must be at least 2 letters.');
      return false;
    }
    if (!form.mobileNo || !/^\d{10}$/.test(form.mobileNo)) {
      toast.error('Mobile Number is required and must be 10 digits.');
      return false;
    }
    if (form.doctorName !== undefined && (!form.doctorName || !/^[A-Za-z ]{2,}$/.test(form.doctorName))) {
      toast.error('Doctor Name is required and must be at least 2 letters.');
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
      await deleteBirthRecord(id);
      setRecords(records.filter(record => record.id !== id));
      toast.error('Deleted successfully!');
    } catch (error) {
      toast.error('Error deleting record.');
    }
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(records);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Birth Records');
    XLSX.writeFile(workbook, 'BirthRecords.xlsx');
  };

  const handlePrintCertificate = async (record: any) => {
    try {
      // Fetch parent data exactly like PatientProfile does
      // Requirements: Generate identical certificate as PatientProfile
      let parentData = null;
      if (record.ParentDataId) {
        try {
          const response = await fetch(`/api/parentData/${record.ParentDataId}`);
          if (response.ok) {
            parentData = await response.json();
          }
        } catch (error) {
          console.warn('Failed to fetch parent data from API:', error);
        }
      }

      // If API fetch failed, try fallback to db.json (same as before)
      if (!parentData && record.ParentDataId) {
        try {
          const response = await fetch('/db.json');
          if (response.ok) {
            const data = await response.json();
            parentData = (data.ParentData || []).find((p: any) => p.id === record.ParentDataId);
          }
        } catch (error) {
          console.warn('Failed to fetch parent data from db.json:', error);
        }
      }

      // Handle cases where parentData might be null or incomplete - EXACTLY like PatientProfile
      if (!parentData) {
        const proceedWithoutParent = confirm('Click Ok to proceed');
        if (!proceedWithoutParent) {
          return;
        }
      }

      // Pre-validate critical data before attempting generation - EXACTLY like PatientProfile
      const validationResult = validateRecordForCertificate(record, parentData);
      if (!validationResult.canProceed) {
        if (validationResult.criticalErrors.length > 0) {
          alert(
            'Cannot Generate Certificate\n\n' +
            'The following critical information is missing:\n\n' +
            validationResult.criticalErrors.map(error => `• ${error}`).join('\n') + '\n\n' +
            'Please edit the record to add the missing information.'
          );
          return;
        }

        if (validationResult.warnings.length > 0) {
          const proceedWithWarnings = confirm('Click Ok to proceed');
          if (!proceedWithWarnings) {
            return;
          }
        }
      }

      // Create enhanced template certificate generator
      const generator = new TemplateCertificateGenerator();

      // Calculate Visit ID exactly like PatientProfile (YYYYMMDD/NNN)
      let visitId = '';
      if (record.dateOfBirth) {
        const date = new Date(record.dateOfBirth);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        visitId = `${y}${m}${d}/${String(record.id || record.birthId).slice(-3)}`;
      }

      // Prepare birth record data for certificate generation - EXACTLY like PatientProfile
      const birthRecordData = {
        firstName: record.babyName || record.firstName,
        lastName: record.lastName || '',
        babyName: record.babyName || record.firstName,
        gender: record.gender,
        dateOfBirth: record.dateOfBirth,
        birthId: record.birthId || record.id,
        visitId: visitId,
        admittedDate: record.admittedDate
      };

      // Prepare parent data for certificate generation - EXACTLY like PatientProfile
      const parentDataForCert = parentData ? {
        firstName: parentData.firstName || '',
        lastName: parentData.lastName || '',
        nationality: parentData.nationality || '',
        address: parentData.address || parentData.nationality || ''
      } : {
        firstName: '',
        lastName: '',
        nationality: '',
        address: ''
      };

      // Generate certificate with comprehensive error handling
      await generator.generateAndDownloadCertificate(birthRecordData, parentDataForCert);

      // Log successful generation for debugging
      const babyName = record.babyName || record.firstName;
      console.log('Birth certificate generated successfully for:', babyName);

    } catch (error) {
      // Enhanced error handling with specific error types - EXACTLY like PatientProfile
      console.error('Error generating birth certificate:', error);

      if (error instanceof Error && error.name === 'ValidationError') {
        // Handle validation errors specifically
        showValidationError(error);
      } else if (error instanceof Error && error.name === 'CertificateGenerationError') {
        // Handle certificate generation errors
        showGenerationError(error);
      } else {
        // Handle unexpected errors
        showUnexpectedError(error);
      }
    }
  };

  /**
   * Preview birth certificate in a new window
   */
  const handlePreviewCertificate = async (record: any) => {
    try {
      // Use the same logic as handlePrintCertificate but open in new window instead of downloading

      // Fetch parent data exactly like PatientProfile does
      let parentData = null;
      if (record.ParentDataId) {
        try {
          const response = await fetch(`/api/parentData/${record.ParentDataId}`);
          if (response.ok) {
            parentData = await response.json();
          }
        } catch (error) {
          console.warn('Failed to fetch parent data from API:', error);
        }
      }

      // If API fetch failed, try fallback to db.json
      if (!parentData && record.ParentDataId) {
        try {
          const response = await fetch('/db.json');
          if (response.ok) {
            const data = await response.json();
            parentData = (data.ParentData || []).find((p: any) => p.id === record.ParentDataId);
          }
        } catch (error) {
          console.warn('Failed to fetch parent data from db.json:', error);
        }
      }

      // Calculate Visit ID exactly like PatientProfile (YYYYMMDD/NNN)
      let visitId = '';
      if (record.dateOfBirth) {
        const date = new Date(record.dateOfBirth);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        visitId = `${y}${m}${d}/${String(record.id || record.birthId).slice(-3)}`;
      }

      // Prepare birth record data for certificate generation
      const birthRecordData = {
        firstName: record.babyName || record.firstName,
        lastName: record.lastName || '',
        babyName: record.babyName || record.firstName,
        gender: record.gender,
        dateOfBirth: record.dateOfBirth,
        birthId: record.birthId || record.id,
        visitId: visitId,
        admittedDate: record.admittedDate
      };

      // Prepare parent data for certificate generation - handle null case
      const parentDataForCert = parentData ? {
        firstName: parentData.firstName || '',
        lastName: parentData.lastName || '',
        nationality: parentData.nationality || '',
        address: parentData.address || parentData.nationality || ''
      } : {
        firstName: '',
        lastName: '',
        nationality: '',
        address: ''
      };

      // Create certificate generator and generate for preview
      const generator = new TemplateCertificateGenerator();
      const pdfBlob = await generator.generateForPreview(birthRecordData, parentDataForCert);

      // Open the generated PDF in a new window
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');

      console.log('Birth certificate preview opened for:', record.babyName || record.firstName);

    } catch (error) {
      console.error('Error previewing birth certificate:', error);
      alert('Failed to preview certificate. Please try again.');
    }
  };

  /**
   * Validate record data for certificate generation - EXACTLY like PatientProfile
   * Requirements: 3.5 - Validate required fields before certificate generation
   */
  const validateRecordForCertificate = (record: any, parentData: any) => {
    const criticalErrors: string[] = [];
    const warnings: string[] = [];

    // Critical field validation
    const babyName = record?.babyName || record?.firstName;
    if (!babyName?.trim()) {
      criticalErrors.push('Baby name is required');
    }

    if (!record?.dateOfBirth?.trim()) {
      criticalErrors.push('Date of birth is required');
    }

    // Optional field warnings
    if (!record.gender) {
      warnings.push('Gender information is missing');
    }

    if (!record.placeOfBirth?.trim()) {
      warnings.push('Place of birth is missing');
    }

    if (!record.birthId && !record.id) {
      warnings.push('Registration number is missing');
    }

    // Parent data warnings
    if (!parentData) {
      warnings.push('Parent information is not available');
    } else {
      if (!parentData.firstName?.trim()) {
        warnings.push('Parent name is missing');
      }
      if (!parentData.nationality?.trim()) {
        warnings.push('Parent nationality is missing');
      }
    }

    return {
      canProceed: criticalErrors.length === 0,
      criticalErrors,
      warnings
    };
  };

  /**
   * Handle validation errors with user-friendly messages - EXACTLY like PatientProfile
   * Requirements: 3.5 - Handle validation errors with user-friendly messages
   */
  const showValidationError = (error: Error) => {
    alert(
      'Certificate Validation Failed\n\n' +
      `${error.message}\n\n` +
      'Please check the record information and try again.'
    );
  };

  /**
   * Handle generation errors with fallback options - EXACTLY like PatientProfile
   * Requirements: 3.5 - Handle generation errors with fallback options
   */
  const showGenerationError = (error: Error) => {
    alert(
      'Certificate Generation Failed\n\n' +
      `${error.message}\n\n` +
      'Please try again. If the problem persists, contact system administrator.'
    );
  };

  /**
   * Handle unexpected errors gracefully - EXACTLY like PatientProfile
   * Requirements: 3.5 - Handle unexpected errors gracefully
   */
  const showUnexpectedError = (error: any) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    alert(
      'Failed to Generate Certificate\n\n' +
      `Error: ${errorMessage}\n\n` +
      'Please try again. If the problem persists, contact system administrator.'
    );
  };

  const columns = [
    { key: 'birthId', header: 'Baby ID', sortable: true },
    { key: 'babyName', header: 'Baby Name', sortable: true },
    { key: 'ipNumber', header: 'IP No', sortable: true },

    // { key: 'motherId', header: 'Mother ID', sortable: true },
    { key: 'motherName', header: 'Mother Name', sortable: true },
    { key: 'addedOn', header: 'Added On', sortable: true },
    { key: 'actions', header: 'Actions', sortable: false }
  ];

  // Filtering logic
  const filteredRecords = records.filter(record => {
    // Search filter
    let searchOk = true;
    if (search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      searchOk = (
        (record.babyName && record.babyName.toLowerCase().includes(searchTerm)) ||
        (record.motherName && record.motherName.toLowerCase().includes(searchTerm)) ||
        (record.birthId && record.birthId.toString().toLowerCase().includes(searchTerm)) ||
        (record.ipNumber && record.ipNumber.toString().toLowerCase().includes(searchTerm)) ||
        (record.firstName && record.firstName.toLowerCase().includes(searchTerm)) ||
        (record.lastName && record.lastName.toLowerCase().includes(searchTerm))
      );
    }

    // Date filter - use addedOnRaw date for filtering
    let dateOk = true;
    if (fromDate && record.addedOnRaw) {
      const recordDate = new Date(record.addedOnRaw);
      const filterFromDate = new Date(fromDate);
      // Set start of day for fromDate
      filterFromDate.setHours(0, 0, 0, 0);
      dateOk = recordDate >= filterFromDate;
    }
    if (toDate && dateOk && record.addedOnRaw) {
      const recordDate = new Date(record.addedOnRaw);
      const filterToDate = new Date(toDate);
      // Set end of day for toDate to include the entire day
      filterToDate.setHours(23, 59, 59, 999);
      dateOk = recordDate <= filterToDate;
    }
    // Status filter
    let statusOk = true;
    if (status) statusOk = record.status === status;
    return searchOk && dateOk && statusOk;
  });

  return (
    <>
      <ToastContainer />
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator /> */}
      <PageContainer>
        <SectionHeading title="Birth Records" subtitle="View and manage all birth records" />
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
            // Format Visit ID: YYYYMMDD/NNN
            console.log(record);
            let visitId = '';
            if (record.dateOfBirth) {
              const date = new Date(record.dateOfBirth);
              const y = date.getFullYear();
              const m = String(date.getMonth() + 1).padStart(2, '0');
              const d = String(date.getDate()).padStart(2, '0');
              visitId = `${y}${m}${d}/${String(idx + 1).padStart(3, '0')}`;
            }
            // Get UHID from parentData if available, else from record.uhid
            let uhid = record.uhid || '';
            if (!uhid && record.ParentDataId) {
              // Try to get from ParentData if available in record
              // (Assume ParentData is not available here, so fallback to record.uhid)
            }
            return {
              id: record.id,
              ...record,
              birthId: (
                <Link
                  to={`/profile/patient/${record.birthId}`}
                  style={{ color: '#038ba4', fontWeight: 500, fontSize: 14, textDecoration: 'none', cursor: 'pointer' }}
                  title="View Patient Profile"
                >
                  {record.birthId}
                </Link>
              ),
              visitId: (
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ color: '#038ba4', fontWeight: 500 }}>{visitId}</span>
                  <span style={{ color: '#888', fontSize: 12, fontWeight: 400, marginTop: 2 }}>{uhid}</span>
                </span>
              ),
              actions: (
                <div className="action-buttons">
                  <button title="Preview Certificate" className="icon-btn preview-btn" onClick={() => handlePreviewCertificate(record)}>
                    <Eye size={20} />
                  </button>
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
            };
          })} />
        </div>
      </PageContainer>
      {/* <Footer /> */}
    </>
  );
};

export default BirthRecords;
