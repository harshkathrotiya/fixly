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
 * @param {String} props.className - Additional CSS classes
 */
function Table({
  columns,
  data,
  onSort,
  sortConfig,
  pagination,
  onPageChange,
  isLoading,
  emptyMessage = "No data found",
  className = ""
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
      <div className="pagination-container">
        <div className="pagination-mobile">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className={`pagination-btn ${page === 1 ? 'disabled' : ''}`}
          >
            <i className="fas fa-chevron-left mr-1"></i> Previous
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className={`pagination-btn ${page === totalPages ? 'disabled' : ''}`}
          >
            Next <i className="fas fa-chevron-right ml-1"></i>
          </button>
        </div>
        <div className="pagination-desktop">
          <div>
            <p className="pagination-info">
              Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
              <span className="font-medium">{total}</span> results
            </p>
          </div>
          <div>
            <nav className="pagination-nav" aria-label="Pagination">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className={`pagination-btn ${page === 1 ? 'disabled' : ''}`}
              >
                <span className="sr-only">Previous</span>
                <i className="fas fa-chevron-left"></i>
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
                      className={`pagination-page-btn ${page === pageNumber ? 'active' : ''}`}
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
                      className="pagination-ellipsis"
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
                className={`pagination-btn ${page === totalPages ? 'disabled' : ''}`}
              >
                <span className="sr-only">Next</span>
                <i className="fas fa-chevron-right"></i>
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
                <div className="h-4 skeleton rounded"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="px-6 py-10 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <i className="fas fa-inbox text-gray-400 text-xl"></i>
              </div>
              <p className="text-gray-500 font-medium">{emptyMessage}</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter to find what you're looking for.</p>
            </div>
          </td>
        </tr>
      </tbody>
    );
  };

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  scope="col"
                  className={`${onSort ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  onClick={() => onSort && handleHeaderClick(column.accessor)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {sortConfig && sortConfig.key === column.accessor && (
                      <span className="ml-1 text-blue-500">
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} text-xs`}></i>
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>


            {isLoading ? (
              <tbody>
                {[...Array(5).keys()].map((i) => (
                  <tr key={i}>
                    {columns.map((column, index) => (
                      <td key={index}>
                        <div className="h-4 skeleton rounded w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ) : data.length > 0 ? (
              <tbody>
                {data.map((item, rowIndex) => (
                  <tr key={item.id || rowIndex}>
                    {columns.map((column) => (
                      <td key={column.accessor}>
                        {column.Cell ? column.Cell(item) : item[column.accessor]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={columns.length} className="px-6 py-10 text-center">
                    <div className="empty-state">
                      <div className="empty-icon">
                        <i className="fas fa-inbox text-gray-400 text-xl"></i>
                      </div>
                      <h3 className="empty-title">{emptyMessage}</h3>
                      <p className="empty-description">Try adjusting your search or filter to find what you're looking for.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            )}

        </table>
      </div>

      {renderPagination()}
    </div>
  );
}

export default Table;
