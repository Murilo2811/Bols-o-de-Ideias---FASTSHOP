import React, { useState, useEffect, useMemo } from 'react';
import type { Service } from '../types';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  onNavigate: (sectionId: string) => void;
}

const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onClose, services, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const navigationActions = useMemo(() => [
    { id: 'ideaGenerator', title: 'Ir para Gerador de Ideias', icon: '📝' },
    { id: 'overview', title: 'Ir para Visão Geral', icon: '📊' },
    { id: 'clusterAnalysis', title: 'Ir para Análise de Clusters', icon: '🧩' },
    { id: 'businessModelAnalysis', title: 'Ir para Modelos de Negócio', icon: '💼' },
    { id: 'prioritization', title: 'Ir para Priorização', icon: '🏆' },
    { id: 'serviceExplorer', title: 'Ir para Buscador de Ideias', icon: '🔍' },
  ], []);

  const filteredServices = useMemo(() => {
    if (!searchTerm) return [];
    return services.filter(s => s.service.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10);
  }, [searchTerm, services]);

  const allItems = useMemo(() => {
     const filteredActions = navigationActions.filter(action => action.title.toLowerCase().includes(searchTerm.toLowerCase()));
     return [...filteredActions, ...filteredServices];
  }, [navigationActions, filteredServices, searchTerm]);

  // Reset search term and index when menu is opened
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setActiveIndex(0);
    }
  }, [isOpen]);
  
  // Reset index when search term changes
  useEffect(() => {
    setActiveIndex(0);
  }, [searchTerm]);
  
  const handleSelect = (item: (typeof allItems)[0]) => {
    if (!item) return;
    if ('title' in item) { // Navigation action
      onNavigate(item.id);
    } else { // Service item, just navigate to the explorer for now
      onNavigate('serviceExplorer');
    }
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % (allItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + (allItems.length || 1)) % (allItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect(allItems[activeIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeIndex, allItems, onNavigate, onClose]);


  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start pt-20 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-brand-dark-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[70vh] flex flex-col border border-gray-200 dark:border-brand-dark-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b dark:border-brand-dark-border">
          <input
            type="text"
            placeholder="Buscar ideia ou navegar para seção..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-lg text-brand-dark dark:text-gray-100 placeholder-gray-400 focus:outline-none"
            autoFocus
          />
        </div>
        <ul className="overflow-y-auto p-2">
          {allItems.length > 0 ? (
            allItems.map((item, index) => {
              const isActive = index === activeIndex;
              const itemClasses = `
                w-full text-left p-3 rounded-lg flex items-center gap-4 transition-colors
                ${isActive ? 'bg-gray-200 text-brand-dark dark:bg-brand-dark-border' : 'hover:bg-gray-100 dark:hover:bg-brand-dark-border/50'}
              `;

              if ('title' in item) { // Navigation action
                return (
                  <li key={item.id}>
                    <button onClick={() => handleSelect(item)} className={itemClasses}>
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{item.title}</span>
                    </button>
                  </li>
                );
              } else { // Service item
                return (
                  <li key={item.id}>
                     <button onClick={() => handleSelect(item)} className={itemClasses}>
                       <span className="text-xl">💡</span>
                       <div>
                         <span className="font-semibold text-gray-800 dark:text-gray-200">{item.service}</span>
                         <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.need}</p>
                       </div>
                    </button>
                  </li>
                );
              }
            })
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Nenhum resultado encontrado.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CommandMenu;