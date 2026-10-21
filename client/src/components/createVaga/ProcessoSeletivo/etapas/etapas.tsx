import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Loader2 } from "lucide-react";
import { useVagaCreate } from "../../VagaCreateContext";
import { createVaga, updateVaga } from "@/services/vaga";
import { parseSalarioBR } from "@/utils/parseSalario";

interface EtapaForm {
  nome: string;
  descricao: string;
  prazoDias: string;
}

const Etapas = ({ vagaId }: { vagaId?: number }) => {
  const isEdit = !!vagaId;
  const [etapas, setEtapas] = useState<EtapaForm[]>([{ nome: "", descricao: "", prazoDias: "" }]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const maxCaracteres = 5000;
  const navigate = useNavigate();
  const { data } = useVagaCreate();

  const updateEtapa = (index: number, field: keyof EtapaForm, value: string) => {
    setEtapas((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  };

  const adicionarEtapa = () => {
    setEtapas((prev) => [...prev, { nome: "", descricao: "", prazoDias: "" }]);
  };

  const handleProximo = async () => {
    const primeiraVazia = etapas.find((e) => !e.nome.trim());
    if (primeiraVazia) {
      setErro("Todas as etapas precisam ter um nome.");
      return;
    }
    const nomesVistos = new Set<string>();
    const nomeRepetido = etapas.find((e) => {
      const chave = e.nome.trim().toLowerCase();
      if (nomesVistos.has(chave)) return true;
      nomesVistos.add(chave);
      return false;
    });
    if (nomeRepetido) {
      setErro(`Já existe uma etapa chamada "${nomeRepetido.nome.trim()}" — escolha nomes diferentes.`);
      return;
    }
    const prazoInvalido = etapas.find(
      (e) => e.prazoDias.trim() && (!Number.isInteger(Number(e.prazoDias)) || Number(e.prazoDias) <= 0),
    );
    if (prazoInvalido) {
      setErro("O prazo da etapa deve ser um número inteiro de dias maior que zero.");
      return;
    }
    if (data.salario.trim() && parseSalarioBR(data.salario) === null) {
      setErro("Digite um salário válido (ex: 2500 ou 2.500,00), maior que zero.");
      return;
    }
    setLoading(true);
    setErro("");
    try {
      const payload = {
        nome: data.nome,
        cargo: data.cargo,
        descricao: data.descricao,
        salario: data.salario.trim() ? parseSalarioBR(data.salario) ?? undefined : undefined,
        area: data.area || undefined,
        modalidade: data.modalidade || undefined,
        beneficios: data.beneficios.map((nome) => ({ nome })),
        requisitos: data.requisitos.map((nome) => ({ nome })),
        etapas: etapas.map((e) => ({
          nome: e.nome.trim(),
          descricao: e.descricao.trim(),
          prazoDias: e.prazoDias.trim() ? Number(e.prazoDias) : undefined,
        })),
        processoSeletivo: data.processoSeletivo,
      };

      if (isEdit) {
        await updateVaga(vagaId, payload);
      } else {
        await createVaga(payload);
      }
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
          Etapas do processo seletivo
        </h1>
        <p className="text-gray-600 mb-8">
          Defina as fases pelas quais os candidatos vão passar
        </p>

        <div className="flex flex-col gap-8">
          {etapas.map((etapa, index) => (
            <div key={index} className="flex flex-col gap-4">
              <span className="font-semibold text-deepGreen font-PrimaryFont">Etapa {index + 1}</span>

              <div>
                <label className={labelClass}>Nome da etapa</label>
                <input
                  type="text"
                  value={etapa.nome}
                  onChange={(e) => updateEtapa(index, "nome", e.target.value)}
                  placeholder="Ex: Entrevista com RH"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Descrição da etapa</label>
                <textarea
                  value={etapa.descricao}
                  onChange={(e) => updateEtapa(index, "descricao", e.target.value)}
                  maxLength={maxCaracteres}
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {etapa.descricao.length}/{maxCaracteres}
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Prazo (dias) <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={etapa.prazoDias}
                  onChange={(e) => updateEtapa(index, "prazoDias", e.target.value)}
                  placeholder="Ex: 5"
                  className={inputClass}
                />
              </div>

              {index < etapas.length - 1 && <hr className="border-gray-100 mt-2" />}
            </div>
          ))}
        </div>

        <button
          onClick={adicionarEtapa}
          className="mt-8 flex items-center gap-2 border border-deepGreen text-deepGreen px-6 py-3 rounded-xl font-SecondFont font-semibold hover:bg-deepGreen hover:text-white transition-colors duration-200 w-fit"
        >
          <Plus size={18} aria-hidden="true" />
          Adicionar mais uma etapa
        </button>

        {erro && <p className="text-red-500 text-sm mt-4">{erro}</p>}

        <div className="flex justify-end mt-8">
          <button
            onClick={handleProximo}
            disabled={loading}
            className="flex items-center gap-2 bg-deepGreen text-white px-8 py-3 rounded-xl font-SecondFont font-semibold hover:bg-mediumGreen transition-colors duration-200 disabled:opacity-60"
          >
            {loading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
            {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Finalizar e publicar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Etapas;
