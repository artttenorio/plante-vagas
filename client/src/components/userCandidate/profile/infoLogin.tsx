import { useState } from "react";
import SubHeader from "../../home-page/headers/subHeader";
import { useUser } from "../userContext";
import { toast } from "sonner";
import { updateUser } from "../../../services/users";
import { hashPassword } from "../../../utils/hashPassword";
import { Lock, Info } from "lucide-react";

const inputBase = "w-full px-4 py-3 rounded-xl border transition-all duration-200";
const inputLocked = `${inputBase} bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200`;
const inputEditable = `${inputBase} bg-white text-gray-800 border-gray-200 focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent`;
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

export default function InfoLogin() {
  const { UserData } = useUser();
  const { user } = UserData;

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleEdit = () => {
    setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setIsEditing(true);
  };

  const handleCancel = () => setIsEditing(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    if (!formData.currentPassword || !formData.newPassword) {
      toast.error("Preencha a senha atual e a nova senha");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("A nova senha e a confirmação não coincidem");
      return;
    }
    setIsSaving(true);
    const loadingToast = toast.loading("Atualizando senha...");
    try {
      await updateUser({
        currentPassword: hashPassword(formData.currentPassword),
        newPassword: hashPassword(formData.newPassword),
      });
      setIsEditing(false);
      toast.success("Senha atualizada com sucesso", { id: loadingToast });
    } catch (error: any) {
      toast.error("Erro ao atualizar senha", { id: loadingToast, description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 font-SecondFont">
        <SubHeader
          title="Informações de login"
          subtitle="Seu email de acesso e senha"
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
              ? "Preencha os campos abaixo para alterar sua senha."
              : "Clique em Editar para alterar sua senha."}
          </p>
        </div>

        {/* Email — sempre bloqueado */}
        <div className="mb-6">
          <div className="flex items-center gap-1">
            <label className={labelClass}>Email</label>
            {isEditing && (
              <span className="flex items-center gap-1 text-xs text-gray-400 ml-1">
                <Lock className="w-3 h-3" aria-hidden="true" /> Não editável
              </span>
            )}
          </div>
          <input type="text" disabled value={user.email} className={`${inputLocked} sm:max-w-sm`} />
        </div>

        {/* Senha */}
        <div>
          <label className={labelClass}>Senha</label>

          {!isEditing && (
            <input type="text" disabled value="••••••••••••••" className={`${inputLocked} sm:max-w-xs`} />
          )}

          {isEditing && (
            <div className="flex flex-col gap-4 max-w-md">
              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">Senha atual *</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={set("currentPassword")}
                  className={inputEditable}
                  placeholder="Digite sua senha atual"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">Nova senha *</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={set("newPassword")}
                  className={inputEditable}
                  placeholder="Digite a nova senha"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">Confirmar nova senha *</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={set("confirmPassword")}
                  className={inputEditable}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
