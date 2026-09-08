import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Loader2, Building2, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getMinhasCandidaturas, cancelarCandidatura, type Candidatura } from "@/services/candidatura";
import { timeAgo } from "@/utils/timeAgo";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

// Um processo é considerado encerrado quando o candidato foi rejeitado,
// ou quando a empresa fechou a etapa em que ele está (RF070 — "encerrar
// processo seletivo"). Os dois já vêm prontos na candidatura, sem
// precisar de nenhum dado novo do backend.
function estaEncerrado(candidatura: Candidatura) {
  return candidatura.rejeitado || candidatura.etapa?.status === "fechada";
}

export default function SelectionProcess() {
  const navigate = useNavigate();
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState<"ativos" | "encerrados">("ativos");
  const [cancelarAlvo, setCancelarAlvo] = useState<Candidatura | null>(null);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    getMinhasCandidaturas()
      .then(setCandidaturas)
      .finally(() => setLoading(false));
  }, []);

  const ativos = useMemo(() => candidaturas.filter((c) => !estaEncerrado(c)), [candidaturas]);
  const encerrados = useMemo(() => candidaturas.filter(estaEncerrado), [candidaturas]);
  const candidaturasExibidas = aba === "ativos" ? ativos : encerrados;

  const handleConfirmarCancelamento = async () => {
    if (!cancelarAlvo) return;
    setCancelando(true);
    try {
      await cancelarCandidatura(cancelarAlvo.id);
      setCandidaturas((prev) => prev.filter((c) => c.id !== cancelarAlvo.id));
      toast.success("Candidatura cancelada");
      setCancelarAlvo(null);
    } catch (e: any) {
      toast.error(e.message || "Erro ao cancelar candidatura");
    } finally {
      setCancelando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-deepGreen font-PrimaryFont mb-6">
          Processos seletivos
        </h1>

        {!loading && candidaturas.length > 0 && (
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {(
              [
                { value: "ativos", label: "Processos ativos", total: ativos.length },
                { value: "encerrados", label: "Processos encerrados", total: encerrados.length },
              ] as const
            ).map((tab) => (
              <button
                key={tab.value}
                onClick={() => setAba(tab.value)}
                className={`px-4 py-3 font-SecondFont font-medium text-sm relative transition-colors duration-200 ${
                  aba === tab.value
                    ? "text-deepGreen"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label} ({tab.total})
                {aba === tab.value && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-deepGreen" />
                )}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-SecondFont">
            <Loader2 size={32} className="animate-spin text-mediumGreen mb-3" aria-hidden="true" />
            Carregando...
          </div>
        ) : candidaturas.length === 0 ? (
          <div className="flex flex-col items-center text-center bg-white rounded-2xl border border-gray-100 py-16 px-6">
            <div className="w-16 h-16 bg-paleGreen/40 rounded-2xl flex items-center justify-center mb-4">
              <ClipboardList size={28} className="text-deepGreen" aria-hidden="true" />
            </div>
            <p className="text-gray-700 font-SecondFont font-medium mb-2">
              Você ainda não tem processos seletivos em andamento
            </p>
            <button
              onClick={() => navigate("/pesquisa-de-vagas")}
              className="mt-2 text-deepGreen font-SecondFont font-semibold hover:text-mediumGreen transition-colors duration-200 underline underline-offset-4"
            >
              Ver vagas disponíveis
            </button>
          </div>
        ) : candidaturasExibidas.length === 0 ? (
          <div className="flex flex-col items-center text-center bg-white rounded-2xl border border-gray-100 py-16 px-6">
            <div className="w-16 h-16 bg-paleGreen/40 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle2 size={28} className="text-deepGreen" aria-hidden="true" />
            </div>
            <p className="text-gray-700 font-SecondFont font-medium">
              {aba === "ativos"
                ? "Nenhum processo ativo no momento"
                : "Nenhum processo encerrado ainda"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {candidaturasExibidas.map((candidatura) => {
              const vaga = candidatura.etapa?.vaga;
              const nomeEmpresa = vaga?.empresa?.fantasyName || vaga?.empresa?.name;

              const statusLabel = candidatura.rejeitado
                ? "Não selecionado(a)"
                : candidatura.statusCandidato
                  ? "Avançou"
                  : "Em análise";
              const statusColor = candidatura.rejeitado
                ? "text-red-600"
                : candidatura.statusCandidato
                  ? "text-mediumGreen"
                  : "text-gray-500";
              const statusDot = candidatura.rejeitado
                ? "bg-red-500"
                : candidatura.statusCandidato
                  ? "bg-mediumGreen"
                  : "bg-gray-400";

              return (
                <div
                  key={candidatura.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 font-SecondFont cursor-pointer hover:border-deepGreen/40 transition-colors duration-200"
                  onClick={() => vaga && navigate(`/pagina-vaga/${vaga.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {vaga?.empresa?.logoUrl ? (
                          <img src={vaga.empresa.logoUrl} alt={nomeEmpresa ? `Logo de ${nomeEmpresa}` : "Logo da empresa"} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 size={16} className="text-gray-400" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-deepGreen font-PrimaryFont truncate">
                          {vaga?.nome ?? "Vaga"}
                        </h2>
                        {nomeEmpresa && (
                          <p className="text-gray-500 text-sm mt-0.5 truncate">{nomeEmpresa}</p>
                        )}
                      </div>
                    </div>

                    <span className={`flex items-center gap-1.5 text-xs font-medium flex-shrink-0 ${statusColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} aria-hidden="true" />
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-gray-400 text-xs uppercase tracking-wide">Etapa atual</span>
                      <p className="text-deepGreen font-semibold mt-0.5">{candidatura.etapa?.nome ?? "—"}</p>
                    </div>
                    <span className="text-gray-400 text-xs flex-shrink-0">
                      há {timeAgo(candidatura.createdAt)}
                    </span>
                  </div>

                  {candidatura.rejeitado && candidatura.motivoRejeicao && (
                    <p className="text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 text-sm mt-4">
                      {candidatura.motivoRejeicao}
                    </p>
                  )}

                  {candidatura.observacoes && (
                    <p className="text-gray-600 text-sm mt-4 break-words">{candidatura.observacoes}</p>
                  )}

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCancelarAlvo(candidatura);
                      }}
                      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-600 transition-colors duration-200"
                    >
                      <X size={14} aria-hidden="true" />
                      Cancelar candidatura
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!cancelarAlvo} onOpenChange={(open) => !open && setCancelarAlvo(null)}>
        <AlertDialogContent className="font-SecondFont">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-deepGreen">
              Cancelar candidatura?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar sua candidatura para{" "}
              {cancelarAlvo?.etapa?.vaga?.nome ?? "esta vaga"}? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <button
              type="button"
              onClick={handleConfirmarCancelamento}
              disabled={cancelando}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {cancelando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              {cancelando ? "Cancelando..." : "Cancelar candidatura"}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
