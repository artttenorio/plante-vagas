import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { ProcessoSeletivoPayload } from "@/services/vaga";
import { dataInicioMinima, validarDataInicio } from "@/utils/dataInicio";

type Props = {
  initialValues: ProcessoSeletivoPayload;
  onSubmit: (data: ProcessoSeletivoPayload) => Promise<void>;
  submitLabel: string;
  onCancel?: () => void;
};

export default function ProcessoSeletivoForm({ initialValues, onSubmit, submitLabel, onCancel }: Props) {
  const [nome, setNome] = useState(initialValues.nome);
  const [descricao, setDescricao] = useState(initialValues.descricao);
  const [dataInicio, setDataInicio] = useState(initialValues.dataInicio);
  const [duracaoDias, setDuracaoDias] = useState(initialValues.duracaoDias);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const maxCaracteres = 5000;

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent transition-all duration-300";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  const handleSubmit = async () => {
    if (!nome.trim()) {
      setErro("O nome do processo é obrigatório.");
      return;
    }
    const erroData = validarDataInicio(dataInicio, initialValues.dataInicio);
    if (erroData) {
      setErro(erroData);
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await onSubmit({ nome: nome.trim(), descricao: descricao.trim(), dataInicio, duracaoDias });
    } catch (e: any) {
      setErro(e.message || "Erro ao salvar processo seletivo");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className={labelClass}>Nome do processo</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Seleção Engenheiro Agrônomo 2026"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Data de início</label>
          <input
            type="date"
            value={dataInicio}
            min={dataInicioMinima(initialValues.dataInicio)}
            onChange={(e) => setDataInicio(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Duração</label>
          <select
            value={duracaoDias}
            onChange={(e) => setDuracaoDias(Number(e.target.value))}
            className={inputClass}
          >
            <option value={3}>3 dias</option>
            <option value={7}>7 dias</option>
            <option value={10}>10 dias</option>
            <option value={15}>15 dias</option>
            <option value={20}>20 dias</option>
            <option value={30}>30 dias</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Descrição do processo seletivo</label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          maxLength={maxCaracteres}
          rows={5}
          className={`${inputClass} resize-none`}
        />
        <div className="text-right text-xs text-gray-400 mt-1">
          {descricao.length}/{maxCaracteres}
        </div>
      </div>

      {erro && <p className="text-red-500 text-sm">{erro}</p>}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={salvando}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200 font-SecondFont font-medium disabled:opacity-60"
          >
            Cancelar
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={salvando}
          className="flex items-center gap-2 bg-deepGreen text-white px-6 py-2.5 rounded-xl hover:bg-mediumGreen transition-colors duration-200 font-SecondFont font-semibold disabled:opacity-60"
        >
          {salvando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {salvando ? "Salvando..." : submitLabel}
        </button>
      </div>
    </div>
  );
}
