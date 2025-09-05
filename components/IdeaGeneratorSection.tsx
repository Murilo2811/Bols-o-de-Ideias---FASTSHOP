import React, { useState, useMemo, forwardRef } from 'react';
import type { Service } from '../types';
import { businessModelCategories } from '../utils/businessModelMapper';
import { useServices } from '../contexts/ServicesContext';
import { useAuth } from '../contexts/AuthContext';
import Section from './Section';

interface IdeaGeneratorSectionProps {}

const inputClasses = "mt-1 block w-full rounded-md border-gray-300 dark:border-brand-dark-border shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm bg-white dark:bg-brand-dark-card dark:text-gray-200";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const IdeaGeneratorSection = forwardRef<HTMLElement, IdeaGeneratorSectionProps>((props, ref) => {
  const { services, addService } = useServices();
  const { user } = useAuth();

  const initialFormState = {
      service: '',
      beneficio: '',
      publico: '',
      modelo: businessModelCategories[0],
      cluster: '',
      creatorName: user?.name || '' // Preenche com o nome do usuário logado
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const uniqueClusters = useMemo(() => [...new Set(services.map(s => s.cluster).filter(Boolean))].sort(), [services]);
  
  // Set default cluster when available
  React.useEffect(() => {
    if (!formData.cluster && uniqueClusters.length > 0) {
      setFormData(prev => ({ ...prev, cluster: uniqueClusters[0] }));
    }
  }, [uniqueClusters, formData.cluster]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleAddIdea = async () => {
    if (!formData.service || !formData.beneficio || !formData.publico || !formData.cluster || !formData.modelo) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
        const newService: Omit<Service, 'id' | 'creationDate' | 'scores' | 'revenueEstimate'> = {
          service: formData.service.trim(),
          need: formData.beneficio.trim(),
          targetAudience: formData.publico.trim(),
          businessModel: formData.modelo,
          cluster: formData.cluster,
          status: 'avaliação',
          creatorName: formData.creatorName.trim() || user?.name, // Garante que o nome seja salvo
        };
        await addService(newService);

        // Reset form
        setFormData(initialFormState);
        setError('');
    } catch (err) {
        console.error("Error adding new service:", err);
        setError('Falha ao adicionar a ideia. Verifique a conexão e tente novamente.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Section
      ref={ref}
      id="ideaGenerator"
      title="Gerador de Ideias de Serviço"
      subtitle="Cadastre e organize novas ideias de serviço para expandir o portfólio."
    >
      <div className="bg-white dark:bg-brand-dark-card p-6 md:p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label htmlFor="service-input" className={labelClasses}>1. Nome da Ideia de Serviço:</label>
                <input
                    id="service-input"
                    name="service"
                    type="text"
                    className={inputClasses}
                    placeholder="Ex: Manutenção de drones para agricultura"
                    value={formData.service}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label htmlFor="beneficio-output" className={labelClasses}>2. Benefício Principal:</label>
                <textarea
                    id="beneficio-output"
                    name="beneficio"
                    rows={3}
                    className={inputClasses}
                    placeholder="Qual problema resolve ou que valor gera?"
                    value={formData.beneficio}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label htmlFor="publico-output" className={labelClasses}>3. Público-Alvo:</label>
                <textarea
                    id="publico-output"
                    name="publico"
                    rows={3}
                    className={inputClasses}
                    placeholder="Para quem este serviço se destina?"
                    value={formData.publico}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label htmlFor="modelo-output" className={labelClasses}>4. Modelo de Negócio:</label>
                <select id="modelo-output" name="modelo" value={formData.modelo} onChange={handleChange} className={inputClasses}>
                    {businessModelCategories.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="cluster-select" className={labelClasses}>5. Classifique no Cluster:</label>
                <select id="cluster-select" name="cluster" value={formData.cluster} onChange={handleChange} className={inputClasses} required>
                    <option value="" disabled>Selecione um cluster</option>
                    {uniqueClusters.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="md:col-span-2">
                <label htmlFor="creator-name" className={labelClasses}>6. Nome do Criador:</label>
                <input
                    id="creator-name"
                    name="creatorName"
                    type="text"
                    className={`${inputClasses} disabled:bg-gray-100 dark:disabled:bg-brand-dark-bg`}
                    placeholder="Ex: João Silva"
                    value={formData.creatorName}
                    onChange={handleChange}
                />
            </div>
            <div className="md:col-span-2 text-center">
            <button
                onClick={handleAddIdea}
                disabled={isSubmitting}
                className="bg-brand-dark hover:bg-black text-white dark:bg-gray-200 dark:hover:bg-white dark:text-black px-8 py-3 rounded-lg font-bold text-lg transition-all active:scale-95 flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                {isSubmitting ? 'Adicionando...' : 'Adicionar à Base'}
            </button>
            </div>
           {error && <p className="md:col-span-2 text-center text-brand-mid dark:text-brand-light mt-4 font-semibold">{error}</p>}
        </div>
      </div>
    </Section>
  );
});

export default IdeaGeneratorSection;