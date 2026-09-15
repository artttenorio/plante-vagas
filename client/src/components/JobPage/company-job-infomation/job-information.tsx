import { Clock, Briefcase, DollarSign, CheckCircle2, ListChecks, Send, ArrowRight, Loader2 } from "lucide-react";
import { timeAgo } from "@/utils/timeAgo";
import type { Vaga } from "@/services/vaga";

type JobInformationProps = {
  vaga: Vaga;
  onCandidatar: () => void;
  candidatando: boolean;
  candidatado: boolean;
  /** false quando é uma empresa logada olhando a vaga. */
  mostrarCandidatar: boolean;
};

const JobInformation = ({ vaga, onCandidatar, candidatando, candidatado, mostrarCandidatar }: JobInformationProps) => {
  const jobDetails = [
    { icon: Clock, label: `Postada há ${timeAgo(vaga.createdAt)}`, color: "text-blue-600 bg-blue-50" },
    { icon: Briefcase, label: vaga.cargo, color: "text-purple-600 bg-purple-50" },
    { icon: DollarSign, label: vaga.salario ? `R$ ${vaga.salario.toLocaleString("pt-BR")}` : "A combinar", color: "text-emerald-600 bg-emerald-50" },
  ];

  const jobDescription = vaga.descricao
    .split("\n")
    .filter((paragraph) => paragraph.trim() !== "");

  return (
    <div className="space-y-8">
      {/* Job Details Grid */}
      <section>
        <h3 className="text-lg font-bold text-deepGreen font-PrimaryFont mb-4">
          Informações da Vaga
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {jobDetails.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col items-center text-center p-4 rounded-xl ${item.color}
                        transition-transform duration-300 hover:scale-105`}
            >
              <item.icon size={24} className="mb-2" />
              <span className="text-sm font-SecondFont font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Description */}
      <section>
        <h3 className="text-lg font-bold text-deepGreen font-PrimaryFont mb-4">
          Descrição da Vaga
        </h3>
        <div className="bg-gray-50 rounded-xl p-6">
          {jobDescription.map((paragraph, index) => (
            <p
              key={index}
              className="font-SecondFont text-gray-700 leading-relaxed mb-4 last:mb-0"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* Requisitos e Qualificações */}
      {vaga.requisitos.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-deepGreen font-PrimaryFont mb-4">
            Requisitos e Qualificações
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vaga.requisitos.map((requisito) => (
              <div
                key={requisito.id}
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl
                         hover:bg-blue-100 transition-colors duration-300"
              >
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <ListChecks size={14} className="text-white" />
                </div>
                <span className="font-SecondFont text-gray-700">{requisito.nome}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Benefícios */}
      {vaga.beneficios.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-deepGreen font-PrimaryFont mb-4">
            Benefícios
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vaga.beneficios.map((beneficio) => (
              <div
                key={beneficio.id}
                className="flex items-center gap-3 p-3 bg-paleGreen/30 rounded-xl
                         hover:bg-paleGreen/50 transition-colors duration-300"
              >
                <div className="w-6 h-6 bg-mediumGreen rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
                <span className="font-SecondFont text-gray-700">{beneficio.nome}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Apply Button */}
      {/* Chamada pra ação some inteira pra empresa logada — sem o botão ela
          seria só um convite vazio. */}
      {mostrarCandidatar && (
      <section className="pt-4">
        <div className="bg-gradient-to-r from-deepGreen to-mediumGreen rounded-2xl p-6 sm:p-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-white font-PrimaryFont mb-2">
            Interessado nesta vaga?
          </h3>
          <p className="text-white/80 font-SecondFont mb-6">
            Candidate-se agora e dê o próximo passo na sua carreira
          </p>
          <button
            onClick={onCandidatar}
            disabled={candidatando || candidatado}
            className="group inline-flex items-center gap-3 bg-white text-deepGreen px-8 py-4 rounded-xl
                     font-SecondFont font-bold text-lg hover:bg-paleGreen transition-all duration-300
                     hover:shadow-lg hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {candidatando ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            {candidatado ? "CANDIDATURA ENVIADA" : candidatando ? "ENVIANDO..." : "CANDIDATAR-SE"}
            {!candidatado && !candidatando && (
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            )}
          </button>
        </div>
      </section>
      )}
    </div>
  );
};

export default JobInformation;
