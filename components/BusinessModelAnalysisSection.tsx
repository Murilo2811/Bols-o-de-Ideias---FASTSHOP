import React, { useState, useMemo, forwardRef } from 'react';
import Section from './Section';
import Modal from './Modal';
import { businessModelData, BusinessModel } from '../data/businessModelData';
import { useServices } from '../contexts/ServicesContext';
import { criteriaData } from '../data/criteriaData';
import { mapBusinessModel } from '../utils/businessModelMapper';
import type { Service, ServiceStatus } from '../types';

interface BusinessModelAnalysisSectionProps {}

const statusDisplayMap: Record<ServiceStatus, string> = {
    'avaliação': 'Avaliação',
    'aprovada': 'Aprovada',
    'cancelada': 'Cancelada',
    'finalizada': 'Finalizada',
};
const statusColorMap: Record<ServiceStatus, string> = {
    'avaliação': 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100',
    'aprovada': 'bg-gray-800 text-white dark:bg-gray-200 dark:text-black font-bold',
    'cancelada': 'bg-gray-400 text-white dark:bg-gray-500 dark:text-white',
    'finalizada': 'bg-gray-500 text-white dark:bg-gray-400 dark:text-black',
};

const BusinessModelCard: React.FC<{ title: string; valor: string; caracteristicas: string[] }> = ({ title, valor, caracteristicas }) => (
  <div className="bg-white dark:bg-brand-dark-card p-6 rounded-xl shadow-lg flex flex-col h-full">
    <h3 className="text-2xl font-bold text-brand-dark dark:text-white mb-3">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
      <strong>Proposta de Valor:</strong> {valor}
    </p>
    <div className="mt-auto">
      <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Características Principais:</h4>
      <ul className="list-disc ml-6 text-gray-600 dark:text-gray-300 space-y-1">
        {caracteristicas.map((car, index) => <li key={index}>{car}</li>)}
      </ul>
    </div>
  </div>
);

const ServiceDetailView: React.FC<{ service: Service; onBack: () => void; }> = ({ service, onBack }) => {
    const totalScore = service.scores.reduce((acc, score) => acc + (score || 0), 0);
    const revenueFormatted = (service.revenueEstimate || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div>
            <button onClick={onBack} className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-mid dark:text-brand-light hover:text-brand-dark dark:hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Voltar para a lista
            </button>
            <div className="space-y-5">
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Benefício Principal</h4>
                    <p className="text-gray-800 dark:text-gray-200 mt-1">{service.need}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t dark:border-brand-dark-border">
                    <div><strong className="text-gray-600 dark:text-gray-400 block text-sm">Público-Alvo:</strong> <span className="dark:text-gray-200">{service.targetAudience}</span></div>
                    <div><strong className="text-gray-600 dark:text-gray-400 block text-sm">Cluster:</strong> <span className="dark:text-gray-200">{service.cluster}</span></div>
                    <div>
                        <strong className="text-gray-600 dark:text-gray-400 block text-sm">Status:</strong>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColorMap[service.status || 'avaliação']}`}>
                            {statusDisplayMap[service.status || 'avaliação']}
                        </span>
                    </div>
                    <div><strong className="text-gray-600 dark:text-gray-400 block text-sm">Criador:</strong> <span className="dark:text-gray-200">{service.creatorName || 'N/A'}</span></div>
                </div>
                 <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Ranking de Priorização</h4>
                    <div className="space-y-2 p-4 bg-gray-50 dark:bg-brand-dark-bg rounded-lg border dark:border-brand-dark-border">
                        {criteriaData.map((criterion, index) => (
                        <div key={criterion.id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 dark:text-gray-300">{criterion.shortTitle}</span>
                            <span className="font-bold text-lg text-brand-mid dark:text-brand-light">{service.scores[index] || 0}</span>
                        </div>
                        ))}
                        <div className="flex justify-between items-center border-t dark:border-brand-dark-border pt-2 mt-2">
                        <span className="font-bold text-gray-800 dark:text-gray-100">Total</span>
                        <span className="font-bold text-xl text-brand-dark dark:text-white">{totalScore}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estimativa Faturamento</h4>
                    <p className="text-gray-800 dark:text-gray-100 text-2xl font-bold mt-1">{revenueFormatted}</p>
                </div>
            </div>
        </div>
    );
};

const BusinessModelAnalysisSection = forwardRef<HTMLElement, BusinessModelAnalysisSectionProps>((props, ref) => {
  const { services } = useServices();
  const [activeModel, setActiveModel] = useState<BusinessModel | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const ideasForModel = useMemo(() => {
    if (!activeModel) return [];
    return services.filter(s => mapBusinessModel(s.businessModel) === activeModel.shortTitle);
  }, [activeModel, services]);

  const handleModelClick = (model: BusinessModel) => {
    setActiveModel(model);
  };
  
  const handleCloseModal = () => {
    setActiveModel(null);
    setSelectedService(null);
  };

  const modalTitle = useMemo(() => {
    if (selectedService) return selectedService.service;
    if (activeModel) return `Ideias do Modelo: ${activeModel.shortTitle}`;
    return '';
  }, [activeModel, selectedService]);

  return (
    <Section ref={ref} id="businessModelAnalysis" title="Análise dos Modelos de Negócio" subtitle="Explore as diferentes formas de gerar valor e receita. Clique em um modelo para ver as ideias associadas.">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {businessModelData.map(model => (
            <div key={model.id} className="cursor-pointer group" onClick={() => handleModelClick(model)}>
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-light to-brand-mid rounded-xl blur opacity-0 group-hover:opacity-60 transition duration-500 group-hover:duration-200 animate-glow"></div>
                  <div className="relative">
                    <BusinessModelCard {...model} />
                  </div>
                </div>
            </div>
        ))}
      </div>

      {activeModel && (
        <Modal isOpen={!!activeModel} onClose={handleCloseModal} title={modalTitle}>
          {selectedService ? (
            <ServiceDetailView service={selectedService} onBack={() => setSelectedService(null)} />
          ) : (
            <div>
              {ideasForModel.length > 0 ? (
                <ul className="space-y-2">
                  {ideasForModel.map(service => (
                    <li key={service.id}>
                      <button 
                        onClick={() => setSelectedService(service)}
                        className="w-full text-left p-3 bg-gray-50 dark:bg-brand-dark-bg hover:bg-gray-100 dark:hover:bg-brand-dark-border/50 rounded-lg border border-gray-200 dark:border-brand-dark-border hover:border-brand-light dark:hover:border-brand-accent transition-all focus:outline-none focus:ring-2 focus:ring-brand-mid"
                      >
                        <h4 className="font-semibold text-brand-dark dark:text-gray-200">{service.service}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">{service.need}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma ideia foi cadastrada para este modelo de negócio ainda.</p>
              )}
            </div>
          )}
        </Modal>
      )}
    </Section>
  );
});

export default BusinessModelAnalysisSection;