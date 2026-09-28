import { useState } from "react";
import { Briefcase, DollarSign, Tag, Clock, ArrowRight, Building2, Copy, Ban, RotateCcw, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Vaga, finalizarVaga, reabrirVaga, duplicarVaga } from "@/services/vaga";
import { timeAgo } from "@/utils/timeAgo";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const VagaVagas = ({ vaga }: { vaga: Vaga }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(vaga.status);
  const [alterandoStatus, setAlterandoStatus] = useState(false);
  const [duplicando, setDuplicando] = useState(false);
  const [confirmFinalizar, setConfirmFinalizar] = useState(false);

  const executarFinalizarOuReabrir = async () => {
    setAlterandoStatus(true);
    try {
      const atualizada = status === "aberta" ? await finalizarVaga(vaga.id) : await reabrirVaga(vaga.id);
      setStatus(atualizada.status);
      if (atualizada.status === "aberta") {
        toast.success("Vaga reaberta");
      } else {
        const n = atualizada.candidatosRejeitados ?? 0;
        toast.success(
          n > 0
            ? `Vaga finalizada. ${n} candidato${n > 1 ? "s" : ""} não escolhido${n > 1 ? "s" : ""} ${n > 1 ? "foram" : "foi"} rejeitado${n > 1 ? "s" : ""} automaticamente.`
            : "Vaga finalizada."
        );
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao alterar status da vaga");
    } finally {
      setAlterandoStatus(false);
      setConfirmFinalizar(false);
    }
  };

  const handleAlternarStatus = () => {
    // Finalizar sempre confirma antes — fechar a vaga rejeita de verdade
    // todo mundo que não foi escolhido (ver vaga.service.ts.finalizar), e
    // reabrir depois não desfaz isso. Reabrir sozinho não precisa avisar
    // de nada.
    if (status === "aberta") {
      setConfirmFinalizar(true);
      return;
    }
    executarFinalizarOuReabrir();
  };

  const handleDuplicar = async () => {
    setDuplicando(true);
    try {
      const nova = await duplicarVaga(vaga.id);
      toast.success("Vaga duplicada com sucesso");
      navigate(`/gerenciar-processo?vagaId=${nova.id}`);
    } catch (e: any) {
      toast.error(e.message || "Erro ao duplicar vaga");
      setDuplicando(false);
    }
  };

  return (
    <>
    <div
      className={`group p-6 md:p-8 rounded-2xl shadow-md hover:shadow-xl
               border transition-all duration-300 flex flex-col md:flex-row gap-6 max-w-4xl mx-auto ${
                 status === "aberta"
                   ? "bg-white border-gray-100 hover:border-mediumGreen/30"
                   : "bg-red-50/60 border-red-100 hover:border-red-200"
               }`}
    >
      {/* Company Logo */}
      <div className="flex-shrink-0 flex justify-center md:justify-start">
        <div className="w-24 h-24 md:w-28 md:h-28 bg-gray-50 rounded-2xl flex items-center justify-center
                      border border-gray-100 group-hover:border-mediumGreen/30 transition-colors duration-300 overflow-hidden">
          {vaga.empresa?.logoUrl ? (
            <img src={vaga.empresa.logoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <Building2 size={40} className="text-gray-300" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 text-center md:text-left">
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-deepGreen font-PrimaryFont group-hover:text-mediumGreen transition-colors duration-300 break-words">
            {vaga.nome}
          </h2>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-3 text-gray-600 font-SecondFont text-sm">
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-mediumGreen" />
              Postada há {timeAgo(vaga.createdAt)}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                status === "aberta" ? "bg-paleGreen/50 text-deepGreen" : "bg-gray-100 text-gray-500"
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 bg-paleGreen text-deepGreen px-3 py-1.5 rounded-full text-xs font-SecondFont font-medium">
            <Briefcase size={14} />
            {vaga.cargo}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-SecondFont font-medium">
            <DollarSign size={14} />
            {vaga.salario ? `R$ ${vaga.salario.toLocaleString("pt-BR")}` : "A combinar"}
          </span>
          {vaga.beneficios.map((b) => (
            <span
              key={b.id}
              className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-SecondFont font-medium"
            >
              <Tag size={14} />
              {b.nome}
            </span>
          ))}
        </div>

        <p className="text-gray-600 text-sm font-SecondFont leading-relaxed line-clamp-2 break-words">
          {vaga.descricao}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-stretch justify-center gap-3 w-full md:w-56 flex-shrink-0">
        <button
          onClick={() => navigate(`/gerenciar-processo?vagaId=${vaga.id}`)}
          className="flex items-center justify-center gap-2 bg-deepGreen text-white px-6 py-3 rounded-xl font-SecondFont font-semibold hover:bg-mediumGreen transition-colors duration-200"
        >
          Gerenciar processo
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <button
          onClick={() => navigate(`/criar-vaga?vagaId=${vaga.id}`)}
          className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-SecondFont font-medium hover:border-deepGreen hover:text-deepGreen transition-colors duration-200"
        >
          Editar vaga
        </button>
        <button
          onClick={handleDuplicar}
          disabled={duplicando}
          className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-SecondFont font-medium hover:border-deepGreen hover:text-deepGreen transition-colors duration-200 disabled:opacity-60"
        >
          {duplicando ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {duplicando ? "Duplicando..." : "Duplicar vaga"}
        </button>
        <button
          onClick={handleAlternarStatus}
          disabled={alterandoStatus}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-SecondFont font-medium border transition-colors duration-200 disabled:opacity-60 ${
            status === "aberta"
              ? "border-amber-200 text-amber-700 hover:bg-amber-50"
              : "border-gray-200 text-gray-700 hover:border-deepGreen hover:text-deepGreen"
          }`}
        >
          {alterandoStatus ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : status === "aberta" ? (
            <Ban size={16} aria-hidden="true" />
          ) : (
            <RotateCcw size={16} aria-hidden="true" />
          )}
          {alterandoStatus ? "Aguarde..." : status === "aberta" ? "Finalizar vaga" : "Reabrir vaga"}
        </button>
      </div>
    </div>

    <ConfirmDialog
      open={confirmFinalizar}
      onOpenChange={setConfirmFinalizar}
      title="Finalizar esta vaga?"
      description={
        vaga.temCandidatoEscolhido
          ? `O candidato escolhido continua no processo, mas todo mundo que se candidatou a "${vaga.nome}" e não foi escolhido será rejeitado automaticamente (notificado por WhatsApp). Se reabrir a vaga depois, vai precisar de candidaturas novas — quem foi rejeitado aqui não volta a fazer parte do processo. Deseja continuar?`
          : `Nenhum candidato foi marcado como escolhido em "${vaga.nome}" ainda. Ao fechar mesmo assim, TODOS os candidatos que se candidataram serão rejeitados automaticamente (notificados por WhatsApp), e reabrir a vaga depois vai exigir candidaturas novas — ninguém volta a fazer parte do processo. Deseja continuar?`
      }
      onConfirm={executarFinalizarOuReabrir}
      confirmLabel={alterandoStatus ? "Finalizando..." : "Finalizar vaga"}
      confirmClassName="bg-amber-600 hover:bg-amber-700 text-white"
    />
    </>
  );
};

export default VagaVagas;
