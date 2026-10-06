import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, limit, onLimitChange, limits = [5, 10, 20, 50], allowCustomLimit = false }) => {
  if (totalPages <= 1 && limit === undefined) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
          </p>
          {limit !== undefined && onLimitChange && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>Items per page:</span>
              {allowCustomLimit ? (
                <input
                  type="number"
                  min="1"
                  value={limit === '' ? '' : limit}
                  onChange={(e) => {
                    if (e.target.value === '') {
                      onLimitChange('');
                    } else {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val > 0) {
                        onLimitChange(val);
                        onPageChange(1);
                      }
                    }
                  }}
                  onBlur={() => {
                     if (limit === '') {
                         onLimitChange(10); // default back if left empty
                         onPageChange(1);
                     }
                  }}
                  className="w-20 border-gray-300 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-1 px-2 outline-none"
                />
              ) : (
                <select
                  value={limit}
                  onChange={(e) => {
                    onLimitChange(Number(e.target.value));
                    onPageChange(1); // Reset to first page when limit changes
                  }}
                  className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-1 pl-2 pr-6"
                >
                  {limits.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
        <div>
          {totalPages > 1 && (
            <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                if (
                  totalPages > 7 &&
                  idx + 1 !== 1 &&
                  idx + 1 !== totalPages &&
                  Math.abs(currentPage - (idx + 1)) > 1
                ) {
                  if (idx + 1 === 2 || idx + 1 === totalPages - 1) {
                    return <span key={idx} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">...</span>;
                  }
                  return null;
                }
                return (
                  <button
                    key={idx}
                    onClick={() => onPageChange(idx + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === idx + 1
                        ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pagination;
