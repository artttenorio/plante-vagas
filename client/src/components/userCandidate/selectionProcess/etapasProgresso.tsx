import { Check, X } from "lucide-react";
import type { EtapaProcessoSeletivo } from "@/services/vaga";

type Props = {
  etapas: EtapaProcessoSeletivo[];
  etapaAtualId: number;
  rejeitado: boolean;
};

/**
 * RF017 — o candidato vê todas as etapas do processo seletivo na ordem e
 * em qual delas ele está. Mesma linguagem visual da timeline que a empresa
 * já vê em "Gerenciar processo seletivo" (managementProcess/etapasTimeline),
 * mas somente leitura e com o estado da candidatura marcado.
 */
export default function EtapasProgresso({ etapas, etapaAtualId, rejeitado }: Props) {
  const indiceAtual = etapas.findIndex((e) => e.id === etapaAtualId);
  if (etapas.length === 0 || indiceAtual === -1) return null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 overflow-x-auto">
      <span className="text-gray-400 text-xs uppercase tracking-wide">
        Etapas do processo
      </span>

      <ol className="flex items-center min-w-max sm:min-w-0 mt-3">
        {etapas.map((etapa, index) => {
          const concluida = index < indiceAtual;
          const atual = index === indiceAtual;

          const circulo = rejeitado && atual
            ? "bg-red-500 text-white"
            : atual
              ? "bg-deepGreen text-white ring-4 ring-paleGreen/60"
              : concluida
                ? "bg-mediumGreen text-white"
                : "bg-gray-100 text-gray-400 border border-gray-200";

          const rotulo = atual
            ? "text-deepGreen font-semibold"
            : concluida
              ? "text-gray-600"
              : "text-gray-400";

          return (
            <li
              key={etapa.id}
              className={`flex items-center ${index < etapas.length - 1 ? "flex-1" : ""}`}
            >
              <div className="flex items-center gap-2 px-1 flex-shrink-0">
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold flex-shrink-0 ${circulo}`}
                  aria-hidden="true"
                >
                  {rejeitado && atual ? (
                    <X size={14} />
                  ) : concluida ? (
                    <Check size={14} />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={`text-[11px] leading-tight text-left max-w-[100px] break-words ${rotulo}`}
                >
                  {etapa.nome}
                  {atual && (
                    <span className="sr-only">
                      {rejeitado ? " — etapa em que você não avançou" : " — sua etapa atual"}
                    </span>
                  )}
                </span>
              </div>

              {index < etapas.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 min-w-[24px] ${
                    concluida ? "bg-mediumGreen" : "bg-gray-200"
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
