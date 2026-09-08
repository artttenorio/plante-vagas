import type { EtapaProcessoSeletivo } from "@/services/vaga";

type Props = {
  etapas: EtapaProcessoSeletivo[];
};

export default function EtapasTimeline({ etapas }: Props) {
  if (etapas.length === 0) return null;

  const irParaEtapa = (id: number) => {
    document.getElementById(`etapa-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="bg-paleGreen/25 rounded-2xl border border-paleGreen p-6 sm:p-8 mb-8 font-SecondFont overflow-x-auto">
      <div className="flex items-center min-w-max sm:min-w-0">
        {etapas.map((etapa, index) => (
          <div key={etapa.id} className={`flex items-center ${index < etapas.length - 1 ? "flex-1" : ""}`}>
            <button
              type="button"
              onClick={() => irParaEtapa(etapa.id)}
              className="flex items-center gap-2.5 px-1 group flex-shrink-0"
            >
              <span
                className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full font-SecondFont font-semibold transition-colors duration-300 flex-shrink-0 ${
                  etapa.status === "aberta"
                    ? "bg-deepGreen text-white"
                    : "bg-paleGreen/50 text-deepGreen border-2 border-deepGreen"
                }`}
              >
                {index + 1}
              </span>
              <span className="text-[11px] sm:text-xs font-SecondFont font-medium text-left leading-tight max-w-[100px] text-gray-700 group-hover:text-deepGreen transition-colors duration-300 break-words">
                {etapa.nome}
              </span>
            </button>

            {index < etapas.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 bg-paleGreen min-w-[24px]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
