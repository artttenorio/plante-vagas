import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, X, Loader2 } from "lucide-react";
import { useVagaCreate } from "../VagaCreateContext";
import { updateVaga } from "@/services/vaga";
import { AREAS_VAGA, MODALIDADES_VAGA } from "@/utils/vagaOptions";
import { parseSalarioBR } from "@/utils/parseSalario";
import { useUser } from "@/components/company/userContextCompany";

const TITULO_MAX = 100;

const VagaData = ({ onProximo, vagaId }: { onProximo: () => void; vagaId?: number }) => {
  const isEdit = !!vagaId;
  const { data, setData } = useVagaCreate();
  const { UserData } = useUser();
  const nomeEmpresa = UserData.user.fantasyName || UserData.user.name;
  const [erros, setErros] = useState<{ nome?: string; cargo?: string; descricao?: string; salario?: string }>({});
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [novoBeneficio, setNovoBeneficio] = useState("");
  const [novoRequisito, setNovoRequisito] = useState("");
  const navigate = useNavigate();
  const maxCaracteres = 5000;

  const validate = () => {
    const novosErros: { nome?: string; cargo?: string; descricao?: string; salario?: string } = {};
    if (!data.nome.trim()) novosErros.nome = "Campo obrigatório";
    else if (data.nome.trim().length > TITULO_MAX) novosErros.nome = `Máximo de ${TITULO_MAX} caracteres`;
    if (!data.cargo.trim()) novosErros.cargo = "Campo obrigatório";
    if (!data.descricao.trim()) novosErros.descricao = "Campo obrigatório";
    if (data.salario.trim() && parseSalarioBR(data.salario) === null) {
      novosErros.salario = "Digite um salário válido (ex: 2500 ou 2.500,00), maior que zero";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const adicionarBeneficio = () => {
    const nome = novoBeneficio.trim();
    if (!nome) return;
    if (data.beneficios.some((b) => b.toLowerCase() === nome.toLowerCase())) {
      setNovoBeneficio("");
      return;
    }
    setData({ beneficios: [...data.beneficios, nome] });
    setNovoBeneficio("");
  };

  const removerBeneficio = (index: number) => {
    setData({ beneficios: data.beneficios.filter((_, i) => i !== index) });
  };

  const adicionarRequisito = () => {
    if (!novoRequisito.trim()) return;
    setData({ requisitos: [...data.requisitos, novoRequisito.trim()] });
    setNovoRequisito("");
  };

  const removerRequisito = (index: number) => {
    setData({ requisitos: data.requisitos.filter((_, i) => i !== index) });
  };

  const handleProximo = () => {
    if (!validate()) return;
    onProximo();
  };

  const handleSalvar = async () => {
    if (!validate()) return;
    setLoading(true);
    setErro("");
    try {
      await updateVaga(vagaId!, {
        nome: data.nome,
        cargo: data.cargo,
        descricao: data.descricao,
        salario: data.salario.trim() ? parseSalarioBR(data.salario) ?? undefined : undefined,
        area: data.area || undefined,
        modalidade: data.modalidade || undefined,
        beneficios: data.beneficios.map((nome) => ({ nome })),
        requisitos: data.requisitos.map((nome) => ({ nome })),
      });
      navigate("/vagas-empresa");
    } catch (e: any) {
      setErro(e.message || "Erro ao salvar vaga");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent transition-all duration-300";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 font-SecondFont">
        <h1 className="text-2xl font-bold text-deepGreen font-PrimaryFont mb-1">
          Preencha os dados da vaga
        </h1>
        {nomeEmpresa && (
          <p className="text-gray-500 text-sm mb-7">Publicando como {nomeEmpresa}</p>
        )}

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Título da vaga</label>
              <input
                type="text"
                value={data.nome}
                onChange={(e) => setData({ nome: e.target.value })}
                maxLength={TITULO_MAX}
                className={`${inputClass} ${erros.nome ? "border-red-400" : ""}`}
              />
              {erros.nome && <span className="text-red-500 text-xs mt-1 block">{erros.nome}</span>}
            </div>
            <div>
              <label className={labelClass}>Cargo</label>
              <input
                type="text"
                value={data.cargo}
                onChange={(e) => setData({ cargo: e.target.value })}
                className={`${inputClass} ${erros.cargo ? "border-red-400" : ""}`}
              />
              {erros.cargo && <span className="text-red-500 text-xs mt-1 block">{erros.cargo}</span>}
            </div>
          </div>

          <div>
            <label className={labelClass}>Salário <span className="text-gray-400 font-normal">(opcional)</span></label>
            <input
              type="text"
              value={data.salario}
              onChange={(e) => setData({ salario: e.target.value })}
              placeholder="Ex: 2500 ou deixe em branco pra combinar"
              className={`${inputClass} ${erros.salario ? "border-red-400" : ""}`}
            />
            {erros.salario && <span className="text-red-500 text-xs mt-1 block">{erros.salario}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Área <span className="text-gray-400 font-normal">(opcional)</span></label>
              <select
                value={data.area}
                onChange={(e) => setData({ area: e.target.value })}
                className={inputClass}
              >
                <option value="">Selecionar área</option>
                {AREAS_VAGA.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Modalidade <span className="text-gray-400 font-normal">(opcional)</span></label>
              <select
                value={data.modalidade}
                onChange={(e) => setData({ modalidade: e.target.value })}
                className={inputClass}
              >
                <option value="">Selecionar modalidade</option>
                {MODALIDADES_VAGA.map((modalidade) => (
                  <option key={modalidade} value={modalidade}>{modalidade}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Benefícios <span className="text-gray-400 font-normal">(opcional)</span></label>
            <div className="flex gap-3">
              <input
                type="text"
                value={novoBeneficio}
                onChange={(e) => setNovoBeneficio(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    adicionarBeneficio();
                  }
                }}
                placeholder="Ex: Vale-alimentação"
                className={inputClass}
              />
              <button
                type="button"
                onClick={adicionarBeneficio}
                className="flex items-center justify-center gap-2 bg-deepGreen text-white px-5 rounded-xl font-semibold hover:bg-mediumGreen transition-colors duration-200 flex-shrink-0"
              >
                <Plus size={18} aria-hidden="true" />
                Adicionar
              </button>
            </div>
            {data.beneficios.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {data.beneficios.map((beneficio, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-paleGreen/40 text-deepGreen px-3 py-1.5 rounded-full text-sm"
                  >
                    {beneficio}
                    <button
                      type="button"
                      onClick={() => removerBeneficio(index)}
                      aria-label={`Remover benefício ${beneficio}`}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Requisitos e Qualificações <span className="text-gray-400 font-normal">(opcional)</span></label>
            <div className="flex gap-3">
              <input
                type="text"
                value={novoRequisito}
                onChange={(e) => setNovoRequisito(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    adicionarRequisito();
                  }
                }}
                placeholder="Ex: Experiência com manejo de gado"
                className={inputClass}
              />
              <button
                type="button"
                onClick={adicionarRequisito}
                className="flex items-center justify-center gap-2 bg-deepGreen text-white px-5 rounded-xl font-semibold hover:bg-mediumGreen transition-colors duration-200 flex-shrink-0"
              >
                <Plus size={18} aria-hidden="true" />
                Adicionar
              </button>
            </div>
            {data.requisitos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {data.requisitos.map((requisito, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-paleGreen/40 text-deepGreen px-3 py-1.5 rounded-full text-sm"
                  >
                    {requisito}
                    <button
                      type="button"
                      onClick={() => removerRequisito(index)}
                      aria-label={`Remover requisito ${requisito}`}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Descrição da vaga</label>
            <textarea
              value={data.descricao}
              onChange={(e) => setData({ descricao: e.target.value })}
              maxLength={maxCaracteres}
              rows={6}
              className={`${inputClass} resize-none ${erros.descricao ? "border-red-400" : ""}`}
            />
            <div className="flex justify-between mt-1">
              {erros.descricao
                ? <span className="text-red-500 text-xs">{erros.descricao}</span>
                : <span />
              }
              <span className="text-gray-400 text-xs">{data.descricao.length}/{maxCaracteres}</span>
            </div>
          </div>

          {erro && <p className="text-red-500 text-sm">{erro}</p>}

          <div className="flex justify-end pt-2">
            {isEdit ? (
              <button
                onClick={handleSalvar}
                disabled={loading}
                className="flex items-center gap-2 bg-deepGreen text-white px-8 py-3 rounded-xl font-SecondFont font-semibold hover:bg-mediumGreen transition-colors duration-200 disabled:opacity-60"
              >
                {loading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
                {loading ? "Salvando..." : "Salvar alterações"}
              </button>
            ) : (
              <button
                onClick={handleProximo}
                className="bg-deepGreen text-white px-8 py-3 rounded-xl font-SecondFont font-semibold hover:bg-mediumGreen transition-colors duration-200"
              >
                Próximo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VagaData;
