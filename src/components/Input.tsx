import React from 'react';
// import '../styles/form.css';

interface InputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  width?: string | number;
  name: string;
}

const Input: React.FC<InputProps> = ({ label, value, onChange, placeholder, type = 'text', width, name }) => (
  <div className="input-container">
    <label className="input-label">{label}</label>
    <input
      className="form-control"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={width ? { width } : {}}
      name={name}
    />
  </div>
);

export default Input; 