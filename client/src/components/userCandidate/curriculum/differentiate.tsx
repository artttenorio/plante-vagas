import { Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCurriculum } from "../curriculumContext";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const adjetivos = [
  // Positivos
  "Comunicativo",
  "Proativo",
  "Organizado",
  "Pontual",
  "Responsável",
  "Criativo",
  "Dedicado",
  "Colaborativo",
  "Empático",
  "Focado",
  "Resiliente",
  "Inovador",
  "Comprometido",
  "Motivado",
  "Líder",
  "Versátil",
  "Curioso",
  "Analítico",
  "Paciente",
  "Adaptável",

  // Negativos ou pontos de atenção
  "Ansioso",
  "Perfeccionista",
  "Teimoso",
  "Impulsivo",
  "Distraído",
  "Crítico demais",
  "Introvertido",
  "Lento para decisões",
  "Dependente de validação",
  "Evita conflitos",

  // Neutros/contextuais
  "Cauteloso",
  "Observador",
  "Sincero",
  "Reservado",
  "Pragmático",
];

export default function Differentiate() {
  const { curriculum, saveSection } = useCurriculum();

  const [confirmGroup, setConfirmGroup] = useState<1 | 2 | null>(null);
  const [selecionados_1, setSelecionados_1] = useState<string[]>([]);
  const [selecionados_2, setSelecionados_2] = useState<string[]>([]);

  useEffect(() => {
    setSelecionados_1(
      curriculum.diferenciais.filter((d: any) => (d.grupo ?? 1) === 1).map((d: any) => d.descricao)
    );
    setSelecionados_2(
      curriculum.diferenciais.filter((d: any) => d.grupo === 2).map((d: any) => d.descricao)
    );
  }, [curriculum.diferenciais]);

  const toggleSelecionado = (adj: string) => {
    setSelecionados_1((prev) =>
      prev.includes(adj) ? prev.filter((a) => a !== adj) : [...prev, adj]
    );
  };

  const toggleSelecionado2 = (adj: string) => {
    setSelecionados_2((prev) =>
      prev.includes(adj) ? prev.filter((a) => a !== adj) : [...prev, adj]
    );
  };

  const combinarGrupos = (grupo1: string[], grupo2: string[]) => [
    ...grupo1.map((d) => ({ descricao: d, grupo: 1 })),
    ...grupo2.map((d) => ({ descricao: d, grupo: 2 })),
  ];

  const salvar = async (grupo1: string[], grupo2: string[]) => {
    const loadingToast = toast.loading("Salvando diferenciais...");
    try {
      await saveSection("diferenciais", combinarGrupos(grupo1, grupo2));
      toast.success("Diferenciais salvos com sucesso", { id: loadingToast });
    } catch {
      toast.error("Erro ao salvar diferenciais", { id: loadingToast });
    }
  };

  const handleSave1 = () => salvar(selecionados_1, selecionados_2);
  const handleSave2 = () => salvar(selecionados_1, selecionados_2);

  const handleDelete1 = async () => {
    const loadingToast = toast.loading("Excluindo...");
    try {
      setSelecionados_1([]);
      await saveSection("diferenciais", combinarGrupos([], selecionados_2));
      toast.success("Características removidas com sucesso!", { id: loadingToast });
    } catch {
      toast.error("Erro ao excluir características.", { id: loadingToast });
    }
  };

  const handleDelete2 = async () => {
    const loadingToast = toast.loading("Excluindo...");
    try {
      setSelecionados_2([]);
      await saveSection("diferenciais", combinarGrupos(selecionados_1, []));
      toast.success("Características removidas com sucesso!", { id: loadingToast });
    } catch {
      toast.error("Erro ao excluir características.", { id: loadingToast });
    }
  };

  return (
    <>
      <ConfirmDialog
        open={confirmGroup !== null}
        onOpenChange={(open) => { if (!open) setConfirmGroup(null) }}
        title="Limpar características"
        description="Tem certeza que deseja remover estas características? Esta ação não pode ser desfeita."
        onConfirm={() => {
          if (confirmGroup === 1) { handleDelete1(); }
          else if (confirmGroup === 2) { handleDelete2(); }
          setConfirmGroup(null);
        }}
      />
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 font-SecondFont">
          <h1 className="text-2xl font-bold text-deepGreen font-PrimaryFont mb-2">
            Diferenciais
          </h1>
          <p className="text-gray-600 mb-8">
            Escreva características com base na sua personalidade, para que os empregadores
            conheçam melhor o seu perfil.
          </p>

          <h2 className="text-lg font-bold text-deepGreen font-PrimaryFont mb-4">
            Quais características você tem
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
            {adjetivos.map((adj, index) => {
              const isSelected = selecionados_1.includes(adj);
              return (
                <button
                  key={index}
                  onClick={() => toggleSelecionado(adj)}
                  className={`px-3 py-2 rounded-xl border text-sm transition-colors duration-200 ${
                    isSelected
                      ? "border-mediumGreen bg-paleGreen/40 text-deepGreen font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {adj}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 mb-10">
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-deepGreen text-white rounded-xl hover:bg-mediumGreen transition-colors duration-200"
              onClick={handleSave1}
            >
              <Save size={18} aria-hidden="true" />
              Salvar
            </button>
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200"
              onClick={() => setConfirmGroup(1)}
            >
              <Trash2 size={18} aria-hidden="true" />
              Excluir
            </button>
          </div>

          <hr className="border-gray-100 mb-8" />

          <h2 className="text-lg font-bold text-deepGreen font-PrimaryFont mb-4">
            Quais características as pessoas acham que você deveria ter
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
            {adjetivos.map((adj, index) => {
              const isSelected = selecionados_2.includes(adj);
              return (
                <button
                  key={index}
                  onClick={() => toggleSelecionado2(adj)}
                  className={`px-3 py-2 rounded-xl border text-sm transition-colors duration-200 ${
                    isSelected
                      ? "border-mediumGreen bg-paleGreen/40 text-deepGreen font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {adj}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-3">
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-deepGreen text-white rounded-xl hover:bg-mediumGreen transition-colors duration-200"
              onClick={handleSave2}
            >
              <Save size={18} aria-hidden="true" />
              Salvar
            </button>
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200"
              onClick={() => setConfirmGroup(2)}
            >
              <Trash2 size={18} aria-hidden="true" />
              Excluir
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
