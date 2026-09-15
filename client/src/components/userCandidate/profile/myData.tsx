import { useEffect, useState } from "react";
import SubHeader from "../../home-page/headers/subHeader";
import { useUser } from "../userContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { deleteUser, updateUser, uploadUserPhoto } from "../../../services/users";
import { clearSession } from "../../../services/api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Lock, Info, UserCircle, Image as ImageIcon } from "lucide-react";

const inputBase = "w-full px-4 py-3 rounded-xl border transition-all duration-200";
const inputLocked = `${inputBase} bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200`;
const inputEditable = `${inputBase} bg-white text-gray-800 border-gray-200 focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent`;
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

function LockedLabel() {
  return (
    <span className="flex items-center gap-1 text-xs text-gray-400 ml-1">
      <Lock className="w-3 h-3" aria-hidden="true" /> Não editável
    </span>
  );
}

export default function MyData() {
  const { UserData, refreshUser } = useUser();
  const { user } = UserData;
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [formData, setFormData] = useState({ phone: "", disablePerson: "", gender: "" });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.photoUrl || null);

  useEffect(() => {
    if (!photoFile) setPhotoPreview(user.photoUrl || null);
  }, [user.photoUrl, photoFile]);

  const dateFormatted = user.dateNasc
    ? new Date(user.dateNasc).toISOString().split("T")[0]
    : "";

  const handleEdit = () => {
    setFormData({ phone: user.phone, disablePerson: user.disablePerson, gender: user.gender });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPhotoFile(null);
    setPhotoPreview(user.photoUrl || null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const loadingToast = toast.loading("Salvando dados...");
    try {
      await updateUser({
        phone: formData.phone || undefined,
        disablePerson: formData.disablePerson || undefined,
        gender: formData.gender || undefined,
      });
      if (photoFile) {
        await uploadUserPhoto(photoFile);
        setPhotoFile(null);
      }
      await refreshUser();
      setIsEditing(false);
      toast.success("Dados atualizados com sucesso", { id: loadingToast });
    } catch (error: any) {
      toast.error("Erro ao atualizar dados", { id: loadingToast, description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const loadingToast = toast.loading("Excluindo conta...");
    try {
      await deleteUser();
      clearSession();
      toast.success("Conta excluída com sucesso", { id: loadingToast });
      navigate("/login");
    } catch (error: any) {
      toast.error("Erro ao excluir conta", { id: loadingToast, description: error.message });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 font-SecondFont">
          <SubHeader
            title="Meus dados"
            subtitle="Suas informações pessoais cadastradas"
            isEditing={isEditing}
            isSaving={isSaving}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
          />

          <div className="flex items-start gap-2 text-sm bg-paleGreen/20 border border-paleGreen rounded-xl px-4 py-3 mb-6">
            <Info size={16} className="text-deepGreen flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-gray-700">
              {isEditing
                ? "Modo edição ativo. Telefone, gênero e portador de deficiência podem ser alterados."
                : "Clique em Editar para atualizar telefone, gênero e portador de deficiência."}
            </p>
          </div>

          {/* Foto de perfil */}
          <div className="mb-6">
            <label className={labelClass}>
              Foto de perfil <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-paleGreen/40 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Pré-visualização da foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={40} className="text-deepGreen" aria-hidden="true" />
                )}
              </div>
              {isEditing && (
                <>
                  <label
                    htmlFor="photo"
                    className="cursor-pointer inline-flex items-center gap-2 border border-deepGreen text-deepGreen px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-deepGreen hover:text-white transition-colors duration-200"
                  >
                    <ImageIcon size={16} aria-hidden="true" />
                    Escolher imagem
                  </label>
                  <input
                    type="file"
                    id="photo"
                    name="photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </>
              )}
            </div>
          </div>

          {/* Nome */}
          <div className="mb-5">
            <div className="flex items-center gap-1">
              <label className={labelClass}>Nome completo</label>
              {isEditing && <LockedLabel />}
            </div>
            <input type="text" disabled value={user.name} className={inputLocked} />
          </div>

          {/* Data e Gênero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <div className="flex items-center gap-1">
                <label className={labelClass}>Data de nascimento</label>
                {isEditing && <LockedLabel />}
              </div>
              <input type="date" disabled value={dateFormatted} className={inputLocked} />
            </div>

            <div>
              <label className={labelClass}>Gênero</label>
              <div className="flex flex-wrap gap-4 py-3">
                {["Mulher", "Homem", "Outro", "Prefiro Não Dizer"].map((g) => (
                  <div key={g} className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={g}
                      name="gender"
                      value={g}
                      checked={(isEditing ? formData.gender : user.gender) === g}
                      onChange={() => isEditing && setFormData((f) => ({ ...f, gender: g }))}
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                    <label htmlFor={g} className="text-sm text-gray-700">
                      {g === "Prefiro Não Dizer" ? "Prefiro não dizer" : g}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-gray-100 my-6" />

          {/* Portador de deficiência */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-deepGreen font-PrimaryFont">Portador de deficiência</h2>
            <p className="text-gray-500 text-sm mt-1 mb-3">
              Gostaria de se candidatar às vagas como portador de deficiência?
            </p>
            <div className="flex gap-3">
              {["Sim", "Não"].map((v) => (
                <label
                  key={v}
                  htmlFor={`disable-${v}`}
                  className={`flex items-center gap-2 cursor-pointer select-none px-4 py-2.5 rounded-xl border transition-colors duration-200 ${
                    (isEditing ? formData.disablePerson : user.disablePerson) === v
                      ? isEditing
                        ? "border-mediumGreen bg-paleGreen/40 text-deepGreen font-medium"
                        : "border-gray-300 bg-gray-100 text-gray-600"
                      : "border-gray-200 text-gray-500"
                  } ${!isEditing ? "pointer-events-none" : ""}`}
                >
                  <input
                    type="radio"
                    id={`disable-${v}`}
                    name="disablePerson"
                    value={v}
                    checked={(isEditing ? formData.disablePerson : user.disablePerson) === v}
                    onChange={() => isEditing && setFormData((f) => ({ ...f, disablePerson: v }))}
                    readOnly={!isEditing}
                  />
                  {v}
                </label>
              ))}
            </div>
          </div>

          {/* Telefone e Email */}
          <h2 className="text-lg font-bold text-deepGreen font-PrimaryFont mb-4">Informações pessoais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Telefone</label>
              <input
                type="text"
                value={isEditing ? formData.phone : user.phone}
                disabled={!isEditing}
                onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                className={isEditing ? inputEditable : inputLocked}
                placeholder={isEditing ? "Digite o telefone" : ""}
              />
            </div>

            <div>
              <div className="flex items-center gap-1">
                <label className={labelClass}>Email</label>
                {isEditing && <LockedLabel />}
              </div>
              <input type="text" disabled value={user.email} className={inputLocked} />
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100">
            <button
              onClick={() => setConfirmDeleteOpen(true)}
              className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors duration-200 font-SecondFont font-medium"
            >
              Excluir conta
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Excluir conta"
        description="Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita."
        onConfirm={handleDelete}
      />
    </>
  );
}
