// Searchbar.tsx
import React from 'react';
import '../styles/searchbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';

interface SearchbarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputStyle?: React.CSSProperties;
}

const Searchbar: React.FC<SearchbarProps> = ({ value, onChange, inputStyle }) => {
  return (
    <div className="searchbar-container mb-3 mt-3" style={{ maxWidth: '100%'}}>
      <input
        type="search"
        className="form-control search-input"
        placeholder="Search here..."
        value={value}
        onChange={onChange}
        style={inputStyle}
      />
      <i className="fa-solid fa-magnifying-glass search-icon"></i>
    </div>

  );
};

export default Searchbar;
