import React from 'react';
import '../styles/SearchPatientInput.css';

interface SearchPatientInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  count?: number;
  results?: Array<{ id: string; label: string }>;
  onSelectResult?: (id: string) => void;
}

const SearchPatientInput: React.FC<SearchPatientInputProps> = ({
  value,
  onChange,
  count = 0,
  results = [],
  onSelectResult,
}) => {
  return (
    <div className="search-patient-section">
      <label className="search-patient-label">Search Existing Patient</label>
      <div className="search-patient-input-wrapper">
        <input
          className="search-patient-input"
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Search Patient with Name or Card No. or Mobile No."
        />
        <span className="search-patient-count-badge">{count}</span>
      </div>
      {results.length > 0 && (
        <ul className="search-patient-dropdown">
          {results.map((r) => (
            <li
              key={r.id}
              className="search-patient-dropdown-item"
              onClick={() => onSelectResult && onSelectResult(r.id)}
            >
              {r.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchPatientInput; 