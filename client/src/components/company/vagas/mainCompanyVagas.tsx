import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Briefcase, Loader2, ArrowLeft, Search, X } from "lucide-react";
import { getVagasByEmpresa, Vaga } from "@/services/vaga";
import { normalizeText } from "@/utils/normalizeText";
import VagaVagas from "./vagaVagas";

const ORDENACOES = [
  { value: "recentes", label: "Mais recentes" },
  { value: "antigas", label: "Mais antigas" },
  { value: "nome", label: "Nome A-Z" },
  { value: "salario-maior", label: "Maior salário" },
  { value: "salario-menor", label: "Menor salário" },
] as const;

export default function MainCompanyVagas() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [cargoFiltro, setCargoFiltro] = useState("");
  const [ordenacao, setOrdenacao] = useState<(typeof ORDENACOES)[number]["value"]>("recentes");
  const navigate = useNavigate();

  useEffect(() => {
    getVagasByEmpresa()
      .then(setVagas)
      .finally(() => setLoading(false));
  }, []);

  const cargos = useMemo(
    () => [...new Set(vagas.map((v) => v.cargo))].sort((a, b) => a.localeCompare(b)),
    [vagas],
  );

  const vagasExibidas = useMemo(() => {
    const buscaLower = normalizeText(busca.trim());
    let resultado = vagas.filter((v) => {
      const bateBusca = !buscaLower || normalizeText(v.nome).includes(buscaLower) || normalizeText(v.cargo).includes(buscaLower);
      const bateCargo = !cargoFiltro || v.cargo === cargoFiltro;
      return bateBusca && bateCargo;
    });

    resultado = [...resultado].sort((a, b) => {
      switch (ordenacao) {
        case "antigas":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "nome":
          return a.nome.localeCompare(b.nome);
        case "salario-maior":
          return (b.salario ?? 0) - (a.salario ?? 0);
        case "salario-menor":
          return (a.salario ?? Infinity) - (b.salario ?? Infinity);
        case "recentes":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return resultado;
  }, [vagas, busca, cargoFiltro, ordenacao]);

  const inputClass =
    "px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent transition-all duration-300";

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate("/empresa")}
          className="flex items-center gap-2 text-gray-600 hover:text-deepGreen transition-colors duration-200 pt-8 font-SecondFont text-sm"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Voltar para o início
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 pb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-deepGreen font-PrimaryFont">
              Vagas abertas
            </h1>
            <p className="text-gray-600 font-SecondFont mt-1">
              {loading ? "Carregando..." : `${vagas.length} vaga${vagas.length !== 1 ? "s" : ""} publicada${vagas.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => navigate("/criar-vaga")}
            className="inline-flex items-center justify-center gap-2 bg-deepGreen text-white px-5 py-3 rounded-xl font-SecondFont font-semibold hover:bg-mediumGreen transition-colors duration-200 self-start sm:self-auto"
          >
            <Plus size={18} aria-hidden="true" />
            Nova vaga
          </button>
        </div>

        {!loading && vagas.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar por nome ou cargo..."
                className={`${inputClass} w-full pl-10`}
              />
            </div>
            <select value={cargoFiltro} onChange={(e) => setCargoFiltro(e.target.value)} className={inputClass}>
              <option value="">Todos os cargos</option>
              {cargos.map((cargo) => (
                <option key={cargo} value={cargo}>{cargo}</option>
              ))}
            </select>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as typeof ordenacao)}
              className={inputClass}
            >
              {ORDENACOES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {(busca || cargoFiltro) && (
              <button
                type="button"
                onClick={() => { setBusca(""); setCargoFiltro(""); }}
                aria-label="Limpar filtros"
                title="Limpar filtros"
                className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 px-4 rounded-xl font-SecondFont font-medium hover:border-red-300 hover:text-red-600 transition-colors duration-200"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-SecondFont">
            <Loader2 size={32} className="animate-spin text-mediumGreen mb-3" aria-hidden="true" />
            Carregando vagas...
          </div>
        ) : vagas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100">
            <Briefcase size={32} className="text-gray-300 mb-3" aria-hidden="true" />
            <p className="text-gray-500 font-SecondFont">Nenhuma vaga cadastrada ainda.</p>
            <button
              onClick={() => navigate("/criar-vaga")}
              className="mt-4 text-deepGreen font-SecondFont font-semibold hover:text-mediumGreen transition-colors duration-200 underline underline-offset-4"
            >
              Publicar a primeira vaga
            </button>
          </div>
        ) : vagasExibidas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 font-SecondFont">Nenhuma vaga encontrada com esses filtros.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 pb-8">
            {vagasExibidas.map((vaga) => (
              <VagaVagas
                key={vaga.id}
                vaga={vaga}
                onExcluida={(id) => setVagas((prev) => prev.filter((v) => v.id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
