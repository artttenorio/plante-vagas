import { PlusCircle, SaveAll, Trash2 } from "lucide-react";
import { useCurriculum } from "../curriculumContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const EMPTY_LENGUAGE = { idioma: "", nivel: "" }

const normalizeIdiomas = (list: any[]) =>
  list.map(({ idioma, nivel }) => ({ idioma, nivel }))

const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent transition-all duration-200";
const labelClass = "text-sm font-medium text-gray-700 mb-1.5 block";

export default function Language() {
  const { curriculum, saveSection } = useCurriculum()
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null)
  const [lenguages, setLenguages] = useState(
    curriculum.idiomas.length > 0 ? normalizeIdiomas(curriculum.idiomas) : [EMPTY_LENGUAGE]
  )

  useEffect(() => {
    setLenguages(curriculum.idiomas.length > 0 ? normalizeIdiomas(curriculum.idiomas) : [EMPTY_LENGUAGE])
  }, [curriculum.idiomas])

  const handleChange = async (index: number, field: string, value: string) => {
    const newList = [...lenguages]
    newList[index] = { ...lenguages[index], [field]: value }
    setLenguages(newList)
  }

  const handleSave = async () => {
    const loadingToast = toast.loading("Salvando idioma...")
    try {
      await saveSection("idiomas", normalizeIdiomas(lenguages))
      toast.success("Idioma salvo com sucesso", { id: loadingToast })
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar idioma", { id: loadingToast })
    }
  }

  const handleDelete = async (index: number) => {
    const loadingToast = toast.loading("Excluindo idioma...")
    try {
      const deletedList = lenguages.filter((_, i) => i !== index)
      setLenguages(deletedList)
      await saveSection("idiomas", normalizeIdiomas(deletedList))
      toast.success("Idioma excluído com sucesso!", { id: loadingToast })
    } catch {
      toast.error("Erro ao excluir idioma.", { id: loadingToast })
    }
  }

  return (
    <>
      <ConfirmDialog
        open={confirmIndex !== null}
        onOpenChange={(open) => { if (!open) setConfirmIndex(null) }}
        title="Excluir idioma"
        description="Tem certeza que deseja excluir este idioma? Esta ação não pode ser desfeita."
        onConfirm={() => { if (confirmIndex !== null) { handleDelete(confirmIndex); setConfirmIndex(null) } }}
      />
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 font-SecondFont">
          <h1 className="text-2xl font-bold text-deepGreen font-PrimaryFont mb-6">
            Idiomas
          </h1>

          <button
            className="inline-flex items-center gap-2 border border-deepGreen text-deepGreen px-4 py-2.5 rounded-xl font-medium hover:bg-deepGreen hover:text-white transition-colors duration-200 mb-6"
            onClick={() => setLenguages([...lenguages, { idioma: "", nivel: "" }])}
          >
            <PlusCircle size={18} aria-hidden="true" />
            Adicionar idioma
          </button>

          {lenguages.map((lenguage, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Idioma</label>
                  <select
                    className={inputClass}
                    value={lenguage.idioma}
                    onChange={(e) => handleChange(index, "idioma", e.target.value)}
                  >
                    <option value=""></option>
                    <option value="portugues">Português</option>
                    <option value="ingles">Inglês</option>
                    <option value="espanhol">Espanhol</option>
                    <option value="frances">Francês</option>
                    <option value="alemao">Alemão</option>
                    <option value="italiano">Italiano</option>
                    <option value="mandarim">Mandarim</option>
                    <option value="japones">Japonês</option>
                    <option value="coreano">Coreano</option>
                    <option value="arabe">Árabe</option>
                    <option value="russo">Russo</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Nível</label>
                  <select
                    className={inputClass}
                    value={lenguage.nivel}
                    onChange={(e) => handleChange(index, "nivel", e.target.value)}
                  >
                    <option value=""></option>
                    <option value="basico">Básico</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="avancado">Avançado</option>
                    <option value="fluente">Fluente / Proficiência</option>
                    <option value="nativo">Nativo</option>
                  </select>
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
