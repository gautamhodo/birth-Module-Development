import React from 'react';
// import '../styles/form.css';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  width?: string | number;
  name: string;
}

const DateInput: React.FC<DateInputProps> = ({ label, value, onChange, width, name }) => (
  <div className="dateinput-container">
    <label className="dateinput-label">{label}</label>
    <input
      className="form-control"
      type="date"
      value={value}
      onChange={onChange}
      style={width ? { width } : {}}
      name={name}
    />
  </div>
);

export default DateInput; 