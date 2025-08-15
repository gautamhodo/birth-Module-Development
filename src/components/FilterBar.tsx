// FilterBar.tsx
import React from 'react';
import Searchbar from './Searchbar'; // Assuming Searchbar.tsx is in the same directory

interface FilterBarProps {
  fromDate: string;
  toDate: string;
  onFromDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  status: string;
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  autoRefresh: string;
  onAutoRefreshChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onRefresh: () => void;
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  fromDate, toDate, onFromDateChange, onToDateChange,
  status, onStatusChange,
  autoRefresh, onAutoRefreshChange,
  onRefresh, search, onSearchChange, onExport
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: 16,
      border: '1px dashed #ccc',
      borderRadius: 8,
      marginBottom: 24,
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 13, color: '#444' }}>From Date</label>
        <input type="date" value={fromDate} onChange={onFromDateChange} style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 13, color: '#444' }}>To Date</label>
        <input type="date" value={toDate} onChange={onToDateChange} style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 32 }}>
        <label style={{ fontSize: 13, color: '#444' }}>Current Status</label>
        <select value={status} onChange={onStatusChange} style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc', minWidth: 120 }}>
          <option value="">Current Status</option>
          <option value="Checked In">Checked In</option>
          <option value="Discharged">Discharged</option>
          <option value="Pending">Pending</option>
        </select>
          <a href="#" style={{ fontSize: 12, color: '#038ba4', marginTop: 2, textDecoration: 'none' }} onClick={e => { e.preventDefault(); onStatusChange({ target: { value: '' } } as any); }}>Clear Filter</a>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 12 }}>
        <label style={{ fontSize: 13, color: '#444' }}>Auto-Refresh Timer</label>
        <select value={autoRefresh} onChange={onAutoRefreshChange} style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc', minWidth: 120 }}>
          <option value="5">5 Minutes</option>
          <option value="10">10 Minutes</option>
          <option value="15">15 Minutes</option>
          <option value="30">30 Minutes</option>
        </select>
      </div>
      <button onClick={onRefresh} style={{ background: 'none', border: 'none', marginTop: 24, cursor: 'pointer', color: '#038ba4', fontSize: 20 }} title="Refresh">
        <i className="fa fa-refresh" />
      </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <Searchbar value={search} onChange={onSearchChange} inputStyle={{ height: 38, minWidth: 200 }} />
        </div>
        <button onClick={onExport} className="btn-with-gradient" style={{ height: 38 }}>
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default FilterBar; 