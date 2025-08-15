import React from 'react';
import extendableIcon from '../assets/extendable.png';

interface SortableHeaderProps {
  column: {
    key: string;
    header: string;
    sortable?: boolean;
  };
  sortConfig: {
    key: string;
    direction: 'ascending' | 'descending' | null;
  } | null;
  onSort: (key: string) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ column, sortConfig, onSort }) => {
  const isSorted = sortConfig && sortConfig.key === column.key;
  
  const handleSort = () => {
    if (column.sortable !== false) {
      onSort(column.key);
    }
  };

  return (
    <th 
      onClick={handleSort}
      style={{
        cursor: column.sortable !== false ? 'pointer' : 'default',
        position: 'relative',
        paddingRight: '24px',
        userSelect: 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {column.header}
        {column.sortable !== false && (
          <span 
            style={{
              marginLeft: '8px',
              display: 'inline-flex',
              flexDirection: 'column',
              justifyContent: 'center',
              opacity: isSorted ? 1 : 0.3,
              transition: 'opacity 0.2s',
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: `translateY(-50%) ${isSorted && sortConfig?.direction === 'descending' ? 'rotate(180deg)' : ''}`,
              transformOrigin: 'center',
            }}
          >
            <img 
              src={extendableIcon} 
              alt="Sort" 
              style={{ 
                width: '16px', 
                height: '16px',
                display: 'block'
              }} 
            />
          </span>
        )}
      </div>
    </th>
  );
};

export default SortableHeader;
