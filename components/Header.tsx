import React from 'react';
import type { User } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onHelpClick: () => void;
  onCommandMenuClick: () => void;
}

const ThemeToggleButton: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
          onClick={toggleTheme}
          className="bg-white/20 hover:bg-white/30 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          aria-label={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
          title={`Tema ${theme === 'light' ? 'Escuro' : 'Claro'}`}
        >
          {theme === 'light' ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
    );
};

const Header: React.FC<HeaderProps> = ({ user, onLogout, onHelpClick, onCommandMenuClick }) => {
  return (
    <header className="relative bg-brand-dark/80 dark:bg-brand-dark-bg/80 backdrop-blur-lg text-white p-8 md:p-12 text-center shadow-lg">
       <div className="absolute top-4 left-4 flex items-center gap-2 sm:gap-4 text-sm">
        {user && (
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline">Olá, <strong>{user.name}</strong></span>
            <button
              onClick={onLogout}
              className="bg-white/20 hover:bg-white/30 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Sair da conta"
              title="Sair"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div className="absolute top-4 right-4 flex items-center gap-2 sm:gap-4">
        <button
            onClick={onCommandMenuClick}
            className="hidden sm:flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs px-3 py-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Abrir menu de comandos"
        >
            Busca Rápida <kbd className="font-sans font-semibold">⌘K</kbd>
        </button>
        <ThemeToggleButton />
        <button
          onClick={onHelpClick}
          className="bg-white/20 hover:bg-white/30 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Ajuda e Informações sobre o App"
          title="Ajuda"
        >
          <span className="text-2xl">?</span>
        </button>
      </div>
      
      <div className="flex flex-col items-center">
        <Logo className="h-12 md:h-16" />
        <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">Bolsão de Ideias</h1>
      </div>
      <p className="text-lg md:text-xl max-w-3xl mx-auto">
        Uma plataforma interativa para análise, priorização e exploração de um portfólio de ideias de serviços inovadores.
      </p>
    </header>
  );
};

export default Header;
