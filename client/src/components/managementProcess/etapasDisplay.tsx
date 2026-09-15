import Etapa from "./etapa";
import { EtapaProcessoSeletivo } from "@/services/vaga";
import type { ContagemEtapa } from "@/services/candidatura";

type Props = {
  etapas: EtapaProcessoSeletivo[];
  vagaId: number;
  contagens: ContagemEtapa[];
  movendoId: number | null;
  onExcluir: (id: number) => void;
  onAtualizar: (etapa: EtapaProcessoSeletivo) => void;
  onMover: (etapaId: number, direcao: "cima" | "baixo") => void;
};

export default function EtapasDisplay({ etapas, vagaId, contagens, movendoId, onExcluir, onAtualizar, onMover }: Props) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-[95%] mx-auto">
      {etapas.map((etapa, index) => (
        <Etapa
          key={etapa.id}
          etapa={etapa}
          vagaId={vagaId}
          index={index + 1}
          totalEtapas={etapas.length}
          podeExcluir={etapas.length > 1}
          contagem={contagens.find((c) => c.etapaId === etapa.id)}
          movendo={movendoId === etapa.id}
          onExcluir={onExcluir}
          onAtualizar={onAtualizar}
          onMover={onMover}
        />
      ))}
    </div>
  );
}
