import { useState } from "react";
import { useNavigate } from "react-router";
import { Loader2, Users, Lock, AlertTriangle, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { EtapaProcessoSeletivo, deleteEtapa, deleteVaga, updateEtapaService, fecharEtapa as fecharEtapaService } from "@/services/vaga";
import type { ContagemEtapa } from "@/services/candidatura";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

type EtapaProps = {
  etapa: EtapaProcessoSeletivo;
  vagaId: number;
  index: number;
  totalEtapas: number;
  podeExcluir: boolean;
  contagem?: ContagemEtapa;
  movendo: boolean;
  onExcluir: (id: number) => void;
  onAtualizar: (etapa: EtapaProcessoSeletivo) => void;
  onMover: (etapaId: number, direcao: "cima" | "baixo") => void;
};

const Etapa = ({ etapa, vagaId, index, totalEtapas, podeExcluir, contagem, movendo, onExcluir, onAtualizar, onMover }: EtapaProps) => {
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(etapa.nome);
  const [descricao, setDescricao] = useState(etapa.descricao);
  const [prazoDias, setPrazoDias] = useState(etapa.prazoDias?.toString() ?? "");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [fechando, setFechando] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmFechar, setConfirmFechar] = useState(false);
  const [confirmExcluir, setConfirmExcluir] = useState(false);
  const [confirmBloqueado, setConfirmBloqueado] = useState(false);
  const [excluindoVaga, setExcluindoVaga] = useState(false);

  const fechada = etapa.status !== "aberta";

  const handleFecharEtapa = async () => {
    setFechando(true);
    try {
      const atualizada = await fecharEtapaService(etapa.id);
      onAtualizar(atualizada);
      setConfirmFechar(false);
      toast.success("Etapa fechada. Candidatos que não avançaram foram notificados.");
    } catch (e: any) {
      toast.error(e.message || "Erro ao fechar etapa");
    } finally {
      setFechando(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent transition-all duration-300";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  const handleSalvar = async () => {
    if (!nome.trim()) {
      setErro("O nome da etapa é obrigatório.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      const atualizada = await updateEtapaService(etapa.id, {
        nome: nome.trim(),
        descricao: descricao.trim(),
        prazoDias: prazoDias.trim() ? Number(prazoDias) : undefined,
      });
      onAtualizar(atualizada);
      setEditando(false);
    } catch (e: any) {
      setErro(e.message || "Erro ao salvar etapa");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirClick = () => {
    if (podeExcluir) {
      setConfirmExcluir(true);
    } else {
      setConfirmBloqueado(true);
    }
  };

  const handleExcluir = async () => {
    setConfirmExcluir(false);
    setExcluindo(true);
    try {
      await deleteEtapa(etapa.id);
      onExcluir(etapa.id);
    } finally {
      setExcluindo(false);
    }
  };

  const handleExcluirVaga = async () => {
    setExcluindoVaga(true);
    try {
      await deleteVaga(vagaId);
      toast.success("Vaga excluída com sucesso");
      navigate("/vagas-empresa");
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir vaga");
      setExcluindoVaga(false);
    }
  };

  if (editando) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 font-SecondFont">
        <h2 className="text-lg font-bold text-deepGreen font-PrimaryFont mb-6">Editar etapa {index}</h2>

        <div className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>Nome da etapa</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Descrição da etapa</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
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
              value={prazoDias}
              onChange={(e) => setPrazoDias(e.target.value)}
              placeholder="Ex: 5"
              className={inputClass}
            />
          </div>

          {erro && <p className="text-red-500 text-sm">{erro}</p>}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setEditando(false); setNome(etapa.nome); setDescricao(etapa.descricao); setPrazoDias(etapa.prazoDias?.toString() ?? ""); setErro(""); }}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200 font-SecondFont font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="flex items-center gap-2 bg-deepGreen text-white px-6 py-2.5 rounded-xl hover:bg-mediumGreen transition-colors duration-200 font-SecondFont font-semibold disabled:opacity-60"
            >
              {salvando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id={`etapa-${etapa.id}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 font-SecondFont scroll-mt-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="bg-gray-100 text-gray-600 text-sm w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0">{index}</span>
          <h2 className="text-lg font-bold text-deepGreen font-PrimaryFont break-words">{etapa.nome}</h2>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => onMover(etapa.id, "cima")}
              disabled={index === 1 || movendo}
              aria-label="Mover etapa pra cima"
              className="text-gray-400 hover:text-deepGreen disabled:opacity-30 disabled:hover:text-gray-400 transition-colors duration-200"
            >
              <ChevronUp size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onMover(etapa.id, "baixo")}
              disabled={index === totalEtapas || movendo}
              aria-label="Mover etapa pra baixo"
              className="text-gray-400 hover:text-deepGreen disabled:opacity-30 disabled:hover:text-gray-400 transition-colors duration-200"
            >
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          </div>
          {contagem && (
            <span
              className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
              title={
                contagem.rejeitados > 0
                  ? `${contagem.ativos} em andamento e ${contagem.rejeitados} não selecionado(s)`
                  : undefined
              }
            >
              <Users size={14} aria-hidden="true" />
              {contagem.total} {contagem.total === 1 ? "candidato" : "candidatos"}
              {contagem.rejeitados > 0 && (
                <span className="text-gray-400">({contagem.ativos} ativos)</span>
              )}
            </span>
          )}
          <span className="bg-paleGreen/50 text-deepGreen text-sm px-3 py-1 rounded-full capitalize">{etapa.status}</span>
        </div>
      </div>

      {etapa.descricao && (
        <p className="text-gray-600 text-sm leading-relaxed mt-4 break-words">{etapa.descricao}</p>
      )}

      {etapa.prazoDias != null && (
        <p className="text-gray-500 text-xs mt-2">Prazo: {etapa.prazoDias} dias</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
        <button
          onClick={() => navigate(`/candidatos?vagaId=${vagaId}&etapaId=${etapa.id}`)}
          className="flex items-center justify-center gap-2 bg-deepGreen text-sm text-white px-5 py-2.5 rounded-xl hover:bg-mediumGreen transition-colors duration-200 font-SecondFont font-semibold"
        >
          <Users size={16} aria-hidden="true" />
          Ver candidatos{contagem ? ` (${contagem.total})` : ""}
        </button>

        <button
          onClick={() => setEditando(true)}
          className="text-sm text-gray-700 px-5 py-2.5 rounded-xl border border-gray-200 hover:border-deepGreen hover:text-deepGreen transition-colors duration-200 font-SecondFont font-medium"
        >
          Editar etapa
        </button>

        <button
          onClick={() => setConfirmFechar(true)}
          disabled={fechada || fechando}
          className="flex items-center justify-center gap-2 text-sm text-amber-700 px-5 py-2.5 rounded-xl border border-amber-200 hover:bg-amber-50 transition-colors duration-200 font-SecondFont font-medium disabled:opacity-60 disabled:hover:bg-transparent"
        >
          {fechando ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}
          {fechada ? "Etapa fechada" : fechando ? "Fechando..." : "Fechar etapa"}
        </button>

        <button
          onClick={handleExcluirClick}
          disabled={excluindo}
          className="flex items-center justify-center gap-2 text-sm text-red-600 px-5 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 transition-colors duration-200 font-SecondFont font-medium disabled:opacity-60"
        >
          {excluindo && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {excluindo ? "Excluindo..." : "Excluir etapa"}
        </button>
      </div>

      <ConfirmDialog
        open={confirmFechar}
        onOpenChange={setConfirmFechar}
        title="Fechar esta etapa?"
        description={`Ao fechar "${etapa.nome}", todos os candidatos que não avançaram vão receber uma notificação automática via WhatsApp avisando que não foram selecionados. Essa ação não pode ser desfeita.`}
        onConfirm={handleFecharEtapa}
        confirmLabel={fechando ? "Fechando..." : "Fechar etapa"}
        confirmClassName="bg-amber-600 hover:bg-amber-700 text-white"
      />

      <ConfirmDialog
        open={confirmExcluir}
        onOpenChange={setConfirmExcluir}
        title="Excluir esta etapa?"
        description={`Tem certeza que deseja excluir "${etapa.nome}"? Essa ação não pode ser desfeita.`}
        onConfirm={handleExcluir}
        confirmLabel="Excluir etapa"
      />

      <AlertDialog open={confirmBloqueado} onOpenChange={setConfirmBloqueado}>
        <AlertDialogContent className="font-SecondFont">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-deepGreen flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-600" aria-hidden="true" />
              Não é possível excluir a última etapa
            </AlertDialogTitle>
            <AlertDialogDescription>
              Todo processo seletivo precisa ter pelo menos uma etapa — sem isso, candidatos não
              conseguem mais se candidatar a esta vaga. Adicione uma nova etapa antes de excluir
              "{etapa.nome}", ou exclua a vaga inteira (isso também remove todas as candidaturas
              já recebidas).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindoVaga}>Cancelar</AlertDialogCancel>
            <button
              type="button"
              onClick={handleExcluirVaga}
              disabled={excluindoVaga}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {excluindoVaga && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              {excluindoVaga ? "Excluindo..." : "Excluir vaga inteira"}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Etapa;
