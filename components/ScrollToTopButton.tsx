import React from 'react';

interface ScrollToTopButtonProps {
  onClick: () => void;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 bg-brand-dark dark:bg-gray-200 text-white dark:text-brand-dark w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-black dark:hover:bg-white hover:scale-110 transform transition-all duration-300 ease-in-out z-40 animate-fade-in"
      aria-label="Voltar ao topo da página"
      title="Voltar ao topo"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
};

export default ScrollToTopButton;