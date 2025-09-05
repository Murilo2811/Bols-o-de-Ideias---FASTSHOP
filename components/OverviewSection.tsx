import React, { useMemo, forwardRef, useState } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts';
import type { Service, ServiceStatus } from '../types';
import Section from './Section';
import Modal from './Modal';
import { mapBusinessModel } from '../utils/businessModelMapper';
import { useServices } from '../contexts/ServicesContext';
import { clusterData } from '../data/clusterData';
import { criteriaData } from '../data/criteriaData';
import { useTheme } from '../contexts/ThemeContext';

// New generic card for the dashboard
const DashboardCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
  <div className={`bg-white/70 dark:bg-brand-dark-card/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg flex flex-col border border-white/20 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
    <div className="flex-grow flex items-center justify-center">{children}</div>
  </div>
);


const COLORS = ['#2D3748', '#4A5568', '#718096', '#A0AEC0', '#CBD5E0', '#E2E8F0'];
const DARK_COLORS = ['#E2E8F0', '#CBD5E0', '#A0AEC0', '#718096', '#4A5568', '#2D3748'];

// Custom Legend for Cluster Pie Chart
const CustomLegend = (props: any) => {
  const { payload, onClusterClick } = props;
  return (
    <ul className="flex flex-wrap justify-center list-none p-0 mt-4 text-sm gap-x-4 gap-y-2">
      {payload.map((entry: any, index: number) => {
        const clusterInfo = clusterData.find(c => c.shortTitle === entry.value);
        if (!clusterInfo) return null;
        return (
            <li
            key={`item-${index}`}
            onClick={(e) => onClusterClick(clusterInfo.id, e)}
            className="flex items-center cursor-pointer hover:opacity-75 transition-opacity"
            aria-label={`Ver detalhes do cluster ${entry.value}`}
            >
            <span className="w-3 h-3 block mr-2 rounded-sm" style={{ backgroundColor: entry.color }}></span>
            <span className="text-gray-700 dark:text-gray-300">{entry.value}</span>
            </li>
        )
        })}
    </ul>
  );
};

// --- Modal de Detalhes da Ideia ---
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

const IdeaDetailModal: React.FC<{ service: Service; isOpen: boolean; onClose: () => void; }> = ({ service, isOpen, onClose }) => {
    if (!isOpen) return null;

    const totalScore = service.scores.reduce((acc, score) => acc + (score || 0), 0);
    const revenueFormatted = (service.revenueEstimate || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={service.service}>
            <div className="space-y-5">
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Benefício Principal</h4>
                    <p className="text-gray-800 dark:text-gray-200 mt-1">{service.need}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t dark:border-brand-dark-border">
                    <div><strong className="text-gray-600 dark:text-gray-400 block text-sm">Público-Alvo:</strong> <span className="dark:text-gray-200">{service.targetAudience}</span></div>
                    <div><strong className="text-gray-600 dark:text-gray-400 block text-sm">Modelo de Negócio:</strong> <span className="dark:text-gray-200">{mapBusinessModel(service.businessModel)}</span></div>
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
        </Modal>
    );
};


const OverviewSection = forwardRef<HTMLElement, { onClusterClick: (clusterId: string, event: React.MouseEvent) => void; }>(({ onClusterClick }, ref) => {
  const { services } = useServices();
  const { theme } = useTheme();
  const [viewingService, setViewingService] = useState<Service | null>(null);

  const metrics = useMemo(() => {
    if (services.length === 0) return null;

    const getTotalScore = (s: Service) => s.scores.reduce((acc, score) => acc + (score || 0), 0);

    // Metric 1: Potential Revenue
    const potentialRevenue = services
      .filter(s => s.status === 'aprovada')
      .reduce((sum, s) => sum + (s.revenueEstimate || 0), 0);

    // Metric 2: New ideas in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newIdeasLast30Days = services.filter(s => s.creationDate && new Date(s.creationDate) > thirtyDaysAgo).length;

    // Metric 3: Average portfolio score
    const totalScoresSum = services.reduce((sum, s) => sum + getTotalScore(s), 0);
    const averagePortfolioScore = services.length > 0 ? totalScoresSum / services.length : 0;

    // Metric 4: Status distribution for funnel chart
    const funnelOrder: ServiceStatus[] = ['avaliação', 'aprovada', 'finalizada', 'cancelada'];
    const statusCounts = services.reduce((acc, service) => {
      const status = service.status || 'avaliação';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<ServiceStatus, number>);
    const statusDistribution = funnelOrder
      .map(status => ({ 
        name: statusDisplayMap[status], 
        value: statusCounts[status] || 0,
      }));

    // Metric 5: Top 5 ideas
    const top5Ideas = [...services]
      .sort((a, b) => getTotalScore(b) - getTotalScore(a))
      .slice(0, 5);

    // Metric 6: Business model distribution
    const businessModelCounts = services.reduce((acc, service) => {
        const model = mapBusinessModel(service.businessModel);
        acc[model] = (acc[model] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });
    const businessModelDistribution = Object.entries(businessModelCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => b.value - a.value);

    // Metric 7: Average score by cluster
    const clusterScores: { [key: string]: { totalScore: number; count: number } } = {};
    services.forEach(s => {
        if (!s.cluster) return;
        if (!clusterScores[s.cluster]) {
            clusterScores[s.cluster] = { totalScore: 0, count: 0 };
        }
        clusterScores[s.cluster].totalScore += getTotalScore(s);
        clusterScores[s.cluster].count++;
    });
    const avgScoreByCluster = Object.entries(clusterScores)
        .map(([name, data]) => ({ name, value: data.totalScore / data.count }))
        .sort((a, b) => b.value - a.value);
    
    // Existing: Cluster Distribution
    const clusterCounts = services.reduce((acc, service) => {
      if (!service.cluster) return acc;
      acc[service.cluster] = (acc[service.cluster] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    const clusterDistribution = Object.entries(clusterCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);


    return {
      totalIdeas: services.length,
      potentialRevenue,
      newIdeasLast30Days,
      averagePortfolioScore,
      statusDistribution,
      top5Ideas,
      businessModelDistribution,
      avgScoreByCluster,
      clusterDistribution
    };
  }, [services]);

  const handlePieClick = (data: any, index: number, event: React.MouseEvent) => {
    const clusterInfo = clusterData.find(c => c.shortTitle === data.name);
    if (clusterInfo) {
      onClusterClick(clusterInfo.id, event);
    }
  };

  if (!metrics) {
    return (
      <Section ref={ref} id="overview" title="Visão Geral do Portfólio">
        <p className="text-center text-gray-500 dark:text-gray-400">Ainda não há dados para exibir as métricas. Adicione algumas ideias para começar.</p>
      </Section>
    );
  }

  return (
    <Section ref={ref} id="overview" title="Dashboard Estratégico do Portfólio" subtitle="Métricas chave para entender a saúde, o potencial e o alinhamento das suas ideias.">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <DashboardCard title="Potencial de Faturamento (Aprovadas)" className="lg:col-span-2">
          <div className="text-center">
            <p className="text-5xl font-bold text-brand-dark dark:text-gray-100">
              {metrics.potentialRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
            </p>
          </div>
        </DashboardCard>

        <DashboardCard title="Novas Ideias (30 dias)">
          <p className="text-5xl font-bold text-brand-dark dark:text-gray-100">{metrics.newIdeasLast30Days}</p>
        </DashboardCard>
        
        <DashboardCard title="Total de Ideias">
            <p className="text-5xl font-bold text-brand-mid dark:text-gray-200">{metrics.totalIdeas}</p>
        </DashboardCard>

        <DashboardCard title="Funil de Status das Ideias" className="lg:col-span-2 lg:row-span-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={metrics.statusDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme === 'dark' ? "#4A5568" : "#E2E8F0"} />
              <XAxis type="number" tick={{ fill: theme === 'dark' ? '#A0AEC0' : '#4A5568' }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={80} 
                tick={{ fontSize: 12, fill: theme === 'dark' ? '#A0AEC0' : '#4A5568' }} 
              />
              <Tooltip 
                formatter={(value, name) => [`${value} ideias`, name]} 
                contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF', 
                    borderColor: theme === 'dark' ? '#4A5568' : '#E2E8F0',
                    borderRadius: '0.75rem'
                }}
                cursor={{fill: 'rgba(113, 128, 150, 0.1)'}}
              />
              <Bar dataKey="value" isAnimationActive>
                {metrics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={(theme === 'dark' ? DARK_COLORS : COLORS)[index % COLORS.length]} />
                ))}
                <LabelList dataKey="value" position="right" fill={theme === 'dark' ? '#E2E8F0' : '#2D3748'} className="font-semibold" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>

        <DashboardCard title="Top 5 Ideias por Pontuação" className="lg:col-span-2 lg:row-span-2">
            <div className="w-full self-start">
                <ul className="space-y-4">
                    {metrics.top5Ideas.map((idea, index) => {
                        const totalScore = idea.scores.reduce((a, b) => a + (b || 0), 0);
                        return (
                            <li 
                              key={idea.id}
                              onClick={() => setViewingService(idea)}
                              className="stagger-item flex items-center gap-4 p-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-brand-dark-border/50 cursor-pointer"
                              style={{ animationDelay: `${index * 100}ms`}}
                            >
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-brand-dark-border rounded-full font-bold text-brand-dark dark:text-white">
                                    {index + 1}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold text-brand-dark dark:text-gray-100 truncate">{idea.service}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Cluster: {idea.cluster}</p>
                                </div>
                                <div className="flex-shrink-0 text-lg font-bold text-brand-dark dark:text-white bg-gray-200 dark:bg-brand-dark-border px-3 py-1 rounded-full">
                                    {totalScore}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </DashboardCard>
        
        <DashboardCard title="Pontuação Média">
          <div className="text-center">
            <p className="text-5xl font-bold text-brand-dark dark:text-gray-100">{metrics.averagePortfolioScore.toFixed(1)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">de 25 pontos</p>
          </div>
        </DashboardCard>
        
        <DashboardCard title="Distribuição por Cluster" className="lg:col-span-3">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                <Pie
                    data={metrics.clusterDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    onClick={handlePieClick}
                    className="cursor-pointer"
                >
                    {metrics.clusterDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={(theme === 'dark' ? DARK_COLORS : COLORS)[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip 
                    formatter={(value) => `${value} serviços`}
                    contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF', 
                        borderColor: theme === 'dark' ? '#4A5568' : '#E2E8F0',
                        borderRadius: '0.75rem'
                    }}  
                />
                <Legend content={<CustomLegend onClusterClick={onClusterClick} />} wrapperStyle={{ position: 'relative' }} />
                </PieChart>
            </ResponsiveContainer>
        </DashboardCard>
        
        <DashboardCard title="Pontuação Média por Cluster" className="lg:col-span-4">
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.avgScoreByCluster} margin={{ top: 5, right: 20, left: -10, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "#4A5568" : "#E2E8F0"} />
                    <XAxis dataKey="name" angle={-40} textAnchor="end" interval={0} height={60} tick={{ fontSize: 12, fill: theme === 'dark' ? '#A0AEC0' : '#4A5568' }} />
                    <YAxis domain={[0, 25]} tick={{ fill: theme === 'dark' ? '#A0AEC0' : '#4A5568' }} />
                    <Tooltip 
                        formatter={(value) => `${Number(value).toFixed(1)} pts`} 
                        contentStyle={{ 
                            backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF', 
                            borderColor: theme === 'dark' ? '#4A5568' : '#E2E8F0',
                            borderRadius: '0.75rem'
                        }} 
                        cursor={{fill: 'rgba(113, 128, 150, 0.2)'}}
                    />
                    <Bar dataKey="value" fill={(theme === 'dark' ? DARK_COLORS : COLORS)[1]} />
                </BarChart>
            </ResponsiveContainer>
        </DashboardCard>

      </div>

      {viewingService && (
        <IdeaDetailModal 
          isOpen={!!viewingService}
          onClose={() => setViewingService(null)}
          service={viewingService}
        />
      )}
    </Section>
  );
});

export default OverviewSection;