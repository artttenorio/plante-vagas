const TermosDeUso = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 font-SecondFont">
        <h1 className="text-2xl font-bold text-deepGreen font-PrimaryFont mb-6">Termos de Uso</h1>
        <p className="text-gray-700 mb-4">
          Ao utilizar a plataforma Plante Vagas, você concorda com os termos descritos abaixo.
        </p>
        <h2 className="text-lg font-bold text-deepGreen mt-6 mb-2">1. Cadastro</h2>
        <p className="text-gray-700 mb-4">
          As informações fornecidas no cadastro devem ser verdadeiras e atualizadas. O usuário é
          responsável pela veracidade dos dados informados.
        </p>
        <h2 className="text-lg font-bold text-deepGreen mt-6 mb-2">2. Uso da plataforma</h2>
        <p className="text-gray-700 mb-4">
          A plataforma conecta candidatos e empresas do agronegócio. É proibido o uso para fins
          ilícitos ou que violem direitos de terceiros.
        </p>
        <h2 className="text-lg font-bold text-deepGreen mt-6 mb-2">3. Alterações</h2>
        <p className="text-gray-700 mb-4">
          Estes termos podem ser atualizados periodicamente, sendo responsabilidade do usuário
          consultá-los.
        </p>
      </div>
    </div>
  );
};

export default TermosDeUso;
