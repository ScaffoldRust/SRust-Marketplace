import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pagination: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pagination,
}) => {
  const handlePrev = () => {
    if (currentPage > 1) {
      pagination(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      pagination(currentPage + 1);
    }
  };
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than max, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate start and end of page range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning
      if (currentPage <= 3) {
        end = 4;
      }
      
      // Adjust if at the end
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      // Add ellipsis if needed before middle pages
      if (start > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed after middle pages
      if (end < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include last page if we have more than one page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full mx-auto py-4">
      <div className="text-sm text-text-light hidden sm:block">
        Showing page <span className="font-medium text-text">{currentPage}</span> of <span className="font-medium text-text">{totalPages}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          className={`p-2 rounded-lg border ${currentPage === 1 
            ? 'border-gray-100 text-gray-300 cursor-not-allowed' 
            : 'border-gray-200 text-text-light hover:border-primary hover:text-primary transition-colors'}`}
          onClick={handlePrev}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>
        
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 text-text-light">...</span>
              ) : (
                <button
                  onClick={() => typeof page === 'number' && pagination(page)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${currentPage === page 
                    ? 'bg-primary text-white font-medium' 
                    : 'text-text-light hover:bg-primary-light/10'}`}
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <button
          className={`p-2 rounded-lg border ${currentPage === totalPages 
            ? 'border-gray-100 text-gray-300 cursor-not-allowed' 
            : 'border-gray-200 text-text-light hover:border-primary hover:text-primary transition-colors'}`}
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
