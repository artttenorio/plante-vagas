const Privacidade = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 font-SecondFont">
        <h1 className="text-2xl font-bold text-deepGreen font-PrimaryFont mb-6">Política de Privacidade</h1>
        <p className="text-gray-700 mb-4">
          Esta política explica como o Plante Vagas coleta, usa e protege os dados pessoais dos
          usuários, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
        </p>
        <h2 className="text-lg font-bold text-deepGreen mt-6 mb-2">1. Dados coletados</h2>
        <p className="text-gray-700 mb-4">
          Coletamos dados de identificação (nome, CPF/CNPJ, e-mail, telefone, endereço) e dados de
          currículo fornecidos voluntariamente pelo usuário para viabilizar o uso da plataforma.
        </p>
        <h2 className="text-lg font-bold text-deepGreen mt-6 mb-2">2. Uso dos dados</h2>
        <p className="text-gray-700 mb-4">
          Os dados são utilizados exclusivamente para conectar candidatos e empresas, exibir perfis
          e processos seletivos, e não são vendidos a terceiros.
        </p>
        <h2 className="text-lg font-bold text-deepGreen mt-6 mb-2">3. Direitos do titular</h2>
        <p className="text-gray-700 mb-4">
          O usuário pode solicitar a correção ou exclusão de seus dados a qualquer momento através
          da própria plataforma, na seção "Meus dados".
        </p>
      </div>
    </div>
  );
};

export default Privacidade;
