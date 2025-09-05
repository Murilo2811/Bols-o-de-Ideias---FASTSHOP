import React, { useState, forwardRef, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  CartesianGrid, Tooltip, ReferenceLine, Label
} from 'recharts';
import type { Service, ServiceStatus } from '../types';
import Section from './Section';
import Loader from './Loader';
import { useServices } from '../contexts/ServicesContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { criteriaData } from '../data/criteriaData';
import Pagination from './Pagination';

interface PrioritizationSectionProps {}

type SortDirection = 'ascending' | 'descending';
interface SortConfig {
  key: string;
  direction: SortDirection;
}

// Custom Tooltip for the chart
const CustomTooltip = ({ active, payload, theme }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={`p-3 border rounded-lg shadow-lg max-w-xs animate-fade-in ${theme === 'dark' ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white'}`}>
        <p className="font-bold text-brand-dark dark:text-white truncate">{data.service}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          <strong>{criteriaData[1].shortTitle}:</strong> {data.valorCliente}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>{criteriaData[3].shortTitle}:</strong> {data.viabilidade}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>Pontuação Total:</strong> {data.total}
        </p>
      </div>
    );
  }
  return null;
};

// Prioritization Matrix component (Scatter Plot)
const PrioritizationMatrix: React.FC<{ data: (Service & { total: number })[] }> = ({ data }) => {
  const { theme } = useTheme();
  const chartData = useMemo(() => data.map(service => ({
    ...service,
    viabilidade: service.scores[3] || 0, // Index 3 is Viability
    valorCliente: service.scores[1] || 0, // Index 1 is Customer Value
  })), [data]);
  
  const tickColor = theme === 'dark' ? '#A0AEC0' : '#4A5568';
  const gridColor = theme === 'dark' ? '#4A5568' : '#E2E8F0';
  const refLineColor = theme === 'dark' ? '#718096' : '#A0AEC0';
  const scatterFill = theme === 'dark' ? '#A0AEC0' : '#4A5568';

  return (
    <div className="w-full h-[500px] bg-gray-50/50 dark:bg-brand-dark-bg/50 p-4 rounded-lg border dark:border-brand-dark-border my-6 relative">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-80px)] h-[calc(100%-80px)] grid grid-cols-2 grid-rows-2 gap-0 pointer-events-none z-0">
        <div className="flex items-end justify-start p-2"><span className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-white/70 dark:bg-brand-dark-card/70 px-2 py-1 rounded">A Questionar</span></div>
        <div className="flex items-end justify-end p-2 text-right"><span className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-white/70 dark:bg-brand-dark-card/70 px-2 py-1 rounded">Apostar</span></div>
        <div className="flex items-start justify-start p-2"><span className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-white/70 dark:bg-brand-dark-card/70 px-2 py-1 rounded">Possível</span></div>
        <div className="flex items-start justify-end p-2 text-right"><span className="text-xs font-bold text-gray-800 dark:text-gray-200 bg-gray-200/80 dark:bg-gray-600/80 px-2 py-1 rounded">Executar</span></div>
      </div>
       <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20, right: 20, bottom: 20, left: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            type="number" 
            dataKey="viabilidade" 
            name={criteriaData[3].shortTitle} 
            domain={[0, 5.2]} 
            ticks={[0, 1, 2, 3, 4, 5]}
            tick={{ fill: tickColor }}
          >
             <Label value="Viabilidade" offset={-15} position="insideBottom" fill={tickColor} />
          </XAxis>
          <YAxis 
            type="number" 
            dataKey="valorCliente" 
            name={criteriaData[1].shortTitle} 
            domain={[0, 5.2]} 
            ticks={[0, 1, 2, 3, 4, 5]}
            tick={{ fill: tickColor }}
          >
            <Label value="Valor para o Cliente" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} offset={-5} fill={tickColor} />
          </YAxis>
          <ZAxis type="number" dataKey="total" range={[40, 300]} name="Pontuação Total" />
          
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip theme={theme} />} />
          
          <ReferenceLine y={2.5} stroke={refLineColor} strokeDasharray="4 4" />
          <ReferenceLine x={2.5} stroke={refLineColor} strokeDasharray="4 4" />
          
           <Scatter data={chartData} fill={scatterFill} className="transition-opacity hover:opacity-100 opacity-70" shape="circle" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

