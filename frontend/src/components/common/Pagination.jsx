// src/components/common/Pagination.jsx
import PropTypes from 'prop-types';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';
import classNames from 'classnames';

/**
 * Pagination component for handling page navigation
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  showPageInfo = true,
  maxVisiblePages = 5,
  className = ''
}) => {
  // Don't render if there's only one page or no data
  if (totalPages <= 1) {
    return null;
  }

  // Calculate page numbers to display
  const getVisiblePages = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(0, currentPage - halfVisible);
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const startElement = currentPage * pageSize + 1;
  const endElement = Math.min((currentPage + 1) * pageSize, totalElements);

  // Page size options
  const pageSizeOptions = [5, 10, 20, 50, 100];

  return (
    <div className={classNames('flex flex-col sm:flex-row justify-between items-center', className)}>
      {/* Page info */}
      {showPageInfo && (
        <div className="flex items-center mb-4 sm:mb-0">
          <span className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">{startElement}</span>
            {' '}to{' '}
            <span className="font-medium">{endElement}</span>
            {' '}of{' '}
            <span className="font-medium">{totalElements}</span>
            {' '}results
          </span>
          
          {showPageSizeSelector && (
            <div className="ml-4 flex items-center">
              <label htmlFor="pageSize" className="text-sm text-gray-700 mr-2">
                Show:
              </label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Pagination controls */}
      <nav className="flex items-center space-x-1">
        {/* First page button */}
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          className={classNames(
            'p-2 rounded-md text-sm font-medium transition-colors',
            currentPage === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
          )}
          aria-label="Go to first page"
        >
          <ChevronDoubleLeftIcon className="h-4 w-4" />
        </button>

        {/* Previous page button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={classNames(
            'p-2 rounded-md text-sm font-medium transition-colors',
            currentPage === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
          )}
          aria-label="Go to previous page"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        {visiblePages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={classNames(
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-primary-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500'
                : 'text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
            )}
            aria-label={`Go to page ${page + 1}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page + 1}
          </button>
        ))}

        {/* Next page button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className={classNames(
            'p-2 rounded-md text-sm font-medium transition-colors',
            currentPage === totalPages - 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
          )}
          aria-label="Go to next page"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>

        {/* Last page button */}
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
          className={classNames(
            'p-2 rounded-md text-sm font-medium transition-colors',
            currentPage === totalPages - 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
          )}
          aria-label="Go to last page"
        >
          <ChevronDoubleRightIcon className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalElements: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func,
  showPageSizeSelector: PropTypes.bool,
  showPageInfo: PropTypes.bool,
  maxVisiblePages: PropTypes.number,
  className: PropTypes.string
};

export default Pagination;