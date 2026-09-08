import Etapa from "./etapa";
import { EtapaProcessoSeletivo } from "@/services/vaga";

type Props = {
  etapas: EtapaProcessoSeletivo[];
  vagaId: number;
  movendoId: number | null;
  onExcluir: (id: number) => void;
  onAtualizar: (etapa: EtapaProcessoSeletivo) => void;
  onMover: (etapaId: number, direcao: "cima" | "baixo") => void;
};

export default function EtapasDisplay({ etapas, vagaId, movendoId, onExcluir, onAtualizar, onMover }: Props) {
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
          movendo={movendoId === etapa.id}
          onExcluir={onExcluir}
          onAtualizar={onAtualizar}
          onMover={onMover}
        />
      ))}
    </div>
  );
}
