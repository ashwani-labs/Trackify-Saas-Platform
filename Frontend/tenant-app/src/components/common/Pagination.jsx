import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="btn btn-secondary"
        style={{ padding: '0.5rem', opacity: currentPage === 0 ? 0.5 : 1 }}
      >
        <ChevronLeft size={18} />
      </button>

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`btn ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
            style={{ minWidth: '40px', padding: '0.5rem' }}
          >
            {page + 1}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="btn btn-secondary"
        style={{ padding: '0.5rem', opacity: currentPage >= totalPages - 1 ? 0.5 : 1 }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
