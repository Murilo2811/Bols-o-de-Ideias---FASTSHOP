import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const buttonClasses = "relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-brand-dark-border text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-brand-dark-card hover:bg-gray-50 dark:hover:bg-brand-dark-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

  return (
    <nav className="flex items-center justify-center mt-8" aria-label="Pagination">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`${buttonClasses} rounded-l-md`}
      >
        Anterior
      </button>
      
      <span className="relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 dark:border-brand-dark-border bg-white dark:bg-brand-dark-card text-sm font-medium text-gray-700 dark:text-gray-300">
        Página {currentPage} de {totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`${buttonClasses} rounded-r-md`}
      >
        Próxima
      </button>
    </nav>
  );
};

export default Pagination;
