import React from 'react';
import Modal from './Modal';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Guia Rápido do Bolsão de Ideias">
      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <div>
          <h3 className="text-xl font-semibold text-brand-dark dark:text-white mb-2">Gerador de Ideias</h3>
          <p>
            O ponto de partida para a inovação. Use este formulário para cadastrar novas ideias de serviço de forma estruturada. Preencha o nome, o benefício principal, o público-alvo, o modelo de negócio e associe a ideia a um cluster estratégico. As ideias cadastradas aqui aparecerão instantaneamente nas outras seções.
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-brand-dark-bg border border-gray-200 dark:border-brand-dark-border rounded-lg">
          <h3 className="font-bold text-brand-dark dark:text-white mb-2">Visão Geral do Portfólio</h3>
          <p>
             Esta é a sua central de comando. Aqui você encontra KPIs estratégicos, como o número total de ideias, a pontuação média, o potencial de faturamento e a taxa de aprovação. Os gráficos mostram como as ideias estão distribuídas por clusters e modelos de negócio, ajudando a identificar rapidamente as áreas de maior e menor foco.
          </p>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-brand-dark dark:text-white mb-2">Análise de Clusters</h3>
          <p>
            Cada cluster representa uma categoria estratégica para a inovação. Nesta seção, você pode explorar a proposta de valor e as principais necessidades que cada cluster busca resolver. Clique em um card para ver todas as ideias associadas àquele cluster.
          </p>
        </div>
        
         <div className="p-4 bg-gray-50 dark:bg-brand-dark-bg border border-gray-200 dark:border-brand-dark-border rounded-lg">
          <h3 className="font-bold text-brand-dark dark:text-white mb-2">Modelos de Negócio</h3>
          <p>
            Explore as diferentes formas de gerar valor e receita. Cada card representa um modelo de negócio, como Assinatura, Pacote de Serviço, etc. Clique em um modelo para ver as ideias que se encaixam nessa categoria e entender melhor a estratégia de monetização do portfólio.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-brand-dark dark:text-white mb-2">Priorização de Ideias</h3>
           <p>
            O coração estratégico da ferramenta. Nesta tabela, você pode atribuir notas (de 0 a 5) para cada ideia com base nos critérios definidos (Alinhamento, Valor para o Cliente, etc.). As ideias são automaticamente ranqueadas pela pontuação total. Visualize a matriz de priorização para identificar as apostas mais promissoras.
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-brand-dark-bg border border-gray-200 dark:border-brand-dark-border rounded-lg">
          <h3 className="font-bold text-brand-dark dark:text-white mb-2">Buscador de Ideias</h3>
           <p>
            Sua base de conhecimento completa. Aqui você pode visualizar, filtrar e pesquisar todas as ideias cadastradas no portfólio. Use os filtros para encontrar ideias por cluster, modelo de negócio, classificação ou status. Você também pode editar, excluir ou acionar automações para as ideias diretamente a partir daqui.
          </p>
        </div>

        <div className="text-center pt-4">
            <button
            onClick={onClose}
            className="bg-brand-dark text-white dark:bg-gray-200 dark:text-black px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Entendido
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default HelpModal;
