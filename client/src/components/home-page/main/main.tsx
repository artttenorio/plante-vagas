import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, ArrowRight, ExternalLink, Leaf } from "lucide-react";
import bgImage from "../../../assets/images/bg-teste.jpg";
import bgImage2 from "../../../assets/images/plantacao2.jpeg";
import bgImage3 from "../../../assets/images/teste2.jpg";
import { getUserType } from "@/services/api";

export default function Main() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  // Chamada "Para empresas / CADASTRAR EMPRESA" só faz sentido pra visitante
  // deslogado: o candidato não usa, e a empresa logada já tem conta.
  const mostrarCtaEmpresa = getUserType() === null;

  const buscarVagas = (termo: string) => {
    const termoTratado = termo.trim();
    navigate(termoTratado ? `/pesquisa-de-vagas?busca=${encodeURIComponent(termoTratado)}` : "/pesquisa-de-vagas");
  };

  const stats = [
    { value: "28,1M+", label: "Profissionais no agro" },
    { value: "R$ 10,9tri", label: "PIB nacional em 2023" },
    { value: "2,9%", label: "Crescimento do setor" },
  ];

  const statsSource = {
    label: "Fonte: CNA/Cepea e IBGE",
    href: "https://www.cnabrasil.org.br/noticias/cna-cepea-mao-de-obra-no-agronegocio-bate-recorde-com-28-2-milhoes-de-pessoas-ocupadas-em-2024",
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[600px] sm:min-h-[85vh] flex flex-col justify-center items-center pt-28 pb-16">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center bottom",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/95" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-10">
            <p className="uppercase text-xs sm:text-sm tracking-[0.25em] text-mediumGreen font-SecondFont font-semibold mb-5">
              Plataforma de vagas do agronegócio
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] text-deepGreen font-PrimaryFont leading-[1.05] tracking-tight">
              Encontre a vaga
              <span className="block text-mediumGreen italic">perfeita para você</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 mt-6 max-w-xl mx-auto font-SecondFont">
              Conectamos talentos às melhores oportunidades do agronegócio brasileiro
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-white shadow-sm rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Search size={18} className="text-mediumGreen" />
              <label className="text-gray-800 font-medium font-SecondFont">
                Buscar vagas
              </label>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarVagas(busca)}
                placeholder="Cargo, empresa ou palavra-chave..."
                className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl
                         focus:outline-none focus:border-mediumGreen
                         transition-colors duration-200 font-SecondFont text-gray-700"
              />
              <button
                onClick={() => buscarVagas(busca)}
                className="flex items-center justify-center gap-2 bg-deepGreen text-white px-8 py-4 rounded-xl
                         hover:bg-mediumGreen transition-colors duration-200 font-SecondFont font-semibold
                         tracking-wide"
              >
                PESQUISAR
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2 mt-5 text-sm font-SecondFont">
              <span className="text-gray-500">Populares:</span>
              {["Agrônomo", "Técnico Agrícola", "Operador de Máquinas", "Veterinário"].map(
                (term, i, arr) => (
                  <span key={term} className="flex items-center gap-2">
                    <button
                      onClick={() => buscarVagas(term)}
                      className="text-mediumGreen hover:text-deepGreen underline underline-offset-4
                               decoration-mediumGreen/30 hover:decoration-deepGreen transition-colors duration-200"
                    >
                      {term}
                    </button>
                    {i < arr.length - 1 && <span className="text-gray-300">·</span>}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-14 border-y border-paleGreen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col items-center text-center">
          <div className="flex flex-col sm:flex-row items-center divide-y sm:divide-y-0 sm:divide-x divide-paleGreen">
            {stats.map((stat) => (
              <div key={stat.label} className="py-6 sm:py-0 sm:px-12">
                <div className="text-4xl sm:text-5xl text-deepGreen font-PrimaryFont">{stat.value}</div>
                <div className="text-gray-600 font-SecondFont text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
          <a
            href={statsSource.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-8 px-3 py-1.5 rounded-full border border-gray-200
                     text-gray-500 hover:text-deepGreen hover:border-mediumGreen/40 transition-colors duration-200
                     font-SecondFont text-xs"
          >
            {statsSource.label}
            <ExternalLink size={12} />
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-24 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="uppercase text-xs tracking-[0.25em] text-mediumGreen font-SecondFont font-semibold mb-5">
                Setor em crescimento
              </p>
              <h2 className="text-3xl sm:text-4xl text-deepGreen font-PrimaryFont mb-6">
                Sobre o Agronegócio
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed font-SecondFont mb-6">
                O número de pessoas trabalhando no agronegócio brasileiro ultrapassou
                <strong className="text-deepGreen font-semibold"> 28,1 milhões</strong> pela primeira vez desde 2012.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed font-SecondFont mb-8">
                O Produto Interno Bruto (PIB) do Brasil fechou 2023 com alta de
                <strong className="text-deepGreen font-semibold"> 2,9%</strong>, totalizando
                <strong className="text-deepGreen font-semibold"> R$ 10,9 trilhões</strong>. O setor de serviços
                cresceu 2,4% e a indústria 1,6%.
              </p>
              <button
                onClick={() => navigate("/pesquisa-de-vagas")}
                className="group inline-flex items-center gap-2 text-deepGreen font-SecondFont font-semibold
                         border-b-2 border-deepGreen pb-1 hover:text-mediumGreen hover:border-mediumGreen
                         transition-colors duration-200"
              >
                Ver todas as vagas
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            <div className="relative overflow-hidden rounded-2xl min-h-[320px] flex items-end bg-gradient-to-br from-deepGreen to-mediumGreen">
              <div className="relative z-10 p-8 sm:p-10 text-white">
                <Leaf size={24} className="text-paleGreen mb-4" />
                <h3 className="text-2xl font-PrimaryFont mb-3">O Futuro é Agro</h3>
                <p className="font-SecondFont text-white/85 leading-relaxed">
                  O agronegócio brasileiro é referência mundial em produtividade e sustentabilidade,
                  oferecendo milhares de oportunidades de carreira.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Companies */}
      {mostrarCtaEmpresa && (
      <section id="servico" className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `url(${bgImage2})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="absolute inset-0 bg-deepGreen/80" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <p className="uppercase text-xs tracking-[0.25em] text-paleGreen font-SecondFont font-semibold mb-5">
            Para empresas
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-white font-PrimaryFont mb-6 leading-tight">
            Alcance seu público-alvo e contrate o funcionário perfeito
          </h2>
          <p className="text-lg text-white/85 font-SecondFont mb-8 max-w-2xl mx-auto">
            Tenha acesso a um processo seletivo sob medida para sua empresa e selecione o candidato ideal
            para o agronegócio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/cadastro-empresa")}
              className="inline-flex items-center justify-center gap-2 bg-white text-deepGreen rounded-xl
                       px-8 py-4 font-SecondFont font-semibold tracking-wide
                       hover:bg-paleGreen transition-colors duration-200"
            >
              CADASTRAR EMPRESA
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 border border-white text-white rounded-xl
                       px-8 py-4 font-SecondFont font-semibold tracking-wide
                       hover:bg-white/10 transition-colors duration-200"
            >
              CONHECER PLANOS
            </button>
          </div>
        </div>
      </section>
      )}

      {/* Internship Section */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${bgImage3})`,
            backgroundSize: "cover",
            backgroundPosition: "top center",
          }}
        >
          <div className="absolute inset-0 bg-white/90 sm:bg-gradient-to-r sm:from-white sm:via-white/95 sm:to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8">
          <div className="max-w-xl">
            <p className="uppercase text-xs tracking-[0.25em] text-mediumGreen font-SecondFont font-semibold mb-5">
              Estágios
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-deepGreen font-PrimaryFont mb-6 leading-tight">
              Formando os futuros líderes do agro
            </h2>
            <p className="text-lg text-gray-700 font-SecondFont mb-6">
              Encontre o estágio ideal para iniciar sua carreira no agronegócio.
            </p>
            <p className="text-xl text-mediumGreen font-PrimaryFont italic mb-8">
              "Plante iniciativas e colha resultados."
            </p>
            <button
              onClick={() => navigate("/pesquisa-de-vagas")}
              className="inline-flex items-center gap-2 bg-deepGreen text-white rounded-xl px-8 py-4
                       font-SecondFont font-semibold tracking-wide hover:bg-mediumGreen transition-colors duration-200"
            >
              PROCURAR ESTÁGIOS
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
