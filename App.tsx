import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ServicesProvider, useServices } from './contexts/ServicesContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import AuthPage from './components/AuthPage';

import Header from './components/Header';
import NavigationBar from './components/NavigationBar';
import OverviewSection from './components/OverviewSection';
import ClusterAnalysisSection from './components/ClusterAnalysisSection';
import BusinessModelAnalysisSection from './components/BusinessModelAnalysisSection';
import IdeaGeneratorSection from './components/IdeaGeneratorSection';
import PrioritizationSection from './components/PrioritizationSection';
import ServiceExplorerSection from './components/ServiceExplorerSection';
import Footer from './components/Footer';
import Loader from './components/Loader';
import Notification from './components/Notification';
import HelpModal from './components/HelpModal';
import CommandMenu from './components/CommandMenu';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <ServicesProvider>
      <MainAppContent />
    </ServicesProvider>
  );
};

const MainAppContent: React.FC = () => {
  const { services, isLoading, loadingMessage, appError, notification } = useServices();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('ideaGenerator');
  const [highlightedClusterId, setHighlightedClusterId] = useState<string | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);


  const sections: { [key: string]: React.RefObject<HTMLElement> } = {
    ideaGenerator: useRef<HTMLElement>(null),
    overview: useRef<HTMLElement>(null),
    clusterAnalysis: useRef<HTMLElement>(null),
    businessModelAnalysis: useRef<HTMLElement>(null),
    prioritization: useRef<HTMLElement>(null),
    serviceExplorer: useRef<HTMLElement>(null),
  };
  
  useEffect(() => {
    const clearHighlight = () => setHighlightedClusterId(null);
    document.addEventListener('click', clearHighlight);
    return () => document.removeEventListener('click', clearHighlight);
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsCommandMenuOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = useCallback((sectionId: string) => {
    sections[sectionId].current?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(sectionId);
    setIsCommandMenuOpen(false);
  }, [sections]);
  
  const handleClusterNavigate = (clusterId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const element = document.getElementById(`cluster-card-${clusterId}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedClusterId(clusterId);
        setActiveSection('clusterAnalysis');
    }
  };

  if (isLoading && !appError) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-brand-dark-bg' : 'bg-gray-100'}`}>
        <Loader text={loadingMessage} />
      </div>
    );
  }

  if (appError) {
    return (
      <div className={`flex items-center justify-center min-h-screen p-4 ${theme === 'dark' ? 'bg-brand-dark-bg' : 'bg-gray-100'}`}>
        <div className="w-full max-w-2xl bg-white dark:bg-brand-dark-card p-8 rounded-xl shadow-2xl text-center">
           <svg className="mx-auto h-16 w-16 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4.998C12.962 3.667 11.038 3.667 10.268 4.998L3.33 16.002c-.77 1.333.162 3 1.732 3z" />
           </svg>
          <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-100">{appError.title}</h2>
          <div className="mt-4 text-gray-600 dark:text-gray-300">{appError.details}</div>
          <div className="mt-8 bg-gray-50 dark:bg-brand-dark-bg p-6 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-4">Como Resolver?</h3>
            <div className="dark:text-gray-300">{appError.troubleshootingSteps}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-brand-dark-bg min-h-screen font-sans aurora-bg">
      <Header user={user} onLogout={logout} onHelpClick={() => setIsHelpModalOpen(true)} onCommandMenuClick={() => setIsCommandMenuOpen(true)} />
      <NavigationBar onNavigate={handleNavigate} activeSection={activeSection} />

      <main className="container mx-auto p-4 md:p-8 relative z-10">
        <IdeaGeneratorSection ref={sections.ideaGenerator} />
        <OverviewSection ref={sections.overview} onClusterClick={handleClusterNavigate} />
        <ClusterAnalysisSection ref={sections.clusterAnalysis} highlightedClusterId={highlightedClusterId} />
        <BusinessModelAnalysisSection ref={sections.businessModelAnalysis} />
        <PrioritizationSection ref={sections.prioritization} />
        <ServiceExplorerSection ref={sections.serviceExplorer} />
      </main>

      <Footer />

      {notification && <Notification message={notification.message} type={notification.type} />}
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
      <CommandMenu 
        isOpen={isCommandMenuOpen} 
        onClose={() => setIsCommandMenuOpen(false)} 
        services={services}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default App;