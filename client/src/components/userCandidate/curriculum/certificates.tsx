import { PlusCircle, SaveAll, Trash2 } from "lucide-react";
import { useCurriculum } from "../curriculumContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const EMPTY_CERTIFICATE = { nomeInstituicao: "", descricao: "", certificate_name: "" }

const normalizeCertificates = (list: any[]) =>
  list.map(({ nomeInstituicao, descricao, certificate_name }) => ({ nomeInstituicao, descricao, certificate_name }));

const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent transition-all duration-200";
const labelClass = "text-sm font-medium text-gray-700 mb-1.5 block";

export default function Certificate() {
  const { curriculum, saveSection } = useCurriculum()

  const [certificates, setCertificates] = useState(curriculum.certificados.length > 0 ? normalizeCertificates(curriculum.certificados) : [EMPTY_CERTIFICATE])
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null)

  useEffect(() => {
    setCertificates(curriculum.certificados.length > 0 ? normalizeCertificates(curriculum.certificados) : [EMPTY_CERTIFICATE])
  }, [curriculum.certificados])

  const handleChange = async (index: number, field: string, value: string) => {
    const newList = [...certificates]
    newList[index] = { ...certificates[index], [field]: value }
    setCertificates(newList)
  }

  const handleSave = async () => {
    const loadingToast = toast.loading("Salvando certificado...")
    try {
      await saveSection("certificados", normalizeCertificates(certificates))
      toast.success("Certificado salvo com sucesso", { id: loadingToast })
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar certificado", { id: loadingToast })
    }
  }

  const handleDelete = async (index: number) => {
    const loadingToast = toast.loading("Excluindo certificado...")
    try {
      const deletedList = certificates.filter((_, i) => i !== index)
      setCertificates(deletedList)
      await saveSection("certificados", normalizeCertificates(deletedList))
      toast.success("Certificado excluído com sucesso!", { id: loadingToast })
    } catch {
      toast.error("Erro ao excluir certificado.", { id: loadingToast })
    }
  }

  return (
    <>
      <ConfirmDialog
        open={confirmIndex !== null}
        onOpenChange={(open) => { if (!open) setConfirmIndex(null) }}
        title="Excluir certificado"
        description="Tem certeza que deseja excluir este certificado? Esta ação não pode ser desfeita."
        onConfirm={() => { if (confirmIndex !== null) { handleDelete(confirmIndex); setConfirmIndex(null) } }}
      />
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 font-SecondFont">
          <h1 className="text-2xl font-bold text-deepGreen font-PrimaryFont mb-6">
            Certificados
          </h1>

          <button
            className="inline-flex items-center gap-2 border border-deepGreen text-deepGreen px-4 py-2.5 rounded-xl font-medium hover:bg-deepGreen hover:text-white transition-colors duration-200 mb-6"
            onClick={() => setCertificates([...certificates, { nomeInstituicao: "", descricao: "", certificate_name: "" }])}
          >
            <PlusCircle size={18} aria-hidden="true" />
            Adicionar certificado
          </button>

          {certificates.map((certificate, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="certificado" className={labelClass}>Certificado</label>
                  <input
                    type="text"
                    id="certificado"
                    className={inputClass}
                    value={certificate.certificate_name}
                    onChange={(e) => handleChange(index, "certificate_name", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="instituicao" className={labelClass}>Nome da instituição</label>
                  <input
                    type="text"
                    id="instituicao"
                    className={inputClass}
                    value={certificate.nomeInstituicao}
                    onChange={(e) => handleChange(index, "nomeInstituicao", e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="descricao" className={labelClass}>Descrição</label>
                <textarea
                  id="descricao"
                  rows={4}
                  className={`${inputClass} resize-none`}
                  value={certificate.descricao}
                  onChange={(e) => handleChange(index, "descricao", e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
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
