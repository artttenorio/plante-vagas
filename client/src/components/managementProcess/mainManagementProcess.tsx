import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Plus, Loader2, ArrowLeft, Pencil, Calendar, Clock } from "lucide-react";
import EtapasDisplay from "./etapasDisplay";
import EtapasTimeline from "./etapasTimeline";
import ProcessoSeletivoForm from "./processoSeletivoForm";
import { toast } from "sonner";
import {
  getVagaById,
  addEtapa,
  upsertProcessoSeletivo,
  reordenarEtapas,
  EtapaProcessoSeletivo,
  ProcessoSeletivoPayload,
  Vaga,
} from "@/services/vaga";

const MainManagementProcess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const vagaId = searchParams.get("vagaId");

  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [nomeEtapa, setNomeEtapa] = useState("");
  const [descricaoEtapa, setDescricaoEtapa] = useState("");
  const [prazoDiasEtapa, setPrazoDiasEtapa] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const [editandoProcesso, setEditandoProcesso] = useState(false);
  const [movendoId, setMovendoId] = useState<number | null>(null);

  const fetchVaga = () => {
    if (!vagaId) {
      setErro("Nenhuma vaga selecionada.");
      setLoading(false);
      return;
    }
    setLoading(true);
    getVagaById(Number(vagaId))
      .then(setVaga)
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVaga();
  }, [vagaId]);

  const etapas: EtapaProcessoSeletivo[] = vaga?.etapas ?? [];

  const handleAdicionarEtapa = async () => {
    if (!nomeEtapa.trim()) {
      setErroForm("O nome da etapa é obrigatório.");
      return;
    }
    setSalvando(true);
    setErroForm("");
    try {
      const nova = await addEtapa(Number(vagaId), {
        nome: nomeEtapa.trim(),
        descricao: descricaoEtapa.trim(),
        prazoDias: prazoDiasEtapa.trim() ? Number(prazoDiasEtapa) : undefined,
      });
      setVaga((prev) => prev ? { ...prev, etapas: [...prev.etapas, nova] } : prev);
      setNomeEtapa("");
      setDescricaoEtapa("");
      setPrazoDiasEtapa("");
      setShowForm(false);
    } catch (e: any) {
      setErroForm(e.message || "Erro ao adicionar etapa");
    } finally {
      setSalvando(false);
    }
  };

  const handleMover = async (etapaId: number, direcao: "cima" | "baixo") => {
    const atual = [...etapas];
    const idx = atual.findIndex((e) => e.id === etapaId);
    const alvo = direcao === "cima" ? idx - 1 : idx + 1;
    if (idx === -1 || alvo < 0 || alvo >= atual.length) return;

    [atual[idx], atual[alvo]] = [atual[alvo], atual[idx]];
    setMovendoId(etapaId);
    try {
      await reordenarEtapas(Number(vagaId), atual.map((e) => e.id));
      setVaga((prev) => (prev ? { ...prev, etapas: atual } : prev));
    } catch (e: any) {
      toast.error(e.message || "Erro ao reordenar etapas");
    } finally {
      setMovendoId(null);
    }
  };

  const handleSalvarProcesso = async (dados: ProcessoSeletivoPayload) => {
    const atualizado = await upsertProcessoSeletivo(Number(vagaId), dados);
    setVaga((prev) => prev ? { ...prev, processoSeletivo: atualizado } : prev);
    setEditandoProcesso(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen font-SecondFont text-gray-500 gap-3">
        <Loader2 size={32} className="animate-spin text-mediumGreen" aria-hidden="true" />
        Carregando...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex justify-center items-center h-screen font-SecondFont">
        <p className="text-red-500">{erro}</p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent transition-all duration-300";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  const dataInicioFormatada = vaga?.processoSeletivo
    ? new Date(vaga.processoSeletivo.dataInicio).toLocaleDateString("pt-BR", { timeZone: "UTC" })
    : "";

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate("/vagas-empresa")}
          className="flex items-center gap-2 text-gray-600 hover:text-deepGreen transition-colors duration-200 pt-8 font-SecondFont text-sm"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Voltar para vagas
        </button>

        {!vaga?.processoSeletivo ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mt-8 font-SecondFont">
            <h1 className="text-2xl font-bold text-deepGreen font-PrimaryFont mb-1">
              Complete o processo seletivo
            </h1>
            <p className="text-gray-600 mb-6">
              Essa vaga ainda não tem um título e descrição de processo seletivo definidos.
              Preencha antes de continuar pra gerenciar as etapas.
            </p>
            <ProcessoSeletivoForm
              initialValues={{ nome: "", descricao: "", dataInicio: "", duracaoDias: 7 }}
              onSubmit={handleSalvarProcesso}
              submitLabel="Salvar e continuar"
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pt-2 pb-8">
              {editandoProcesso ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 w-full font-SecondFont">
                  <h2 className="text-lg font-bold text-deepGreen font-PrimaryFont mb-6">Editar processo</h2>
                  <ProcessoSeletivoForm
                    initialValues={{
                      nome: vaga.processoSeletivo.nome,
                      descricao: vaga.processoSeletivo.descricao,
                      dataInicio: vaga.processoSeletivo.dataInicio.slice(0, 10),
                      duracaoDias: vaga.processoSeletivo.duracaoDias,
                    }}
                    onSubmit={handleSalvarProcesso}
                    submitLabel="Salvar alterações"
                    onCancel={() => setEditandoProcesso(false)}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <h1 className="text-2xl font-bold text-deepGreen font-PrimaryFont">
                      {vaga.processoSeletivo.nome}
                    </h1>
                    {vaga.processoSeletivo.descricao && (
                      <p className="text-gray-600 font-SecondFont mt-2 max-w-2xl break-words">
                        {vaga.processoSeletivo.descricao}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-500 font-SecondFont text-sm">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} aria-hidden="true" />
                        Início em {dataInicioFormatada}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} aria-hidden="true" />
                        Duração de {vaga.processoSeletivo.duracaoDias} dias
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-shrink-0 self-start">
                    <button
                      onClick={() => setEditandoProcesso(true)}
                      className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-SecondFont font-medium hover:border-deepGreen hover:text-deepGreen transition-colors duration-200"
                    >
                      <Pencil size={16} aria-hidden="true" />
                      Editar processo
                    </button>
                    <button
                      onClick={() => setShowForm((prev) => !prev)}
                      className="inline-flex items-center justify-center gap-2 bg-deepGreen text-white px-5 py-3 rounded-xl font-SecondFont font-semibold hover:bg-mediumGreen transition-colors duration-200"
                    >
                      <Plus size={18} aria-hidden="true" />
                      Nova etapa
                    </button>
                  </div>
                </>
              )}
            </div>

            {showForm && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8 flex flex-col gap-5 font-SecondFont">
                <h2 className="text-lg font-bold text-deepGreen font-PrimaryFont">Nova etapa</h2>

                <div>
                  <label className={labelClass}>Nome da etapa</label>
                  <input
                    type="text"
                    value={nomeEtapa}
                    onChange={(e) => setNomeEtapa(e.target.value)}
                    placeholder="Ex: Entrevista técnica"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Descrição da etapa</label>
                  <textarea
                    value={descricaoEtapa}
                    onChange={(e) => setDescricaoEtapa(e.target.value)}
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Prazo (dias) <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={prazoDiasEtapa}
                    onChange={(e) => setPrazoDiasEtapa(e.target.value)}
                    placeholder="Ex: 5"
                    className={inputClass}
                  />
                </div>

                {erroForm && <p className="text-red-500 text-sm">{erroForm}</p>}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => { setShowForm(false); setErroForm(""); }}
                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200 font-SecondFont font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAdicionarEtapa}
                    disabled={salvando}
                    className="flex items-center gap-2 bg-deepGreen text-white px-6 py-2.5 rounded-xl hover:bg-mediumGreen transition-colors duration-200 font-SecondFont font-semibold disabled:opacity-60"
                  >
                    {salvando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                    {salvando ? "Salvando..." : "Adicionar"}
                  </button>
                </div>
              </div>
            )}

            {etapas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-500 font-SecondFont">Nenhuma etapa cadastrada ainda.</p>
              </div>
            ) : (
              <>
                <EtapasTimeline etapas={etapas} />
                <EtapasDisplay
                  etapas={etapas}
                  vagaId={Number(vagaId)}
                  movendoId={movendoId}
                  onMover={handleMover}
                  onExcluir={(id) =>
                    setVaga((prev) =>
                      prev ? { ...prev, etapas: prev.etapas.filter((e) => e.id !== id) } : prev
                    )
                  }
                  onAtualizar={(atualizada) =>
                    setVaga((prev) =>
                      prev ? { ...prev, etapas: prev.etapas.map((e) => e.id === atualizada.id ? atualizada : e) } : prev
                    )
                  }
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MainManagementProcess;
