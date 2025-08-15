import React, { useState, useMemo } from 'react';
import '../Styles/Table.css';
import Pagination from './Pagination';
import { Link } from 'react-router-dom';
import SortableHeader from './SortableHeader';


export interface Column {
  key: string;
  header: string;
  sortable?: boolean;
  sortKey?: string;
}

interface TableProps {
  columns: Column[];
  data: Record<string, any>[];
}

const Table: React.FC<TableProps> = ({ columns, data }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
      return setSortConfig(null); // Reset sort if clicking the same column twice
    }
    setSortConfig({ key, direction });
    setPage(1); // Reset to first page when sorting changes
  };

  // Apply sorting to data
  const sortedData = useMemo(() => {
    if (!sortConfig) return [...data];
    
    return [...data].sort((a, b) => {
      const column = columns.find(col => col.key === sortConfig.key);
      const sortKey = column?.sortKey || sortConfig.key;
      
      if (a[sortKey] < b[sortKey]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortKey] > b[sortKey]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig, columns]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <>
      <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <SortableHeader
                key={col.key}
                column={col}
                sortConfig={sortConfig}
                onSort={requestSort}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ textAlign: 'center' }}>No data found.</td>
            </tr>
          ) : (
            paginatedData.map((row, idx) => (
              <tr key={row.id || idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.key === 'id' && typeof row[col.key] === 'string' ? (
                      <Link
                        to={`/profile/birth/${row[col.key]}`}
                        className={row[col.key] === '1008888889079278' ? 'id-link special-baby-id' : 'id-link'}
                        style={row[col.key] === '1008888889079278' ? { color: '#038ba4' } : {}}
                      >
                        {row[col.key]}
                      </Link>
                    ) : (
                      typeof row[col.key] === 'number'
                        ? row[col.key].toString()
                        : row[col.key]
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      
    </div>
    <div>
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          setPage={setPage}
          setRowsPerPage={setRowsPerPage}
        />
      </div>
    </>
  );
};

export default Table;
