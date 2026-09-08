import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "@/components/home-page/footer/footer";
import Header from "@/components/home-page/headers/header";
import Vagas from "@/components/searchJob/jobs/vagas";
import {
  Facebook,
  Instagram,
  Linkedin,
  Globe,
  ArrowLeft,
  Building2,
  MapPin,
  Briefcase,
  Loader2,
  Heart,
} from "lucide-react";
import { getPublicCompany, type PublicCompany } from "@/services/company";
import { favoritarEmpresa, desfavoritarEmpresa, getMinhasFavoritas } from "@/services/favoritos";
import { toast } from "sonner";

const CompanyPublicProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const empresaId = Number(id);

  const [empresa, setEmpresa] = useState<PublicCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [favoritada, setFavoritada] = useState(false);
  const [favoritando, setFavoritando] = useState(false);
  const favoritadaAlteradaPeloUsuario = useRef(false);

  const ehCandidatoLogado = localStorage.getItem("userType") === "candidate";

  useEffect(() => {
    if (!empresaId) return;
    setLoading(true);
    getPublicCompany(empresaId)
      .then(setEmpresa)
      .catch((e) => setErro(e.message || "Erro ao buscar empresa"))
      .finally(() => setLoading(false));
  }, [empresaId]);

  useEffect(() => {
    if (!ehCandidatoLogado || !empresaId) return;
    getMinhasFavoritas()
      .then((favoritas) => {
        // Se o candidato já clicou em favoritar/desfavoritar enquanto essa
        // checagem inicial ainda estava em andamento, não sobrescreve o
        // clique com uma resposta que partiu de antes dele.
        if (favoritadaAlteradaPeloUsuario.current) return;
        setFavoritada(favoritas.some((f) => f.empresaId === empresaId));
      })
      .catch(() => {});
  }, [ehCandidatoLogado, empresaId]);

  const handleFavoritar = async () => {
    favoritadaAlteradaPeloUsuario.current = true;
    setFavoritando(true);
    try {
      if (favoritada) {
        await desfavoritarEmpresa(empresaId);
        setFavoritada(false);
        toast.success("Empresa removida dos favoritos");
      } else {
        await favoritarEmpresa(empresaId);
        setFavoritada(true);
        toast.success("Empresa adicionada aos favoritos");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao favoritar empresa");
    } finally {
      setFavoritando(false);
    }
  };

  const nomeEmpresa = empresa?.fantasyName || empresa?.name;

  const socialLinks = [
    { icon: Facebook, href: empresa?.facebookUrl, label: "Facebook", color: "hover:bg-blue-600" },
    { icon: Instagram, href: empresa?.instagramUrl, label: "Instagram", color: "hover:bg-pink-600" },
    { icon: Linkedin, href: empresa?.linkedinUrl, label: "LinkedIn", color: "hover:bg-blue-700" },
    { icon: Globe, href: empresa?.websiteUrl, label: "Website", color: "hover:bg-gray-600" },
  ].filter((social): social is typeof social & { href: string } => !!social.href);

  return (
    <>
      <Header />

      <main className="pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-deepGreen mb-6
                     transition-colors duration-300 font-SecondFont text-sm"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          {/* Cabeçalho da empresa — banner com margem, como um cartão */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-deepGreen via-mediumGreen to-deepGreen mb-8">
            {empresa?.bannerUrl && (
              <div className="absolute inset-0 opacity-30">
                <img src={empresa.bannerUrl} alt="Banner da empresa" className="w-full h-full object-cover" />
              </div>
            )}

            {empresa && (
              <div className="relative flex flex-col md:flex-row items-center gap-6 p-6 sm:p-10">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {empresa.logoUrl ? (
                    <img src={empresa.logoUrl} alt={`Logo de ${nomeEmpresa}`} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={40} className="text-gray-300" />
                  )}
                </div>
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-white font-PrimaryFont">
                    {nomeEmpresa}
                  </h1>
                  {empresa.Address?.city && (
                    <p className="flex items-center justify-center md:justify-start gap-2 mt-2 text-white/80 font-SecondFont text-sm">
                      <MapPin size={16} />
                      {empresa.Address.city}
                      {empresa.Address.state ? ` - ${empresa.Address.state}` : ""}
                    </p>
                  )}
                </div>

                {ehCandidatoLogado && (
                  <button
                    onClick={handleFavoritar}
                    disabled={favoritando}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-SecondFont font-semibold
                             transition-all duration-300 disabled:opacity-60 flex-shrink-0 ${
                               favoritada
                                 ? "bg-white text-red-600 hover:bg-red-50"
                                 : "bg-white/10 text-white border border-white/30 hover:bg-white/20"
                             }`}
                  >
                    <Heart size={18} fill={favoritada ? "currentColor" : "none"} />
                    {favoritada ? "Favoritada" : "Favoritar empresa"}
                  </button>
                )}
              </div>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-SecondFont">
              <Loader2 size={32} className="animate-spin text-mediumGreen mb-3" />
              Carregando empresa...
            </div>
          )}

          {!loading && erro && (
            <div className="text-center py-20 text-red-600 font-SecondFont">{erro}</div>
          )}

          {/* Corpo — um "documento" só, com seções separadas por linha, não cards soltos */}
          {!loading && !erro && empresa && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <section className="p-6 sm:p-10">
                <h2 className="text-sm font-bold text-gray-400 font-SecondFont uppercase tracking-wide mb-3">
                  Sobre a empresa
                </h2>
                {empresa.description ? (
                  <p className="font-SecondFont text-gray-700 leading-relaxed">{empresa.description}</p>
                ) : (
                  <p className="font-SecondFont text-gray-500 text-sm">
                    Essa empresa ainda não preencheu uma descrição de perfil.
                  </p>
                )}
              </section>

              {socialLinks.length > 0 && (
                <section className="p-6 sm:p-10 border-t border-gray-100">
                  <h2 className="text-sm font-bold text-gray-400 font-SecondFont uppercase tracking-wide mb-4">
                    Redes Sociais
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className={`flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl
                                 font-SecondFont font-medium transition-all duration-300
                                 hover:text-white hover:shadow-lg ${social.color}`}
                      >
                        <social.icon size={20} />
                        <span>{social.label}</span>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              <section className="p-6 sm:p-10 border-t border-gray-100">
                <h2 className="text-sm font-bold text-gray-400 font-SecondFont uppercase tracking-wide mb-6 flex items-center gap-2">
                  <Briefcase size={16} />
                  Vagas abertas ({empresa.vagas.length})
                </h2>
                {empresa.vagas.length === 0 ? (
                  <p className="text-gray-500 font-SecondFont text-sm">
                    {nomeEmpresa} não tem nenhuma vaga aberta no momento.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {empresa.vagas.map((vaga) => (
                      <Vagas
                        key={vaga.id}
                        id={vaga.id}
                        nome={vaga.nome}
                        cargo={vaga.cargo}
                        salario={vaga.salario ?? undefined}
                        descricao=""
                        beneficios={[]}
                        empresa={{ id: empresa.id, fantasyName: empresa.fantasyName, name: empresa.name, logoUrl: empresa.logoUrl }}
                        createdAt={vaga.createdAt}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default CompanyPublicProfile;
