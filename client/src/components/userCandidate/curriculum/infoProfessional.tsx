import { PlusCircle, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCurriculum } from "../curriculumContext";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const toDateInput = (iso: string) => iso ? iso.slice(0, 10) : ""

const normalizeExperiencias = (list: any[]) =>
  list.map(({ cargo, empresa, descricao, inicioData, fimData, empregoAtual }) => ({
    cargo,
    empresa,
    descricao,
    empregoAtual: empregoAtual ?? false,
    inicioData: toDateInput(inicioData),
    fimData: toDateInput(fimData ?? ""),
  }))

const EMPTY_EXP = { cargo: "", empresa: "", descricao: "", inicioData: "", fimData: "", empregoAtual: false }

const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent transition-all duration-200";
const labelClass = "text-sm font-medium text-gray-700 mb-1.5 block";

export default function ProfessionalInfo() {
  const { curriculum, saveSection } = useCurriculum()
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null)
  const [experiencias, setExperiencias] = useState(
    curriculum.experiencias.length > 0 ? normalizeExperiencias(curriculum.experiencias) : [EMPTY_EXP]
  )

  const handleChange = (index: number, field: string, value: any) => {
    const newList = [...experiencias]
    newList[index] = { ...newList[index], [field]: value }
    setExperiencias(newList)
  }

  const formatExperiencias = (list: typeof experiencias) =>
    list.map(({ cargo, empresa, descricao, inicioData, fimData, empregoAtual }) => ({
      cargo,
      empresa,
      descricao,
      empregoAtual,
      inicioData: new Date(inicioData).toISOString(),
      fimData: fimData ? new Date(fimData).toISOString() : undefined,
    }))

  const handleSave = async () => {
    const loadingToast = toast.loading("Salvando experiência...")
    try {
      await saveSection("experiencias", formatExperiencias(experiencias))
      toast.success("Experiência salva com sucesso!", { id: loadingToast })
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar experiência.", { id: loadingToast })
    }
  }

  const handleDelete = async (index: number) => {
    const loadingToast = toast.loading("Excluindo experiência...")
    try {
      const deletedList = experiencias.filter((_, i) => i !== index)
      setExperiencias(deletedList)
      await saveSection("experiencias", formatExperiencias(deletedList))
      toast.success("Experiência excluída com sucesso!", { id: loadingToast })
    } catch {
      toast.error("Erro ao excluir experiência.", { id: loadingToast })
    }
  }

  useEffect(() => {
    setExperiencias(curriculum.experiencias.length > 0 ? normalizeExperiencias(curriculum.experiencias) : [EMPTY_EXP])
  }, [curriculum.experiencias])

  return (
    <>
      <ConfirmDialog
        open={confirmIndex !== null}
        onOpenChange={(open) => { if (!open) setConfirmIndex(null) }}
        title="Excluir experiência"
        description="Tem certeza que deseja excluir esta experiência? Esta ação não pode ser desfeita."
        onConfirm={() => { if (confirmIndex !== null) { handleDelete(confirmIndex); setConfirmIndex(null) } }}
      />
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 font-SecondFont">
          <h1 className="text-2xl font-bold text-deepGreen font-PrimaryFont mb-6">
            Experiência profissional
          </h1>

          <button
            className="inline-flex items-center gap-2 border border-deepGreen text-deepGreen px-4 py-2.5 rounded-xl font-medium hover:bg-deepGreen hover:text-white transition-colors duration-200 mb-6"
            onClick={() => setExperiencias([...experiencias, { cargo: "", empresa: "", descricao: "", inicioData: "", fimData: "", empregoAtual: false }])}
          >
            <PlusCircle size={18} aria-hidden="true" />
            Adicionar experiência profissional
          </button>

          {experiencias.map((experiencia, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="cargo" className={labelClass}>Cargo</label>
                  <input
                    type="text"
                    id="cargo"
                    className={inputClass}
                    value={experiencia.cargo}
                    onChange={(e) => handleChange(index, "cargo", e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="empresa" className={labelClass}>Empresa</label>
                  <input
                    type="text"
                    id="empresa"
                    className={inputClass}
                    value={experiencia.empresa}
                    onChange={(e) => handleChange(index, "empresa", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="empregoAtual"
                  checked={experiencia.empregoAtual}
                  onChange={(e) => handleChange(index, "empregoAtual", e.target.checked)}
                  className="w-4 h-4 accent-mediumGreen rounded"
                />
                <label htmlFor="empregoAtual" className="text-sm text-gray-700">Emprego atual</label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="inicio" className={labelClass}>Início</label>
                  <input
                    type="date"
                    id="inicioData"
                    className={inputClass}
                    value={experiencia.inicioData}
                    onChange={(e) => handleChange(index, "inicioData", e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="fim" className={labelClass}>Fim</label>
                  <input
                    type="date"
                    id="fimData"
                    disabled={experiencia.empregoAtual}
                    className={`${inputClass} ${experiencia.empregoAtual ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
                    value={experiencia.fimData}
                    onChange={(e) => handleChange(index, "fimData", e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="descricao" className={labelClass}>Descrição da função e atividades</label>
                <textarea
                  id="descricao"
                  rows={3}
                  className={`${inputClass} resize-none`}
                  value={experiencia.descricao}
                  onChange={(e) => handleChange(index, "descricao", e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  className="flex items-center gap-2 px-5 py-2.5 bg-deepGreen text-white rounded-xl hover:bg-mediumGreen transition-colors duration-200"
                  onClick={() => handleSave()}
                >
                  <Save size={18} aria-hidden="true" />
                  Salvar
                </button>
                <button
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200"
                  onClick={() => setConfirmIndex(index)}
                >
                  <Trash2 size={18} aria-hidden="true" />
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
