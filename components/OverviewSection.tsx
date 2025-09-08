import React, { useMemo, forwardRef } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
    PieChart, Pie
} from 'recharts';
import Section from './Section';
import { useServices } from '../contexts/ServicesContext';
import { clusterData } from '../data/clusterData';
import { mapBusinessModel } from '../utils/businessModelMapper';
import { useTheme } from '../contexts/ThemeContext';

interface OverviewSectionProps {
  onClusterClick: (clusterId: string, event: React.MouseEvent) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; description: string; className?: string }> = ({ title, value, description, className = '' }) => (
  <div className={`bg-white dark:bg-brand-dark-card p-6 rounded-xl shadow-lg text-center ${className}`}>
    <p className="text-4xl font-bold text-brand-dark dark:text-white">{value}</p>
    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-2">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white dark:bg-brand-dark-card border border-gray-200 dark:border-brand-dark-border rounded-md shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-gray-100">{`${label}`}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{`Ideias: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
};

const RadarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white dark:bg-brand-dark-card border border-gray-200 dark:border-brand-dark-border rounded-md shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-gray-100">{`${label}`}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{`Pontuação Média: ${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
};

const getClassification = (score: number) => {
  if (score >= 21) return 'Altíssima';
  if (score >= 16) return 'Alta';
  if (score >= 11) return 'Média';
  return 'Baixa';
};


const CHART_COLORS = ['#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6'];

const OverviewSection = forwardRef<HTMLElement, OverviewSectionProps>(({ onClusterClick }, ref) => {
  const { services } = useServices();
  const { theme } = useTheme();
  
  const tickColor = theme === 'dark' ? '#A0AEC0' : '#4A5568';
  const gridColor = theme === 'dark' ? '#4A5568' : '#E2E8F0';

  const overviewData = useMemo(() => {
    const totalIdeas = services.length;
    
    // KPI: Potencial de Faturamento (Ideias Aprovadas)
    const potentialRevenue = services
      .filter(s => s.status === 'aprovada')
      .reduce((sum, s) => sum + (s.revenueEstimate || 0), 0);
      
    // KPI: Taxa de Novas Ideias (Últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newIdeasRate = services.filter(s => s.creationDate && new Date(s.creationDate) > thirtyDaysAgo).length;

    // KPI: Taxa de Aprovação
    const terminalServices = services.filter(s => s.status === 'aprovada' || s.status === 'cancelada' || s.status === 'finalizada');
    const approvedServices = terminalServices.filter(s => s.status === 'aprovada');
    const approvalRate = terminalServices.length > 0 ? (approvedServices.length / terminalServices.length) * 100 : 0;
    
    // KPI: Ideias Estagnadas em Avaliação (há mais de 60 dias)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const stagnantIdeasCount = services.filter(s => 
        s.status === 'avaliação' && 
        s.creationDate && 
        new Date(s.creationDate) < sixtyDaysAgo
    ).length;

    // KPI: Distribuição de Ideias por Classificação de Prioridade
    const priorityCounts = { 'Altíssima': 0, 'Alta': 0, 'Média': 0, 'Baixa': 0 };
    services.forEach(s => {
        const totalScore = s.scores.reduce((acc, score) => acc + (score || 0), 0);
        const classification = getClassification(totalScore);
        priorityCounts[classification]++;
    });
    const priorityDistributionData = Object.entries(priorityCounts).map(([name, value]) => ({ name, value }));

    // KPI: Pontuação Média do Portfólio
    const totalScoresSum = services.reduce((sum, s) => {
        const serviceTotal = s.scores.reduce((acc, score) => acc + (score || 0), 0);
        return sum + serviceTotal;
    }, 0);
    const averageScore = totalIdeas > 0 ? (totalScoresSum / totalIdeas) : 0;


    // Dados para gráficos existentes
    const clusterCounts = services.reduce((acc, service) => {
      acc[service.cluster] = (acc[service.cluster] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const businessModelCounts = services.reduce((acc, service) => {
      const mappedModel = mapBusinessModel(service.businessModel);
      acc[mappedModel] = (acc[mappedModel] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    const clusterChartData = Object.entries(clusterCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const businessModelChartData = Object.entries(businessModelCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // KPI: Balanço do Portfólio (Gráfico Radar)
    const portfolioBalanceData = clusterData.map(cluster => {
        const ideasInCluster = services.filter(s => s.cluster === cluster.shortTitle);
        const totalScore = ideasInCluster.reduce((sum, s) => sum + s.scores.reduce((a, b) => a + (b || 0), 0), 0);
        const averageScore = ideasInCluster.length > 0 ? totalScore / ideasInCluster.length : 0;
        return {
            subject: cluster.shortTitle,
            score: averageScore,
            fullMark: 25, // 5 critérios * 5 pontos
        };
    });

    return {
      totalIdeas,
      potentialRevenue,
      newIdeasRate,
      approvalRate,
      stagnantIdeasCount,
      priorityDistributionData,
      averageScore,
      clusterChartData,
      businessModelChartData,
      portfolioBalanceData,
    };
  }, [services]);

  const handleBarClick = (data: any, index: number, event: React.MouseEvent) => {
    const clusterName = data.name;
    const cluster = clusterData.find(c => c.shortTitle === clusterName);
    if (cluster) {
      onClusterClick(cluster.id, event);
    }
  };
  
  const formatCurrency = (value: number) => {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  };

  return (
    <Section ref={ref} id="overview" title="Visão Geral do Portfólio" subtitle="KPIs estratégicos e análise quantitativa das ideias de serviço, distribuídas por clusters e modelos de negócio.">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        <StatCard title="Total de Ideias" value={overviewData.totalIdeas} description="Ideias de serviços cadastradas na base." />
        <StatCard title="Pontuação Média" value={overviewData.averageScore.toFixed(1)} description="Média da pontuação total de todas as ideias." />
        <StatCard title="Potencial de Faturamento" value={formatCurrency(overviewData.potentialRevenue)} description="Soma do faturamento estimado das ideias APROVADAS." />
        <StatCard title="Novas Ideias (30d)" value={overviewData.newIdeasRate} description="Ideias criadas nos últimos 30 dias." />
        <StatCard title="Taxa de Aprovação" value={`${overviewData.approvalRate.toFixed(0)}%`} description="Percentual de ideias aprovadas do total avaliado." />
        <StatCard title="Ideias Estagnadas" value={overviewData.stagnantIdeasCount} description="Ideias em avaliação há mais de 60 dias." className="bg-gray-200 dark:bg-brand-dark" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="bg-white dark:bg-brand-dark-card p-6 rounded-xl shadow-lg lg:col-span-3">
            <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Balanço do Portfólio (Qualidade por Cluster)</h3>
            <ResponsiveContainer width="100%" height={400}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={overviewData.portfolioBalanceData}>
                    <PolarGrid stroke={gridColor} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 25]} tick={{ fill: 'transparent' }} />
                    <Radar name="Pontuação Média" dataKey="score" stroke="#6B7280" fill="#6B7280" fillOpacity={0.6} />
                    <Tooltip content={<RadarTooltip />} />
                </RadarChart>
            </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-brand-dark-card p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Distribuição de Ideias por Cluster</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overviewData.clusterChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: tickColor }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fill: tickColor, fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: theme === 'dark' ? 'rgba(113, 128, 150, 0.2)' : 'rgba(160, 174, 192, 0.2)' }} />
              <Bar dataKey="value" name="Ideias" onClick={handleBarClick} className="cursor-pointer">
                {overviewData.clusterChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white dark:bg-brand-dark-card p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Distribuição por Modelo de Negócio</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overviewData.businessModelChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: tickColor }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fill: tickColor, fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: theme === 'dark' ? 'rgba(113, 128, 150, 0.2)' : 'rgba(160, 174, 192, 0.2)' }} />
              <Bar dataKey="value" name="Ideias">
                {overviewData.businessModelChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white dark:bg-brand-dark-card p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Distribuição por Classificação</h3>
           <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={overviewData.priorityDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                    {overviewData.priorityDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Section>
  );
});

export default OverviewSection;