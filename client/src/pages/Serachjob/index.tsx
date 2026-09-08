import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import Footer from "@/components/home-page/footer/footer";
import Header from "@/components/home-page/headers/header";
import FilterBar from "@/components/searchJob/filterBar/filterBar";
import Vagas from "@/components/searchJob/jobs/vagas";
import { buscarVagas, getRegioesComVagaAberta, type Vaga } from "@/services/vaga";
import { Briefcase, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const ORDENACOES = [
  { value: "recentes", label: "Mais recentes" },
  { value: "salario-maior", label: "Maior salário" },
  { value: "salario-menor", label: "Menor salário" },
] as const;

const ITENS_POR_PAGINA = 10;

const SearchJobs = () => {
  const [searchParams] = useSearchParams();
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [regioes, setRegioes] = useState<string[]>([]);
  const [busca, setBusca] = useState(searchParams.get("busca") ?? "");
  const [buscaInput, setBuscaInput] = useState(busca);
  const [regiao, setRegiao] = useState("");
  const [regiaoInput, setRegiaoInput] = useState("");
  const [area, setArea] = useState("");
  const [areaInput, setAreaInput] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [modalidadeInput, setModalidadeInput] = useState("");
  const [ordenacao, setOrdenacao] = useState<(typeof ORDENACOES)[number]["value"]>("recentes");
  const [paginaAtual, setPaginaAtual] = useState(1);

  useEffect(() => {
    getRegioesComVagaAberta()
      .then(setRegioes)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, regiao, area, modalidade, ordenacao]);

  useEffect(() => {
    setLoading(true);
    buscarVagas({ busca, regiao, area, modalidade, ordenacao, pagina: paginaAtual, itensPorPagina: ITENS_POR_PAGINA })
      .then((resultado) => {
        setVagas(resultado.vagas);
        setTotal(resultado.total);
        setTotalPaginas(resultado.totalPaginas);
      })
      .catch((e) => setErro(e.message || "Erro ao buscar vagas"))
      .finally(() => setLoading(false));
  }, [busca, regiao, area, modalidade, ordenacao, paginaAtual]);

  return (
    <>
      <Header />

      <main className="pt-20 min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-amber-600 to-[#FCCE41] py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-SecondFont font-medium mb-4">
              <Briefcase size={16} />
              {total} vaga{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-PrimaryFont mb-4">
              Encontre sua vaga ideal
            </h1>
            <p className="text-white/80 font-SecondFont text-lg max-w-2xl mx-auto">
              Explore as melhores oportunidades do agronegócio e dê o próximo passo na sua carreira
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <FilterBar
          buscaInput={buscaInput}
          onBuscaInputChange={setBuscaInput}
          onBuscar={() => setBusca(buscaInput)}
          regioes={regioes}
          regiaoInput={regiaoInput}
          onRegiaoInputChange={setRegiaoInput}
          areaInput={areaInput}
          onAreaInputChange={setAreaInput}
          modalidadeInput={modalidadeInput}
          onModalidadeInputChange={setModalidadeInput}
          onAplicarFiltros={() => {
            setRegiao(regiaoInput);
            setArea(areaInput);
            setModalidade(modalidadeInput);
          }}
          temFiltroAtivo={!!(busca || regiao || area || modalidade)}
          onLimparFiltros={() => {
            setBuscaInput("");
            setBusca("");
            setRegiaoInput("");
            setRegiao("");
            setAreaInput("");
            setArea("");
            setModalidadeInput("");
            setModalidade("");
          }}
        />

        {/* Results Section */}
        <section className="py-8 sm:py-12 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-deepGreen font-PrimaryFont">
                  Vagas disponíveis
                </h2>
                <p className="text-gray-600 font-SecondFont mt-1">
                  {total === 0
                    ? "Mostrando 0 resultados"
                    : `Mostrando ${(paginaAtual - 1) * ITENS_POR_PAGINA + 1}-${Math.min(paginaAtual * ITENS_POR_PAGINA, total)} de ${total} resultados`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-SecondFont text-sm">Ordenar por:</span>
                <select
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value as typeof ordenacao)}
                  className="bg-white border border-gray-200 rounded-lg px-4 py-2 font-SecondFont text-sm
                                 focus:outline-none focus:ring-2 focus:ring-mediumGreen"
                >
                  {ORDENACOES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-SecondFont">
                <Loader2 size={32} className="animate-spin text-mediumGreen mb-3" />
                Carregando vagas...
              </div>
            )}

            {/* Error State */}
            {!loading && erro && (
              <div className="text-center py-20 text-red-600 font-SecondFont">{erro}</div>
            )}

            {/* Empty State */}
            {!loading && !erro && total === 0 && (
              <div className="text-center py-20 text-gray-500 font-SecondFont">
                {busca || regiao || area || modalidade
                  ? "Nenhuma vaga encontrada pra essa busca."
                  : "Nenhuma vaga disponível no momento."}
              </div>
            )}

            {/* Jobs List */}
            {!loading && !erro && total > 0 && (
              <>
                <div className="space-y-6">
                  {vagas.map((vaga) => (
                    <Vagas
                      key={vaga.id}
                      id={vaga.id}
                      nome={vaga.nome}
                      cargo={vaga.cargo}
                      salario={vaga.salario}
                      descricao={vaga.descricao}
                      beneficios={vaga.beneficios}
                      empresa={vaga.empresa}
                      createdAt={vaga.createdAt}
                    />
                  ))}
                </div>

                {totalPaginas > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                      disabled={paginaAtual === 1}
                      aria-label="Página anterior"
                      className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-gray-600
                               hover:border-mediumGreen hover:text-deepGreen transition-colors duration-200
                               disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                    >
                      <ChevronLeft size={18} aria-hidden="true" />
                    </button>

                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                      <button
                        key={pagina}
                        onClick={() => setPaginaAtual(pagina)}
                        aria-current={pagina === paginaAtual ? "page" : undefined}
                        className={`flex items-center justify-center w-10 h-10 rounded-lg font-SecondFont text-sm transition-colors duration-200 ${
                          pagina === paginaAtual
                            ? "bg-deepGreen text-white font-semibold"
                            : "border border-gray-200 text-gray-600 hover:border-mediumGreen hover:text-deepGreen"
                        }`}
                      >
                        {pagina}
                      </button>
                    ))}

                    <button
                      onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                      disabled={paginaAtual === totalPaginas}
                      aria-label="Próxima página"
                      className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-gray-600
                               hover:border-mediumGreen hover:text-deepGreen transition-colors duration-200
                               disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                    >
                      <ChevronRight size={18} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default SearchJobs;
