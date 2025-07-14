import React from 'react';
// import '../styles/form.css';

interface Option {
  label: string;
  value: string;
}




interface DropInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  width?: string | number;
  name: string;
}

const DropInput: React.FC<DropInputProps> = ({ label, value, onChange, options, width, name }) => (
  <div className="dropinput-container">
    <label className="dropinput-label">{label}</label>
    <select className="form-select" value={value} onChange={onChange} style={width ? { width } : {}} name={name}>
      <option value="" disabled>Select {label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default DropInput; 