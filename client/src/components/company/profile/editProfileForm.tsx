import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Image as ImageIcon, ArrowLeft, FileText, Loader2, Facebook, Instagram, Linkedin, Globe } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "../userContextCompany";
import { updateCompanyProfile, uploadCompanyLogo, uploadCompanyBanner } from "@/services/company";

const EditProfileForm = () => {
  const navigate = useNavigate();
  const { UserData, refreshUser } = useUser();
  const user = UserData.user;

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(user.logoUrl || null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(user.bannerUrl || null);
  const [description, setDescription] = useState(user.description || "");
  const [facebookUrl, setFacebookUrl] = useState(user.facebookUrl || "");
  const [instagramUrl, setInstagramUrl] = useState(user.instagramUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user.linkedinUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(user.websiteUrl || "");
  const [salvando, setSalvando] = useState(false);

  // Mesmo caso de companySettingsForm.tsx: `user` chega assíncrono do
  // contexto, então o valor inicial do useState acima fica travado em
  // vazio. Resincroniza os campos assim que o dado real da empresa chega
  // — sem isso, salvar sem mexer em nada apaga descrição/redes sociais.
  useEffect(() => {
    setLogoPreview(user.logoUrl || null);
    setBannerPreview(user.bannerUrl || null);
    setDescription(user.description || "");
    setFacebookUrl(user.facebookUrl || "");
    setInstagramUrl(user.instagramUrl || "");
    setLinkedinUrl(user.linkedinUrl || "");
    setWebsiteUrl(user.websiteUrl || "");
  }, [user]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await updateCompanyProfile({ description, facebookUrl, instagramUrl, linkedinUrl, websiteUrl });
      if (logoFile) await uploadCompanyLogo(logoFile);
      if (bannerFile) await uploadCompanyBanner(bannerFile);
      await refreshUser();
      toast.success("Perfil atualizado!");
      navigate("/empresa");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar alterações");
    } finally {
      setSalvando(false);
    }
  };

  const plainInputClass =
    "w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent transition-all duration-300";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-12">
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
            <h1 className="text-2xl font-bold text-deepGreen font-PrimaryFont">Editar perfil</h1>
            <p className="text-gray-600 mt-2">
              Complete a foto, o banner e a descrição que aparecem pra quem visita o perfil da sua empresa
            </p>
          </div>

          <div className="space-y-5">
            {/* Banner */}
            <div>
              <label className={labelClass}>Banner do perfil</label>
              <div className="h-24 sm:h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 mb-3">
                {bannerPreview && (
                  <img src={bannerPreview} alt="Pré-visualização do banner" className="w-full h-full object-cover" />
                )}
              </div>
              <label
                htmlFor="banner"
                className="cursor-pointer inline-flex items-center gap-2 border border-deepGreen text-deepGreen px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-deepGreen hover:text-white transition-colors duration-200"
              >
                <ImageIcon size={16} aria-hidden="true" />
                Escolher imagem
              </label>
              <input
                type="file"
                id="banner"
                name="banner"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
            </div>

            {/* Logo */}
            <div>
              <label className={labelClass}>Foto de perfil (logo)</label>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-paleGreen/40 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Pré-visualização do logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={32} className="text-deepGreen" aria-hidden="true" />
                  )}
                </div>
                <label
                  htmlFor="logo"
                  className="cursor-pointer inline-flex items-center gap-2 border border-deepGreen text-deepGreen px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-deepGreen hover:text-white transition-colors duration-200"
                >
                  <ImageIcon size={16} aria-hidden="true" />
                  Escolher imagem
                </label>
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>Descrição da empresa</label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Conte um pouco sobre a atuação da empresa"
                className={`${plainInputClass} resize-none`}
              />
            </div>

            {/* Redes sociais */}
            <div className="pt-2 space-y-4">
              <h2 className="font-PrimaryFont text-lg text-deepGreen font-semibold">Redes sociais</h2>

              <div>
                <label htmlFor="facebookUrl" className={labelClass}>
                  <Facebook size={16} className="inline mr-1.5 -mt-0.5" aria-hidden="true" />
                  Facebook
                </label>
                <input
                  type="url"
                  id="facebookUrl"
                  name="facebookUrl"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/suaempresa"
                  className={plainInputClass}
                />
              </div>

              <div>
                <label htmlFor="instagramUrl" className={labelClass}>
                  <Instagram size={16} className="inline mr-1.5 -mt-0.5" aria-hidden="true" />
                  Instagram
                </label>
                <input
                  type="url"
                  id="instagramUrl"
                  name="instagramUrl"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/suaempresa"
                  className={plainInputClass}
                />
              </div>

              <div>
                <label htmlFor="linkedinUrl" className={labelClass}>
                  <Linkedin size={16} className="inline mr-1.5 -mt-0.5" aria-hidden="true" />
                  LinkedIn
                </label>
                <input
                  type="url"
                  id="linkedinUrl"
                  name="linkedinUrl"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/company/suaempresa"
                  className={plainInputClass}
                />
              </div>

              <div>
                <label htmlFor="websiteUrl" className={labelClass}>
                  <Globe size={16} className="inline mr-1.5 -mt-0.5" aria-hidden="true" />
                  Website
                </label>
                <input
                  type="url"
                  id="websiteUrl"
                  name="websiteUrl"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://suaempresa.com.br"
                  className={plainInputClass}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 flex items-center justify-center gap-2 bg-deepGreen text-white py-4 rounded-xl font-semibold text-lg hover:bg-mediumGreen transition-colors duration-300 disabled:opacity-60"
              >
                {salvando ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : <FileText size={20} aria-hidden="true" />}
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileForm;
