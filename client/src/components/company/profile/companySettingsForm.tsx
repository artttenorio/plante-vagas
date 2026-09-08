import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Phone, Calendar, MapPin, ArrowLeft, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "../userContextCompany";
import { phoneMask } from "../../masks/phoneMask";
import { cepMask } from "../../masks/cepMask";
import { updateCompanyCadastro, deleteCompany } from "@/services/company";
import { clearSession } from "@/services/api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const CompanySettingsForm = () => {
  const navigate = useNavigate();
  const { UserData, refreshUser } = useUser();
  const user = UserData.user;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [name, setName] = useState(user.name || "");
  const [fantasyName, setFantasyName] = useState(user.fantasyName || "");
  const [socialReason, setSocialReason] = useState(user.socialReason || "");
  const [phone, setPhone] = useState(user.phone ? phoneMask(user.phone) : "");
  const [openingDate, setOpeningDate] = useState(
    user.openingDate ? user.openingDate.slice(0, 10) : ""
  );

  const [cep, setCep] = useState(user.Address?.postalCode ? cepMask(user.Address.postalCode) : "");
  const [street, setStreet] = useState(user.Address?.street || "");
  const [number, setNumber] = useState(user.Address?.number || "");
  const [complement, setComplement] = useState(user.Address?.complement || "");
  const [district, setDistrict] = useState(user.Address?.district || "");
  const [city, setCity] = useState(user.Address?.city || "");
  const [state, setState] = useState(user.Address?.state || "");
  const [cepLoading, setCepLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // `user` vem de um fetch assíncrono no contexto (userContextCompany.tsx)
  // — na primeira renderização ele ainda tá vazio, então o useState acima
  // (que só lê o valor inicial uma vez) fica travado em "". Esse efeito
  // resincroniza os campos assim que o dado real da empresa chega.
  useEffect(() => {
    setName(user.name || "");
    setFantasyName(user.fantasyName || "");
    setSocialReason(user.socialReason || "");
    setPhone(user.phone ? phoneMask(user.phone) : "");
    setOpeningDate(user.openingDate ? user.openingDate.slice(0, 10) : "");
    setCep(user.Address?.postalCode ? cepMask(user.Address.postalCode) : "");
    setStreet(user.Address?.street || "");
    setNumber(user.Address?.number || "");
    setComplement(user.Address?.complement || "");
    setDistrict(user.Address?.district || "");
    setCity(user.Address?.city || "");
    setState(user.Address?.state || "");
  }, [user]);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = cepMask(e.target.value);
    setCep(masked);
    const cleaned = masked.replace("-", "");
    if (cleaned.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
        const data = await res.json();
        if (data.erro) {
          toast.error("CEP não encontrado");
        } else {
          setStreet(data.logradouro || "");
          setDistrict(data.bairro || "");
          setCity(data.localidade || "");
          setState(data.uf || "");
        }
      } catch {
        toast.error("Erro ao buscar CEP");
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("A nova senha e a confirmação não coincidem");
      return;
    }

    setSalvando(true);
    try {
      await updateCompanyCadastro({
        name,
        fantasyName,
        socialReason,
        phone: phone.replace(/\D/g, ""),
        openingDate,
        address: {
          city,
          district,
          street,
          number,
          complement,
          postalCode: cep.replace("-", ""),
          state,
        },
        ...(newPassword ? { currentPassword, newPassword } : {}),
      });
      await refreshUser();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Dados de cadastro atualizados!");
      navigate("/empresa");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar alterações");
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async () => {
    const loadingToast = toast.loading("Excluindo conta...");
    try {
      await deleteCompany();
      clearSession();
      toast.success("Conta excluída com sucesso", { id: loadingToast });
      navigate("/login");
    } catch (error: any) {
      toast.error("Erro ao excluir conta", { id: loadingToast, description: error.message });
    }
  };

  const inputClass =
    "w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent transition-all duration-300";
  const plainInputClass =
    "w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent transition-all duration-300";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <>
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12">
        <button
          onClick={() => navigate("/empresa")}
          className="flex items-center gap-2 text-gray-600 hover:text-deepGreen transition-colors duration-200 mb-6 font-SecondFont text-sm"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Voltar para o perfil
        </button>

        <form
          onSubmit={handleSave}
          className="w-full bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-gray-100 font-SecondFont text-gray-800"
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-deepGreen font-PrimaryFont">Configurações</h1>
            <p className="text-gray-600 mt-2">
              Edite os dados de cadastro da sua empresa
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="nome" className={labelClass}>Nome da Empresa</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Building2 size={20} aria-hidden="true" />
                </div>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  autoComplete="organization"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="fantasy-name" className={labelClass}>Nome fantasia</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Building2 size={20} aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    id="fantasy-name"
                    name="fantasy-name"
                    value={fantasyName}
                    onChange={(e) => setFantasyName(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="social-reason" className={labelClass}>Razão Social</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Building2 size={20} aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    id="social-reason"
                    name="social-reason"
                    autoComplete="organization"
                    value={socialReason}
                    onChange={(e) => setSocialReason(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="cnpj" className={labelClass}>CNPJ</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} aria-hidden="true" />
                </div>
                <input
                  type="text"
                  id="cnpj"
                  value={user.cnpj}
                  disabled
                  className={`${inputClass} bg-gray-100 text-gray-500 cursor-not-allowed`}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">O CNPJ não pode ser alterado.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="telephone" className={labelClass}>Telefone/Celular</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Phone size={20} aria-hidden="true" />
                  </div>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(phoneMask(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="date" className={labelClass}>Data de abertura</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Calendar size={20} aria-hidden="true" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={openingDate}
                    onChange={(e) => setOpeningDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Alterar senha */}
            <div className="pt-2">
              <div className="flex items-center gap-2 text-deepGreen font-semibold mb-4">
                <Lock size={18} aria-hidden="true" />
                <h2 className="font-PrimaryFont text-lg">Alterar Senha</h2>
              </div>
              <p className="text-xs text-gray-400 -mt-2 mb-4">
                Deixe em branco se não quiser trocar a senha.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="current-password" className={labelClass}>Senha atual</label>
                  <input
                    type="password"
                    id="current-password"
                    name="current-password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    className={plainInputClass}
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className={labelClass}>Nova senha</label>
                  <input
                    type="password"
                    id="new-password"
                    name="new-password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha"
                    className={plainInputClass}
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className={labelClass}>Confirmar nova senha</label>
                  <input
                    type="password"
                    id="confirm-password"
                    name="confirm-password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className={plainInputClass}
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="pt-2">
              <div className="flex items-center gap-2 text-deepGreen font-semibold mb-4">
                <MapPin size={18} aria-hidden="true" />
                <h2 className="font-PrimaryFont text-lg">Endereço da Empresa</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="cep" className={labelClass}>CEP</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="cep"
                      name="cep"
                      autoComplete="postal-code"
                      value={cep}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      className={plainInputClass}
                    />
                    {cepLoading && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        Buscando...
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-5">
                  <div>
                    <label htmlFor="street" className={labelClass}>Rua</label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      autoComplete="address-line1"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className={plainInputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="number" className={labelClass}>Número</label>
                    <input
                      type="text"
                      id="number"
                      name="number"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className={plainInputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="complement" className={labelClass}>Complemento (opcional)</label>
                  <input
                    type="text"
                    id="complement"
                    name="complement"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    className={plainInputClass}
                  />
                </div>

                <div>
                  <label htmlFor="district" className={labelClass}>Bairro</label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className={plainInputClass}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="city" className={labelClass}>Cidade</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      autoComplete="address-level2"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={plainInputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className={labelClass}>Estado</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      autoComplete="address-level1"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="UF"
                      className={plainInputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 flex items-center justify-center gap-2 bg-deepGreen text-white py-4 rounded-xl font-semibold text-lg hover:bg-mediumGreen transition-colors duration-300 disabled:opacity-60"
              >
                {salvando && <Loader2 size={20} className="animate-spin" aria-hidden="true" />}
                {salvando ? "Salvando..." : "SALVAR ALTERAÇÕES"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/empresa")}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors duration-300"
              >
                CANCELAR
              </button>
            </div>

            <div className="pt-6 mt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors duration-200 font-SecondFont font-medium"
              >
                Excluir conta
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <ConfirmDialog
      open={confirmDeleteOpen}
      onOpenChange={setConfirmDeleteOpen}
      title="Excluir conta"
      description="Tem certeza que deseja excluir a conta da empresa? Essa ação não pode ser desfeita."
      onConfirm={handleDelete}
    />
    </>
  );
};

export default CompanySettingsForm;
