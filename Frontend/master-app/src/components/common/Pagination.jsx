import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div className="flex justify-between items-center mt-6 p-4 bg-[#1e2330] rounded-xl border border-[#2d3446]">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-[#272e3f] text-[#a0aec0] hover:text-white hover:bg-[#323a4f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>

      <div className="flex space-x-2">
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              currentPage === page 
                ? 'bg-blue-600 text-white' 
                : 'bg-transparent text-[#a0aec0] hover:bg-[#272e3f] hover:text-white'
            }`}
          >
            {page + 1}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-[#272e3f] text-[#a0aec0] hover:text-white hover:bg-[#323a4f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
