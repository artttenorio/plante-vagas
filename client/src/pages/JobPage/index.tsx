import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "@/components/home-page/footer/footer";
import Header from "@/components/home-page/headers/header";
import MainJobPage from "@/components/JobPage/mainJobPage/mainJobpage";
import { Facebook, Instagram, Linkedin, Globe, ArrowLeft, Building2, Clock, Loader2 } from "lucide-react";
import { getVagaById, type Vaga } from "@/services/vaga";
import { getPublicCompany, type PublicCompany } from "@/services/company";
import { timeAgo } from "@/utils/timeAgo";

const JobPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [empresa, setEmpresa] = useState<PublicCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getVagaById(Number(id))
      .then(setVaga)
      .catch((e) => setErro(e.message || "Erro ao buscar vaga"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!vaga?.empresa?.id) return;
    getPublicCompany(vaga.empresa.id)
      .then(setEmpresa)
      .catch(() => setEmpresa(null));
  }, [vaga?.empresa?.id]);

  const socialLinks = [
    { icon: Facebook, href: empresa?.facebookUrl, label: "Facebook", color: "hover:bg-blue-600" },
    { icon: Instagram, href: empresa?.instagramUrl, label: "Instagram", color: "hover:bg-pink-600" },
    { icon: Linkedin, href: empresa?.linkedinUrl, label: "LinkedIn", color: "hover:bg-blue-700" },
    { icon: Globe, href: empresa?.websiteUrl, label: "Website", color: "hover:bg-gray-600" },
  ].filter((social): social is typeof social & { href: string } => !!social.href);

  const nomeEmpresa = vaga?.empresa?.fantasyName || vaga?.empresa?.name;

  return (
    <>
      <Header />

      <main className="pt-20 min-h-screen bg-gray-50">
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-br from-deepGreen via-mediumGreen to-deepGreen">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-8
                       transition-colors duration-300 font-SecondFont text-sm"
            >
              <ArrowLeft size={18} />
              Voltar para vagas
            </button>

            {vaga && (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <button
                  type="button"
                  onClick={() => vaga.empresa?.id && navigate(`/empresa-publica/${vaga.empresa.id}`)}
                  disabled={!vaga.empresa?.id}
                  title={nomeEmpresa ? `Ver perfil de ${nomeEmpresa}` : undefined}
                  className="w-28 h-28 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden
                           transition-transform duration-300 hover:scale-105 disabled:hover:scale-100"
                >
                  {empresa?.logoUrl ? (
                    <img src={empresa.logoUrl} alt={`Logo de ${nomeEmpresa}`} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={48} className="text-gray-300" />
                  )}
                </button>
                <div className="text-center md:text-left">
                  <span className="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-SecondFont mb-3">
                    <Building2 size={14} />
                    Agronegócio
                  </span>
                  <button
                    type="button"
                    onClick={() => vaga.empresa?.id && navigate(`/empresa-publica/${vaga.empresa.id}`)}
                    disabled={!vaga.empresa?.id}
                    className="block text-2xl sm:text-3xl md:text-4xl font-bold text-white font-PrimaryFont
                             hover:underline underline-offset-4 disabled:hover:no-underline text-left"
                  >
                    {nomeEmpresa || vaga.nome}
                  </button>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-white/80 font-SecondFont text-sm">
                    <span className="flex items-center gap-2">
                      <Clock size={16} />
                      Postada há {timeAgo(vaga.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-SecondFont">
              <Loader2 size={32} className="animate-spin text-mediumGreen mb-3" />
              Carregando vaga...
            </div>
          )}

          {!loading && erro && (
            <div className="text-center py-20 text-red-600 font-SecondFont">{erro}</div>
          )}

          {!loading && !erro && vaga && (
            <>
              <MainJobPage vaga={vaga} />

              {/* Social Links Section */}
              {socialLinks.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-deepGreen font-PrimaryFont mb-6">
                    Redes Sociais da Empresa
                  </h3>
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
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default JobPage;
