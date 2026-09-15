import { useState } from "react";
import { useVagaCreate } from "../VagaCreateContext";
import { dataInicioMinima, validarDataInicio } from "@/utils/dataInicio";

const Processselective = ({ onProximo }: { onProximo: () => void }) => {
  const { data, setData } = useVagaCreate();
  const [nomeProcesso, setNomeProcesso] = useState(data.processoSeletivo.nome);
  const [dataInicio, setDataInicio] = useState(data.processoSeletivo.dataInicio);
  // Valor que já estava salvo quando a tela abriu. Em edição de vaga antiga a
  // data pode ser passada e precisa continuar aceita; em criação é "".
  const [dataSalva] = useState(data.processoSeletivo.dataInicio);
  const [duracaoDias, setDuracaoDias] = useState(data.processoSeletivo.duracaoDias);
  const [descricao, setDescricao] = useState(data.processoSeletivo.descricao);
  const [erro, setErro] = useState("");
  const maxCaracteres = 5000;

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent transition-all duration-300";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  const handleProximo = () => {
    if (!nomeProcesso.trim()) {
      setErro("O nome do processo é obrigatório.");
      return;
    }
    const erroData = validarDataInicio(dataInicio, dataSalva);
    if (erroData) {
      setErro(erroData);
      return;
    }
    setData({
      processoSeletivo: {
        nome: nomeProcesso.trim(),
        descricao: descricao.trim(),
        dataInicio,
        duracaoDias,
      },
    });
    onProximo();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 font-SecondFont">
        <h1 className="text-2xl font-bold text-deepGreen font-PrimaryFont mb-1">
          Processo seletivo
        </h1>
        <p className="text-gray-600 mb-6">
          Dê um nome e um período pro seu processo de seleção
        </p>

        <div className="flex flex-col gap-6">
          <div>
            <label className={labelClass}>Nome do processo</label>
            <input
              type="text"
              value={nomeProcesso}
              onChange={(e) => setNomeProcesso(e.target.value)}
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
                min={dataInicioMinima(dataSalva)}
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
              rows={6}
              className={`${inputClass} resize-none`}
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {descricao.length}/{maxCaracteres}
            </div>
          </div>

          {erro && <p className="text-red-500 text-sm">{erro}</p>}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleProximo}
              className="bg-deepGreen text-white px-8 py-3 rounded-xl font-SecondFont font-semibold hover:bg-mediumGreen transition-colors duration-200"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Processselective;
