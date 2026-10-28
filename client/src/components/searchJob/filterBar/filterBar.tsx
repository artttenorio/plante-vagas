import { MapPin, Briefcase, Monitor, Filter, ChevronDown, Search, X } from "lucide-react";
import { AREAS_VAGA, MODALIDADES_VAGA } from "@/utils/vagaOptions";

type Props = {
  buscaInput: string;
  onBuscaInputChange: (busca: string) => void;
  onBuscar: () => void;
  regioes: string[];
  regiaoInput: string;
  onRegiaoInputChange: (regiao: string) => void;
  areaInput: string;
  onAreaInputChange: (area: string) => void;
  modalidadeInput: string;
  onModalidadeInputChange: (modalidade: string) => void;
  onAplicarFiltros: () => void;
  temFiltroAtivo: boolean;
  onLimparFiltros: () => void;
  sugestoes: string[];
};

const FilterBar = ({
  buscaInput,
  onBuscaInputChange,
  onBuscar,
  regioes,
  regiaoInput,
  onRegiaoInputChange,
  areaInput,
  onAreaInputChange,
  modalidadeInput,
  onModalidadeInputChange,
  onAplicarFiltros,
  temFiltroAtivo,
  onLimparFiltros,
  sugestoes,
}: Props) => {
  return (
    <div className="bg-gradient-to-b from-paleGreen/50 to-white w-full py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Search Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); onBuscar(); }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-100"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                value={buscaInput}
                onChange={(e) => onBuscaInputChange(e.target.value)}
                placeholder="Buscar por cargo, empresa ou palavra-chave..."
                aria-label="Buscar por cargo, empresa ou palavra-chave"
                list="sugestoes-busca-vagas"
                autoComplete="off"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent
                         transition-all duration-300 font-SecondFont"
              />
              <datalist id="sugestoes-busca-vagas">
                {sugestoes.map((sugestao) => (
                  <option key={sugestao} value={sugestao} />
                ))}
              </datalist>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-deepGreen text-white px-8 py-4
                             rounded-xl font-SecondFont font-semibold hover:bg-mediumGreen
                             transition-all duration-300 hover:shadow-lg hover:shadow-deepGreen/20"
            >
              <Search size={18} />
              BUSCAR
            </button>
          </div>
        </form>

        {/* Filters */}
        <form
          onSubmit={(e) => { e.preventDefault(); onAplicarFiltros(); }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4 text-deepGreen font-SecondFont font-medium">
            <Filter size={18} />
            <span>Filtrar vagas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Region Filter */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-mediumGreen">
                <MapPin size={18} />
              </div>
              <select
                value={regiaoInput}
                onChange={(e) => onRegiaoInputChange(e.target.value)}
                aria-label="Filtrar por região"
                className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-xl
                         appearance-none cursor-pointer font-SecondFont text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent
                         hover:border-mediumGreen transition-all duration-300"
              >
                <option value="">Todas as regiões</option>
                {regioes.map((regiao) => (
                  <option key={regiao} value={regiao}>{regiao}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <ChevronDown size={18} />
              </div>
            </div>

            {/* Area Filter */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-mediumGreen">
                <Briefcase size={18} />
              </div>
              <select
                value={areaInput}
                onChange={(e) => onAreaInputChange(e.target.value)}
                aria-label="Filtrar por área"
                className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-xl
                         appearance-none cursor-pointer font-SecondFont text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent
                         hover:border-mediumGreen transition-all duration-300"
              >
                <option value="">Todas as áreas</option>
                {AREAS_VAGA.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <ChevronDown size={18} />
              </div>
            </div>

            {/* Modality Filter */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-mediumGreen">
                <Monitor size={18} />
              </div>
              <select
                value={modalidadeInput}
                onChange={(e) => onModalidadeInputChange(e.target.value)}
                aria-label="Filtrar por modalidade"
                className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-xl
                         appearance-none cursor-pointer font-SecondFont text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent
                         hover:border-mediumGreen transition-all duration-300"
              >
                <option value="">Todas as Modalidades</option>
                {MODALIDADES_VAGA.map((modalidade) => (
                  <option key={modalidade} value={modalidade}>{modalidade}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <ChevronDown size={18} />
              </div>
            </div>

            {/* Apply Filters Button */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-mediumGreen text-white py-4 px-6
                       rounded-xl font-SecondFont font-semibold hover:bg-deepGreen
                       transition-all duration-300 hover:shadow-lg"
            >
              <Filter size={18} />
              APLICAR FILTROS
            </button>
          </div>

          {temFiltroAtivo && (
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={onLimparFiltros}
                className="flex items-center gap-1.5 text-gray-500 text-sm font-SecondFont font-medium
                         hover:text-red-600 transition-colors duration-200"
              >
                <X size={16} aria-hidden="true" />
                Limpar filtros
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FilterBar;
