
export interface BusinessModel {
  id: string;
  shortTitle: string;
  title: string;
  valor: string;
  caracteristicas: string[];
}

export const businessModelData: BusinessModel[] = [
  {
    id: "assinatura-recorrencia",
    shortTitle: "Assinatura/Recorrência",
    title: "1. Assinatura & Recorrência",
    valor: "Criar um fluxo de receita previsível e fortalecer o relacionamento com o cliente, oferecendo conveniência, acesso contínuo a serviços e benefícios exclusivos através de pagamentos periódicos.",
    caracteristicas: [
        "Fidelização de longo prazo do cliente.",
        "Geração de receita mensal/anual previsível (MRR/ARR).",
        "Entrega contínua de valor para justificar o pagamento.",
        "Ideal para serviços de suporte, monitoramento e acesso a conteúdo."
    ]
  },
  {
    id: "pacote-de-servico",
    shortTitle: "Pacote de Serviço",
    title: "2. Pacote de Serviço (One-Time)",
    valor: "Oferecer uma solução completa e pontual para uma necessidade específica do cliente, com um preço fixo e escopo bem definido. O valor é percebido na resolução imediata de um problema.",
    caracteristicas: [
        "Transação única com preço definido.",
        "Escopo de trabalho claro e objetivo.",
        "Foco na resolução de uma dor específica (instalação, reparo, configuração).",
        "Gera confiança e abre portas para vendas futuras."
    ]
  },
  {
    id: "locacao",
    shortTitle: "Locação",
    title: "3. Locação & Acesso (Leasing)",
    valor: "Democratizar o acesso a produtos de alto valor, permitindo que os clientes os utilizem por um período determinado sem o custo e o compromisso da compra. Foco na experiência e flexibilidade.",
    caracteristicas: [
        "Reduz a barreira de entrada para produtos caros.",
        "Permite experimentação (try-before-you-buy).",
        "Atende a necessidades temporárias ou pontuais.",
        "Modelo 'Product-as-a-Service' (PaaS)."
    ]
  },
  {
    id: "consultoria",
    shortTitle: "Consultoria",
    title: "4. Consultoria & Serviço Especializado",
    valor: "Vender o conhecimento e a expertise da marca para orientar o cliente na tomada de decisões complexas, oferecendo soluções personalizadas, curadoria e acompanhamento de projetos.",
    caracteristicas: [
        "Monetização do capital intelectual da empresa.",
        "Alta margem de lucro e personalização.",
        "Posiciona a marca como uma autoridade no assunto.",
        "Ideal para projetos de casa inteligente, otimização de setup, etc."
    ]
  },
  {
    id: "solucoes-b2b",
    shortTitle: "Soluções B2B",
    title: "5. Soluções B2B (Business-to-Business)",
    valor: "Atender às necessidades específicas de outras empresas, oferecendo pacotes de produtos e serviços em maior escala, com gestão de contas e suporte dedicado.",
    caracteristicas: [
        "Contratos de maior valor e duração.",
        "Relacionamento focado em parceria de negócios.",
        "Soluções para escritórios, condomínios, construtoras.",
        "Pode incluir modelos B2B2C (venda para empresa que revende ao consumidor)."
    ]
  },
  {
    id: "financeiro-beneficio",
    shortTitle: "Financeiro/Benefício",
    title: "6. Serviços Financeiros & Benefícios",
    valor: "Integrar soluções financeiras à jornada de compra para viabilizar aquisições e aumentar a conveniência, além de oferecer programas que agregam valor e segurança ao produto.",
    caracteristicas: [
        "Facilita a aquisição de produtos de alto valor (crédito, consórcio).",
        "Aumenta a proteção do cliente (seguros, garantia estendida).",
        "Gera receita através de parcerias com instituições financeiras.",
        "Pode incluir programas de fidelidade e cash-back."
    ]
  }
];
