import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Users, Loader2, Mail, Phone, Check, X, FileText, UserX, Award, EllipsisVertical } from "lucide-react";
import { toast } from "sonner";
import { getVagaById, Vaga } from "@/services/vaga";
import {
  getCandidatosPorEtapa,
  getCandidatosPorVaga,
  moverCandidatura,
  type Candidatura,
} from "@/services/candidatura";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MENSAGEM_PADRAO_REJEICAO =
  "Agradecemos seu interesse nesta vaga. Após avaliação do seu perfil, optamos por seguir com outros candidatos neste processo seletivo.";

export default function MainCandidates() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vagaId = searchParams.get("vagaId");
  const etapaId = searchParams.get("etapaId");

  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [candidatos, setCandidatos] = useState<Candidatura[]>([]);
  const [loading, setLoading] = useState(!!(vagaId || etapaId));
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null);
  const [rejeitarAlvo, setRejeitarAlvo] = useState<Candidatura | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [rejeitando, setRejeitando] = useState(false);

  useEffect(() => {
    if (vagaId) getVagaById(Number(vagaId)).then(setVaga);
  }, [vagaId]);

  useEffect(() => {
    if (etapaId) {
      getCandidatosPorEtapa(Number(etapaId))
        .then(setCandidatos)
        .finally(() => setLoading(false));
    } else if (vagaId) {
      getCandidatosPorVaga(Number(vagaId))
        .then(setCandidatos)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [vagaId, etapaId]);

  const etapa = vaga?.etapas.find((e) => e.id === Number(etapaId));

  // Por `ordem` (a coluna que "reordenar etapas" mexe), não por `id` (ordem
  // de criação). O backend já manda `vaga.etapas` ordenado por `ordem` —
  // reordenar aqui de novo por `id` desfazia isso sempre que alguém tinha
  // usado as setinhas de mover etapa, mandando "Avançar etapa" pra etapa
  // errada (a próxima por ID de criação, não a próxima que aparece na
  // tela) sem nenhum aviso — o candidato "sumia" da lista atual sem
  // aparecer onde a empresa esperava.
  const etapasOrdenadas = [...(vaga?.etapas ?? [])].sort((a, b) => a.ordem - b.ordem);

  // Etapa fechada = resultado já mandado por WhatsApp; a decisão fica travada
  const etapaFechada = (etapaIdAtual: number) =>
    etapasOrdenadas.find((e) => e.id === etapaIdAtual)?.status === "fechada";

  const getProximaEtapa = (etapaIdAtual: number) => {
    const idx = etapasOrdenadas.findIndex((e) => e.id === etapaIdAtual);
    if (idx === -1) return null;
    return etapasOrdenadas[idx + 1] ?? null;
  };

  const handleAtualizarStatus = async (candidaturaId: number, statusCandidato: boolean) => {
    setAtualizandoId(candidaturaId);
    try {
      const atualizada = await moverCandidatura(candidaturaId, { statusCandidato });
      setCandidatos((prev) => prev.map((c) => (c.id === candidaturaId ? atualizada : c)));
      toast.success(statusCandidato ? "Candidato marcado como avançado" : "Avanço desfeito — candidato sem decisão");
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar candidato");
    } finally {
      setAtualizandoId(null);
    }
  };

  // Avançar move o candidato na hora (e avisa por WhatsApp na hora) — não
  // espera mais a empresa fechar a etapa inteira.
  const handleAvancarEtapa = async (candidatura: Candidatura) => {
    const proximaEtapa = getProximaEtapa(candidatura.etapaId);
    setAtualizandoId(candidatura.id);
    try {
      if (proximaEtapa) {
        await moverCandidatura(candidatura.id, { etapaId: proximaEtapa.id, statusCandidato: false });
        // a candidatura saiu da etapa que está sendo vista aqui — remove da lista atual
        setCandidatos((prev) => prev.filter((c) => c.id !== candidatura.id));
        toast.success(`Candidato movido para a etapa "${proximaEtapa.nome}" e avisado pelo WhatsApp`);
      } else {
        const atualizada = await moverCandidatura(candidatura.id, { statusCandidato: true });
        setCandidatos((prev) => prev.map((c) => (c.id === candidatura.id ? atualizada : c)));
        toast.success("Candidato aprovado e avisado pelo WhatsApp — esta é a última etapa do processo");
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao avançar candidato");
    } finally {
      setAtualizandoId(null);
    }
  };

  const handleSelecionar = async (candidatura: Candidatura) => {
    setAtualizandoId(candidatura.id);
    try {
      const atualizada = await moverCandidatura(candidatura.id, { selecionado: !candidatura.selecionado });
      setCandidatos((prev) => prev.map((c) => (c.id === candidatura.id ? atualizada : c)));
      toast.success(atualizada.selecionado ? "Candidato marcado como selecionado e avisado pelo WhatsApp" : "Seleção desfeita");
    } catch (e: any) {
      toast.error(e.message || "Erro ao marcar candidato como selecionado");
    } finally {
      setAtualizandoId(null);
    }
  };

  const handleAbrirRejeitar = (candidatura: Candidatura) => {
    setMotivoRejeicao("");
    setRejeitarAlvo(candidatura);
  };

  const handleConfirmarRejeicao = async () => {
    if (!rejeitarAlvo) return;
    setRejeitando(true);
    try {
      const atualizada = await moverCandidatura(rejeitarAlvo.id, {
        rejeitado: true,
        motivoRejeicao: motivoRejeicao.trim() || MENSAGEM_PADRAO_REJEICAO,
      });
      setCandidatos((prev) => prev.map((c) => (c.id === rejeitarAlvo.id ? atualizada : c)));
      toast.success("Candidato rejeitado e avisado pelo WhatsApp");
      setRejeitarAlvo(null);
    } catch (e: any) {
      toast.error(e.message || "Erro ao rejeitar candidato");
    } finally {
      setRejeitando(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate(`/gerenciar-processo?vagaId=${vagaId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-deepGreen transition-colors duration-200 pt-8 font-SecondFont text-sm"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Voltar para o processo seletivo
        </button>

        <div className="pb-8 pt-2">
          <h1 className="text-2xl font-bold text-deepGreen font-PrimaryFont">
            Candidatos
          </h1>
          {loading ? (
            <p className="text-gray-500 font-SecondFont mt-1 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Carregando...
            </p>
          ) : vaga ? (
            <p className="text-gray-600 font-SecondFont mt-1">
              {vaga.nome} — {vaga.cargo}
              {etapa && <> · Etapa: {etapa.nome}</>}
            </p>
          ) : (
            <p className="text-gray-600 font-SecondFont mt-1">Nenhuma vaga selecionada</p>
          )}
        </div>

        {!loading && candidatos.length === 0 && (
          <div className="flex flex-col items-center text-center bg-white rounded-2xl border border-gray-100 py-16 px-6">
            <div className="w-16 h-16 bg-paleGreen/40 rounded-2xl flex items-center justify-center mb-4">
              <Users size={28} className="text-deepGreen" aria-hidden="true" />
            </div>
            <p className="text-gray-700 font-SecondFont font-medium mb-2">
              Ainda não há candidatos aqui
            </p>
            <p className="text-sm text-gray-500 max-w-md">
              Assim que um candidato se candidatar a esta vaga, ele vai aparecer nesta lista.
            </p>
          </div>
        )}

        {!loading && candidatos.length > 0 && (
          <div className="flex flex-col gap-4 pb-8">
            {candidatos.map((candidatura) => (
              <div
                key={candidatura.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 font-SecondFont"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-paleGreen/40 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {candidatura.candidato?.photoUrl ? (
                        <img src={candidatura.candidato.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users size={20} className="text-deepGreen" aria-hidden="true" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-deepGreen font-PrimaryFont">
                        {candidatura.candidato?.name ?? "Candidato"}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600 text-sm">
                      {candidatura.candidato?.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail size={14} className="text-mediumGreen" />
                          {candidatura.candidato.email}
                        </span>
                      )}
                      {candidatura.candidato?.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone size={14} className="text-mediumGreen" />
                          {candidatura.candidato.phone}
                        </span>
                      )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-sm px-3 py-1 rounded-full flex-shrink-0 ${
                      candidatura.rejeitado
                        ? "bg-red-100 text-red-700"
                        : candidatura.selecionado
                        ? "bg-amber-100 text-amber-800"
                        : candidatura.statusCandidato
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {candidatura.rejeitado
                      ? "Rejeitado"
                      : candidatura.selecionado
                      ? "Selecionado"
                      : candidatura.statusCandidato
                      ? "Avançou"
                      : "Em análise"}
                  </span>
                </div>

                {candidatura.rejeitado && candidatura.motivoRejeicao && (
                  <p className="text-red-700 bg-red-50 border border-red-100 rounded-xl p-3 text-sm mt-4">
                    Motivo: {candidatura.motivoRejeicao}
                  </p>
                )}

                <div className="flex items-center gap-2 justify-end mt-5">
                  <button
                    onClick={() => handleAvancarEtapa(candidatura)}
                    disabled={atualizandoId === candidatura.id || candidatura.rejeitado || candidatura.statusCandidato || etapaFechada(candidatura.etapaId)}
                    className="flex items-center gap-2 text-sm text-white bg-deepGreen px-5 py-2.5 rounded-xl hover:bg-mediumGreen transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {atualizandoId === candidatura.id ? (
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Check size={16} aria-hidden="true" />
                    )}
                    {getProximaEtapa(candidatura.etapaId) ? "Avançar etapa" : "Avançou"}
                  </button>

                  {/* modal={false}: com o menu modal, o Radix trava o body (pointer-events:none)
                      e, ao abrir a confirmação a partir de um item, restaura esse bloqueio
                      de forma errada — a página ficava sem clique depois de cancelar. */}
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="Mais opções do candidato"
                        className="flex items-center justify-center p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-deepGreen hover:text-deepGreen transition-colors duration-200"
                      >
                        <EllipsisVertical size={18} aria-hidden="true" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="font-SecondFont min-w-52">
                      <DropdownMenuItem
                        onSelect={() => navigate(`/candidatos/curriculo/${candidatura.candidatoId}?${searchParams.toString()}`)}
                      >
                        <FileText size={14} aria-hidden="true" />
                        Ver currículo
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onSelect={() => handleAtualizarStatus(candidatura.id, false)}
                        disabled={atualizandoId === candidatura.id || candidatura.rejeitado || !candidatura.statusCandidato || etapaFechada(candidatura.etapaId)}
                      >
                        <X size={14} aria-hidden="true" />
                        Desfazer avanço
                      </DropdownMenuItem>

                      {!getProximaEtapa(candidatura.etapaId) && !candidatura.rejeitado && (
                        <DropdownMenuItem
                          onSelect={() => handleSelecionar(candidatura)}
                          disabled={atualizandoId === candidatura.id || etapaFechada(candidatura.etapaId)}
                          className="text-amber-700 focus:text-amber-700"
                        >
                          <Award size={14} aria-hidden="true" />
                          {candidatura.selecionado ? "Desfazer seleção" : "Marcar como selecionado"}
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onSelect={() => handleAbrirRejeitar(candidatura)}
                        disabled={atualizandoId === candidatura.id || candidatura.rejeitado || etapaFechada(candidatura.etapaId)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <UserX size={14} aria-hidden="true" />
                        {candidatura.rejeitado ? "Rejeitado" : "Rejeitar candidato"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    <AlertDialog open={!!rejeitarAlvo} onOpenChange={(open) => !open && setRejeitarAlvo(null)}>
      <AlertDialogContent className="font-SecondFont">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-deepGreen">
            Rejeitar {rejeitarAlvo?.candidato?.name ?? "candidato"}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja rejeitar este candidato? Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div>
          <label htmlFor="motivo-rejeicao" className="block text-sm font-medium text-gray-700 mb-2">
            Motivo (opcional)
          </label>
          <textarea
            id="motivo-rejeicao"
            value={motivoRejeicao}
            onChange={(e) => setMotivoRejeicao(e.target.value)}
            rows={4}
            placeholder={MENSAGEM_PADRAO_REJEICAO}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent transition-all duration-300 resize-none text-sm"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            Se deixar em branco, o candidato recebe a mensagem padrão acima.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <button
            type="button"
            onClick={handleConfirmarRejeicao}
            disabled={rejeitando}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {rejeitando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {rejeitando ? "Rejeitando..." : "Rejeitar candidato"}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
