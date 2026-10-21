import { PlusCircle, SaveAll, Trash2 } from "lucide-react";
import { useCurriculum } from "../curriculumContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const toDateInput = (iso: string) => iso ? iso.slice(0, 10) : ""

const normalizeFormacoes = (list: any[]) =>
  list.map(({ nivelFormacao, grauFormacao, curso, nomeInstituicao, status, inicioData, fimData }) => ({
    nivelFormacao,
    grauFormacao,
    curso,
    nomeInstituicao,
    status,
    inicioData: toDateInput(inicioData),
    fimData: toDateInput(fimData ?? ""),
  }))

const EMPTY_FORMACAO = { nivelFormacao: "", grauFormacao: "", curso: "", nomeInstituicao: "", status: "", inicioData: "", fimData: "" }

const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent transition-all duration-200";
const labelClass = "text-sm font-medium text-gray-700 mb-1.5 block";

export default function AcademicInfo() {
  const { curriculum, saveSection } = useCurriculum()
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null)
  const [infoAcademics, setInfoacademics] = useState(
    curriculum.formacoes.length > 0 ? normalizeFormacoes(curriculum.formacoes) : [EMPTY_FORMACAO]
  )

  useEffect(() => {
    setInfoacademics(curriculum.formacoes.length > 0 ? normalizeFormacoes(curriculum.formacoes) : [EMPTY_FORMACAO])
  }, [curriculum.formacoes])

  const handleChange = (index: number, field: string, value: any) => {
    const newList = [...infoAcademics]
    newList[index] = { ...newList[index], [field]: value }
    setInfoacademics(newList)
  }

  const formatFormacoes = (list: typeof infoAcademics) =>
    list.map(({ nivelFormacao, grauFormacao, curso, nomeInstituicao, status, inicioData, fimData }) => ({
      nivelFormacao,
      grauFormacao,
      curso,
      nomeInstituicao,
      status,
      inicioData: new Date(inicioData).toISOString(),
      fimData: fimData ? new Date(fimData).toISOString() : undefined,
    }))

  const handleSave = async () => {
    const loadingToast = toast.loading("Salvando informação acadêmica...")
    try {
      await saveSection("formacoes", formatFormacoes(infoAcademics))
      toast.success("Informações acadêmicas salvas com sucesso", { id: loadingToast })
    } catch (e: any) {
      toast.error(e.message || "Falha ao salvar formação acadêmica", { id: loadingToast })
    }
  }

  const handleDelete = async (index: number) => {
    const loadingToast = toast.loading("Excluindo formação...")
    try {
      const deletedList = infoAcademics.filter((_, i) => i !== index)
      setInfoacademics(deletedList)
      await saveSection("formacoes", formatFormacoes(deletedList))
      toast.success("Formação acadêmica excluída com sucesso!", { id: loadingToast })
    } catch {
      toast.error("Erro ao excluir formação.", { id: loadingToast })
    }
  }

  return (
    <>
      <ConfirmDialog
        open={confirmIndex !== null}
        onOpenChange={(open) => { if (!open) setConfirmIndex(null) }}
        title="Excluir formação"
        description="Tem certeza que deseja excluir esta formação acadêmica? Esta ação não pode ser desfeita."
        onConfirm={() => { if (confirmIndex !== null) { handleDelete(confirmIndex); setConfirmIndex(null) } }}
      />
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 font-SecondFont">
          <h1 className="text-2xl font-bold text-deepGreen font-PrimaryFont mb-6">
            Formação acadêmica
          </h1>

          <button
            className="inline-flex items-center gap-2 border border-deepGreen text-deepGreen px-4 py-2.5 rounded-xl font-medium hover:bg-deepGreen hover:text-white transition-colors duration-200 mb-6"
            onClick={() => setInfoacademics([...infoAcademics, { nivelFormacao: "", grauFormacao: "", curso: "", nomeInstituicao: "", status: "", inicioData: "", fimData: "" }])}
          >
            <PlusCircle size={18} aria-hidden="true" />
            Adicionar formação acadêmica
          </button>

          {infoAcademics.map((infoAcademic, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="education-level" className={labelClass}>Nível de formação</label>
                  <select
                    id="education-level"
                    className={inputClass}
                    value={infoAcademic.nivelFormacao}
                    onChange={(e) => handleChange(index, "nivelFormacao", e.target.value)}
                  >
                    <option value="fundamental_incompleto">Ensino Fundamental Incompleto</option>
                    <option value="fundamental_completo">Ensino Fundamental Completo</option>
                    <option value="medio_incompleto">Ensino Médio Incompleto</option>
                    <option value="medio_completo">Ensino Médio Completo</option>
                    <option value="tecnico_incompleto">Curso Técnico Incompleto</option>
                    <option value="tecnico_completo">Curso Técnico Completo</option>
                    <option value="superior_incompleto">Ensino Superior Incompleto</option>
                    <option value="superior_completo">Ensino Superior Completo</option>
                    <option value="pos_graduacao">Pós-graduação (Especialização)</option>
                    <option value="mestrado">Mestrado</option>
                    <option value="doutorado">Doutorado</option>
                    <option value="pos_doutorado">Pós-doutorado</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="degree-type" className={labelClass}>Grau de formação</label>
                  <select
                    id="degree-type"
                    className={inputClass}
                    value={infoAcademic.grauFormacao}
                    onChange={(e) => handleChange(index, "grauFormacao", e.target.value)}
                  >
                    <option value=""></option>
                    <option value="tecnologo">Tecnólogo</option>
                    <option value="licenciatura">Licenciatura</option>
                    <option value="bacharelado">Bacharelado</option>
                    <option value="especializacao">Pós-graduação (Especialização / MBA)</option>
                    <option value="mestrado">Mestrado</option>
                    <option value="doutorado">Doutorado</option>
                    <option value="pos_doutorado">Pós-doutorado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 mb-4">
                <div>
                  <label htmlFor="status" className={labelClass}>Status</label>
                  <select
                    id="status"
                    className={inputClass}
                    value={infoAcademic.status}
                    onChange={(e) => handleChange(index, "status", e.target.value)}
                  >
                    <option value=""></option>
                    <option value="concluido">Concluído</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="trancado">Trancado</option>
                    <option value="interrompido">Interrompido</option>
                    <option value="nao_iniciado">Não iniciado</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="course" className={labelClass}>Curso</label>
                  <input
                    type="text"
                    id="course"
                    className={inputClass}
                    value={infoAcademic.curso}
                    onChange={(e) => handleChange(index, "curso", e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="institution" className={labelClass}>Nome da instituição</label>
                <input
                  type="text"
                  id="institution"
                  className={inputClass}
                  value={infoAcademic.nomeInstituicao}
                  onChange={(e) => handleChange(index, "nomeInstituicao", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="start-date" className={labelClass}>Início</label>
                  <input
                    type="date"
                    id="start-date"
                    className={inputClass}
                    value={infoAcademic.inicioData}
                    onChange={(e) => handleChange(index, "inicioData", e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="end-date" className={labelClass}>Fim</label>
                  <input
                    type="date"
                    id="end-date"
                    className={inputClass}
                    value={infoAcademic.fimData}
                    onChange={(e) => handleChange(index, "fimData", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  className="flex items-center gap-2 px-5 py-2.5 bg-deepGreen text-white rounded-xl hover:bg-mediumGreen transition-colors duration-200"
                  onClick={() => handleSave()}
                >
                  <SaveAll size={18} aria-hidden="true" />
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
