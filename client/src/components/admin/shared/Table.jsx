import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Table Component for Admin Pages
 * 
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions with {header, accessor, Cell}
 * @param {Array} props.data - Array of data objects
 * @param {Function} props.onSort - Function to handle sorting
 * @param {Object} props.sortConfig - Current sort configuration {key, direction}
 * @param {Object} props.pagination - Pagination object {page, total, limit}
 * @param {Function} props.onPageChange - Function to handle page change
 * @param {Boolean} props.isLoading - Loading state
 * @param {String} props.emptyMessage - Message to display when no data
 */
function Table({
  columns,
  data,
  onSort,
  sortConfig,
  pagination,
  onPageChange,
  isLoading,
  emptyMessage = "No data found"
}) {
  // Handle column header click for sorting
  const handleHeaderClick = (accessor) => {
    if (onSort) {
      onSort(accessor);
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    if (!pagination) return null;
    
    const { page, total, limit } = pagination;
    const totalPages = Math.ceil(total / limit);
    
    if (totalPages <= 1) return null;
    
    return (
      <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
              <span className="font-medium">{total}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Previous</span>
                <i className="fas fa-chevron-left h-5 w-5"></i>
              </button>
              
              {/* Page numbers */}
              {[...Array(totalPages).keys()].map((number) => {
                const pageNumber = number + 1;
                // Show current page, first, last, and pages around current
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= page - 1 && pageNumber <= page + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => onPageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pageNumber
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                
                // Show ellipsis
                if (
                  (pageNumber === 2 && page > 3) ||
                  (pageNumber === totalPages - 1 && page < totalPages - 2)
                ) {
                  return (
                    <span
                      key={pageNumber}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                    >
                      ...
                    </span>
                  );
                }
                
                return null;
              })}
              
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Next</span>
                <i className="fas fa-chevron-right h-5 w-5"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // Render loading skeleton
  const renderSkeleton = () => {
    return (
      <tbody className="bg-white divide-y divide-gray-200">
        {[...Array(5).keys()].map((i) => (
          <tr key={i}>
            {columns.map((column, index) => (
              <td key={index} className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.accessor}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => onSort && handleHeaderClick(column.accessor)}
              >
                <div className="flex items-center">
                  {column.header}
                  {sortConfig && sortConfig.key === column.accessor && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        {isLoading ? (
          renderSkeleton()
        ) : data.length > 0 ? (
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, rowIndex) => (
              <tr key={item.id || rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.accessor} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {column.Cell ? column.Cell(item) : item[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        )}
      </table>
      
      {renderPagination()}
    </div>
  );
}

export default Table;