const getClassification = (score: number) => {
  if (score >= 21) return { text: 'Altíssima', color: 'bg-black text-white dark:bg-white dark:text-black' };
  if (score >= 16) return { text: 'Alta', color: 'bg-gray-700 text-white dark:bg-gray-300 dark:text-black' };
  if (score >= 11) return { text: 'Média', color: 'bg-gray-500 text-white dark:bg-gray-500 dark:text-white' };
  return { text: 'Baixa', color: 'bg-gray-300 text-black dark:bg-gray-700 dark:text-gray-200' };
};

const statusDisplayMap: Record<ServiceStatus, string> = {
    'avaliação': 'Avaliação',
    'aprovada': 'Aprovada',
    'cancelada': 'Cancelada',
    'finalizada': 'Finalizada',
};
const statusOptions: ServiceStatus[] = ['avaliação', 'aprovada', 'cancelada', 'finalizada'];


const SortableHeader: React.FC<{
    title: string;
    sortKey: string;
    onSort: (key: string) => void;
    sortConfig: SortConfig | null;
    className?: string;
    isText?: boolean;
    criterionInfo?: import('../data/criteriaData').Criterion;
}> = ({ title, sortKey, onSort, sortConfig, className = '', isText = false, criterionInfo }) => {
    const isSorted = sortConfig?.key === sortKey;
    const directionIcon = isSorted ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '';

    return (
        <th className={`px-2 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider group relative ${isText ? 'text-left' : 'text-center'}`}>
            <div className={`flex items-center gap-1 w-full ${isText ? 'justify-start' : 'justify-center'}`}>
                <button
                    onClick={() => onSort(sortKey)}
                    className="font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider hover:text-brand-dark dark:hover:text-white focus:outline-none flex items-center gap-1"
                    title={`Ordenar por ${title}`}
                >
                    <span>{title}</span>
                    {isSorted && <span className="text-xs text-brand-mid dark:text-brand-light">{directionIcon}</span>}
                </button>
                {criterionInfo && (
                    <div className="relative flex items-center cursor-help">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {/* Tooltip */}
                        <div
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-4 bg-brand-dark text-white text-sm rounded-lg shadow-lg 
                                       opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20
                                       text-left font-normal normal-case tracking-normal"
                        >
                            <h4 className="font-bold mb-2 text-base">{criterionInfo.title}</h4>
                            <p className="mb-3 text-xs">{criterionInfo.description}</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                {criterionInfo.subCriteria.map((sc, i) => <li key={i}>{sc}</li>)}
                            </ul>
                            <svg className="absolute text-brand-dark h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve">
                                <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </th>
    );
};

interface RankingTableProps {
  data: (Service & { total: number })[];
  originalData: Service[];
  onServiceChange: (service: Service) => void;
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
  pageStartIndex: number;
  modifiedServiceIds: number[];
  onSaveChanges: () => void;
  onDiscardChanges: () => void;
  isSaving: boolean;
}

const RankingTable: React.FC<RankingTableProps> = ({ data, originalData, onServiceChange, sortConfig, onSort, pageStartIndex, modifiedServiceIds, onSaveChanges, onDiscardChanges, isSaving }) => {
  const { user } = useAuth();
  const isViewer = user?.role === 'Leitor';
  const [localServices, setLocalServices] = useState(data);

  React.useEffect(() => {
    setLocalServices(data);
  }, [data]);

  const handleLocalChange = (id: number, field: keyof Service | `score_${number}`, value: any) => {
    let changedService: Service | undefined;
    
    const newLocalServices = localServices.map(s => {
      if (s.id === id) {
        const updatedService = { ...s };
        if (typeof field === 'string' && field.startsWith('score_')) {
          const index = parseInt(field.split('_')[1], 10);
          const newScores = [...updatedService.scores];
          newScores[index] = Math.max(0, Math.min(5, Number(value)));
          updatedService.scores = newScores;
        } else if (field === 'revenueEstimate') {
            updatedService.revenueEstimate = Number(value) >= 0 ? Number(value) : 0;
        }
        else {
          (updatedService as any)[field] = value;
        }
        changedService = updatedService;
        return updatedService;
      }
      return s;
    });

    setLocalServices(newLocalServices);
    
    if (changedService) {
      onServiceChange(changedService);
    }
  };

  const totalColumns = 6 + criteriaData.length;
  const inputClasses = `w-14 text-center rounded-md p-1 transition-all
                        border-gray-300 dark:border-brand-dark-border
                        bg-white dark:bg-brand-dark-card text-gray-800 dark:text-gray-200
                        focus:border-brand-mid focus:ring-brand-mid
                        disabled:bg-gray-100 dark:disabled:bg-brand-dark-bg disabled:cursor-not-allowed`;
  const selectClasses = `w-full rounded-md shadow-sm sm:text-sm p-1 transition-all
                        border-gray-300 dark:border-brand-dark-border
                        bg-white dark:bg-brand-dark-card text-gray-800 dark:text-gray-200
                        focus:border-brand-mid focus:ring-brand-mid
                        disabled:bg-gray-100 dark:disabled:bg-brand-dark-bg disabled:cursor-not-allowed`;


  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-brand-dark-border">
        <thead className="bg-gray-100 dark:bg-brand-dark-card/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Rank</th>
            <SortableHeader title="Ideia de Serviço" sortKey="service" onSort={onSort} sortConfig={sortConfig} isText />
            {criteriaData.map((criterion, i) => (
              <SortableHeader
                key={criterion.id}
                title={criterion.shortTitle}
                sortKey={`score_${i}`}
                onSort={onSort}
                sortConfig={sortConfig}
                criterionInfo={criterion}
              />
            ))}
            <SortableHeader title="Est. Faturamento" sortKey="revenueEstimate" onSort={onSort} sortConfig={sortConfig} />
            <SortableHeader title="Total" sortKey="total" onSort={onSort} sortConfig={sortConfig} />
            <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Classificação</th>
            <SortableHeader title="Status" sortKey="status" onSort={onSort} sortConfig={sortConfig} />
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-brand-dark-card divide-y divide-gray-200 dark:divide-brand-dark-border">
          {localServices.map((item, index) => {
            const total = item.scores.reduce((acc, val) => acc + (val || 0), 0);
            const classification = getClassification(total);
            const isModified = modifiedServiceIds.includes(item.id);
            const originalService = originalData.find(s => s.id === item.id);

            return (
              <tr key={item.id} className={`${isModified ? 'bg-gray-500/10' : ''} transition-colors`}>
                <td className="px-4 py-3 whitespace-nowrap text-center font-bold text-lg text-gray-700 dark:text-gray-300">{pageStartIndex + index + 1}</td>
                <td className="px-4 py-3 whitespace-nowrap"><div className="font-semibold text-gray-900 dark:text-gray-100">{item.service}</div><div className="text-xs text-gray-500 dark:text-gray-400">ID: {item.id}</div></td>
                {item.scores.map((score, i) => {
                    const isCellModified = originalService ? (originalService.scores[i] ?? 0) !== (score ?? 0) : false;
                    return (
                        <td key={i} className="px-2 py-3 whitespace-nowrap text-center">
                            <input
                                type="number"
                                min="0"
                                max="5"
                                value={score}
                                onChange={(e) => handleLocalChange(item.id, `score_${i}`, e.target.value)}
                                className={`${inputClasses} ${isCellModified ? 'border-l-4 border-gray-400 dark:border-gray-500' : ''}`}
                                disabled={isViewer}
                            />
                        </td>
                    );
                })}
                <td className="px-2 py-3 whitespace-nowrap text-center">
                    {(() => {
                        const isCellModified = originalService ? (originalService.revenueEstimate ?? 0) !== (item.revenueEstimate ?? 0) : false;
                        return (
                            <input
                                type="number"
                                min="0"
                                value={item.revenueEstimate || ''}
                                onChange={(e) => handleLocalChange(item.id, 'revenueEstimate', e.target.value)}
                                className={`${inputClasses} w-28 ${isCellModified ? 'border-l-4 border-gray-400 dark:border-gray-500' : ''}`}
                                placeholder="R$"
                                disabled={isViewer}
                            />
                        );
                    })()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center font-bold text-lg text-gray-800 dark:text-gray-100">{total}</td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span className={`py-1 px-3 rounded-full font-semibold text-xs uppercase ${classification.color}`}>{classification.text}</span>
                </td>
                <td className="px-2 py-3 whitespace-nowrap">
                  {(() => {
                      const originalStatus = originalService?.status || 'avaliação';
                      const currentStatus = item.status || 'avaliação';
                      const isCellModified = originalService ? originalStatus !== currentStatus : false;
                      return (
                          <select
                            value={item.status || 'avaliação'}
                            onChange={(e) => handleLocalChange(item.id, 'status', e.target.value as ServiceStatus)}
                            className={`${selectClasses} ${isCellModified ? 'border-l-4 border-gray-400 dark:border-gray-500' : ''}`}
                            style={{ minWidth: '120px' }}
                            disabled={isViewer}
                          >
                            {statusOptions.map(status => <option key={status} value={status}>{statusDisplayMap[status]}</option>)}
                          </select>
                      );
                  })()}
                </td>
              </tr>
            );
          })}
        </tbody>
        {modifiedServiceIds.length > 0 && !isViewer && (
          <tfoot className="bg-gray-100 dark:bg-brand-dark-bg border-t-2 border-brand-light dark:border-brand-dark-border">
            <tr>
              <td colSpan={totalColumns} className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-4 animate-fade-in">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {modifiedServiceIds.length} {modifiedServiceIds.length === 1 ? 'alteração não salva' : 'alterações não salvas'}
                  </span>
                  <button
                    onClick={onDiscardChanges}
                    disabled={isSaving}
                    className="bg-brand-mid hover:bg-brand-dark text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={onSaveChanges}
                    disabled={isSaving}
                    className="bg-brand-dark hover:bg-black text-white dark:bg-gray-200 dark:text-black dark:hover:bg-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};


const PrioritizationSection = forwardRef<HTMLElement, PrioritizationSectionProps>((props, ref) => {
  const { services, updateService, downloadCSV, refreshData, isRefreshing } = useServices();
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'total', direction: 'descending' });
  const [filters, setFilters] = useState({ cluster: 'all', classification: 'all', status: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showChart, setShowChart] = useState(false);
  const [modifiedServices, setModifiedServices] = useState<{ [id: number]: Service }>({});
  const [isSaving, setIsSaving] = useState(false);

  const uniqueClusters = useMemo(() => [...new Set(services.map(s => s.cluster).filter(Boolean))].sort(), [services]);
  const classificationOptions = ['Altíssima', 'Alta', 'Média', 'Baixa'];
  const filterSelectClasses = "mt-1 block w-full rounded-md border-gray-300 dark:border-brand-dark-border shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm bg-white dark:bg-brand-dark-card dark:text-gray-200 disabled:opacity-50";

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (Object.keys(modifiedServices).length > 0) {
      if (!window.confirm('Você possui alterações não salvas. Mudar os filtros irá descartá-las. Deseja continuar?')) {
        return;
      }
      setModifiedServices({});
    }
    const { name, value } = e.target;
    setFilters(prev => ({...prev, [name]: value}));
    setCurrentPage(1); // Reset page on filter change
  };

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      const isSameKey = prevConfig?.key === key;
      const newDirection = isSameKey && prevConfig.direction === 'descending' ? 'ascending' : 'descending';
      return { key, direction: newDirection };
    });
  };

  const handleServiceChange = (service: Service) => {
    setModifiedServices(prev => ({
      ...prev,
      [service.id]: service,
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const updates = Object.values(modifiedServices);
    try {
      await Promise.all(updates.map(service => updateService(service)));
      setModifiedServices({});
    } catch (error) {
      console.error("Falha ao salvar alterações em massa", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    if (window.confirm('Tem certeza que deseja descartar todas as alterações não salvas? Esta ação não pode ser desfeita.')) {
        setModifiedServices({});
    }
  };

  const processedData = useMemo(() => {
    let filteredServices = services
      .map(service => ({
        ...service,
        total: service.scores.reduce((acc, val) => acc + (val || 0), 0),
      }));
      
    if (filters.cluster !== 'all') {
      filteredServices = filteredServices.filter(s => s.cluster === filters.cluster);
    }
    if (filters.status !== 'all') {
      filteredServices = filteredServices.filter(s => (s.status || 'avaliação') === filters.status);
    }
    if (filters.classification !== 'all') {
      filteredServices = filteredServices.filter(s => getClassification(s.total).text === filters.classification);
    }
      
    if (sortConfig) {
      filteredServices.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key.startsWith('score_')) {
          const index = parseInt(sortConfig.key.split('_')[1], 10);
          aValue = a.scores[index] ?? 0;
          bValue = b.scores[index] ?? 0;
        } else {
          aValue = a[sortConfig.key as keyof typeof a];
          bValue = b[sortConfig.key as keyof typeof b];
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else {
           if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
           if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredServices;
  }, [services, filters, sortConfig]);
  
  const totalPages = useMemo(() => Math.ceil(processedData.length / itemsPerPage), [processedData, itemsPerPage]);

  const paginatedData = useMemo(() => {
    return processedData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [processedData, currentPage, itemsPerPage]);

  const paginatedDataWithModifications = useMemo(() => {
    // FIX: When retrieving a modified service, it was missing the calculated 'total' property, causing type errors.
    // This fix recalculates the 'total' for any modified service, ensuring data consistency.
    return paginatedData.map(service => {
      const modifiedService = modifiedServices[service.id];
      if (modifiedService) {
        return {
          ...modifiedService,
          total: modifiedService.scores.reduce((acc, val) => acc + (val || 0), 0),
        };
      }
      return service;
    });
  }, [paginatedData, modifiedServices]);

  const modifiedServiceIds = useMemo(() => Object.keys(modifiedServices).map(Number), [modifiedServices]);
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <Section
      ref={ref}
      id="prioritization"
      title="Priorização de Ideias"
      subtitle="Atribua notas para cada ideia com base nos critérios estratégicos. Use os filtros e a visualização gráfica para análise."
    >
      <div className="bg-white dark:bg-brand-dark-card p-6 rounded-xl shadow-lg">
        <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
          <button onClick={refreshData} disabled={isRefreshing || isSaving} className="bg-gray-200 dark:bg-brand-dark-border text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-brand-accent transition-colors flex items-center gap-2 disabled:opacity-50">
            Sincronizar Dados
          </button>
           <button 
            onClick={() => setShowChart(!showChart)} 
            disabled={isSaving}
            className="bg-brand-mid text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            {showChart ? 'Ocultar Gráfico' : 'Visualizar Gráfico'}
          </button>
          <button onClick={downloadCSV} disabled={services.length === 0 || isSaving} className="bg-brand-dark hover:bg-black text-white dark:bg-gray-200 dark:text-black dark:hover:bg-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Baixar Planilha Completa
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 mb-6 border-y bg-gray-50/50 dark:bg-brand-dark-bg/50 dark:border-brand-dark-border rounded-lg">
            <div>
                <label htmlFor="cluster-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filtrar por Cluster</label>
                <select id="cluster-filter" name="cluster" value={filters.cluster} onChange={handleFilterChange} disabled={isSaving} className={filterSelectClasses}>
                    <option value="all">Todos os Clusters</option>
                    {uniqueClusters.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="classification-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filtrar por Classificação</label>
                <select id="classification-filter" name="classification" value={filters.classification} onChange={handleFilterChange} disabled={isSaving} className={filterSelectClasses}>
                    <option value="all">Todas as Classificações</option>
                    {classificationOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filtrar por Status</label>
                <select id="status-filter" name="status" value={filters.status} onChange={handleFilterChange} disabled={isSaving} className={filterSelectClasses}>
                    <option value="all">Todos os Status</option>
                    {statusOptions.map(s => <option key={s} value={s}>{statusDisplayMap[s]}</option>)}
                </select>
            </div>
        </div>

        {isRefreshing && <Loader text="Sincronizando com a base de dados..." />}
        
        {showChart && !isRefreshing && processedData.length > 0 && (
          <PrioritizationMatrix data={processedData} />
        )}

        {!isRefreshing && processedData.length > 0 && (
          <>
            <RankingTable 
              data={paginatedDataWithModifications} 
              originalData={services}
              onServiceChange={handleServiceChange}
              sortConfig={sortConfig}
              onSort={handleSort}
              pageStartIndex={(currentPage - 1) * itemsPerPage}
              modifiedServiceIds={modifiedServiceIds}
              onSaveChanges={handleSaveChanges}
              onDiscardChanges={handleDiscardChanges}
              isSaving={isSaving}
            />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}

        {!isRefreshing && processedData.length === 0 && (
             <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma ideia encontrada para os filtros selecionados.</p>
        )}
        
      </div>
    </Section>
  );
});

export default PrioritizationSection;