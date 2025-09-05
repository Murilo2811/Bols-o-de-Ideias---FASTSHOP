import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-dark/80 dark:bg-brand-dark-bg/80 backdrop-blur-lg text-white p-6 text-center mt-12">
      <p>&copy; {new Date().getFullYear()} Análise de Portfólio de Serviços. Todos os direitos reservados.</p>
    </footer>
  );
};

export default Footer;
