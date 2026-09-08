import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Building2, MapPin, Send, ArrowRight, Loader2 } from "lucide-react";
import { getPublicCompany, PublicCompany } from "@/services/company";

type CompanyInfoPageProps = {
  empresa?: { id: number; fantasyName: string; name: string };
  onCandidatar: () => void;
  candidatando: boolean;
  candidatado: boolean;
};

const CompanyInfoPage = ({ empresa, onCandidatar, candidatando, candidatado }: CompanyInfoPageProps) => {
  const nomeEmpresa = empresa?.fantasyName || empresa?.name || "Empresa";
  const [perfil, setPerfil] = useState<PublicCompany | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!empresa?.id) {
      setCarregando(false);
      return;
    }
    getPublicCompany(empresa.id)
      .then(setPerfil)
      .catch(() => setPerfil(null))
      .finally(() => setCarregando(false));
  }, [empresa?.id]);

  return (
    <div className="space-y-8">
      {/* Company Overview */}
      <section>
        {perfil?.bannerUrl && (
          <div className="h-24 sm:h-32 rounded-xl overflow-hidden mb-4 bg-gray-100">
            <img src={perfil.bannerUrl} alt="Banner da empresa" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-paleGreen rounded-xl flex items-center justify-center overflow-hidden">
            {perfil?.logoUrl ? (
              <img src={perfil.logoUrl} alt="Logo da empresa" className="w-full h-full object-cover" />
            ) : (
              <Building2 size={20} className="text-deepGreen" />
            )}
          </div>
          <h3 className="text-lg font-bold text-deepGreen font-PrimaryFont">
            Sobre a Empresa
          </h3>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 space-y-3">
          <p className="font-SecondFont text-gray-700 leading-relaxed">
            Esta vaga foi publicada por <strong className="text-deepGreen">{nomeEmpresa}</strong>.
          </p>

          {carregando ? (
            <p className="font-SecondFont text-gray-500 text-sm">Carregando perfil...</p>
          ) : perfil?.description ? (
            <p className="font-SecondFont text-gray-700 leading-relaxed">{perfil.description}</p>
          ) : (
            <p className="font-SecondFont text-gray-500 text-sm">
              Essa empresa ainda não preencheu uma descrição de perfil.
            </p>
          )}

          {perfil?.Address?.city && (
            <p className="font-SecondFont text-gray-500 text-sm flex items-center gap-2">
              <MapPin size={14} aria-hidden="true" />
              {perfil.Address.city}
              {perfil.Address.state ? ` - ${perfil.Address.state}` : ""}
            </p>
          )}

          {empresa?.id && (
            <Link
              to={`/empresa-publica/${empresa.id}`}
              className="inline-flex items-center gap-2 text-deepGreen font-SecondFont font-semibold text-sm
                       hover:text-mediumGreen transition-colors duration-200"
            >
              Ver perfil completo da empresa
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>
      </section>

      {/* Join CTA */}
      <section className="pt-4">
        <div className="bg-gradient-to-r from-mediumGreen to-deepGreen rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-white font-PrimaryFont mb-2">
                Interessado em fazer parte da {nomeEmpresa}?
              </h3>
              <p className="text-white/80 font-SecondFont max-w-xl">
                Candidate-se a esta vaga e dê o próximo passo na sua carreira no agronegócio.
              </p>
            </div>
            <button
              onClick={onCandidatar}
              disabled={candidatando || candidatado}
              className="group flex items-center gap-3 bg-white text-deepGreen px-8 py-4 rounded-xl
                       font-SecondFont font-bold text-lg hover:bg-paleGreen transition-all duration-300
                       hover:shadow-lg hover:scale-105 whitespace-nowrap disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {candidatando ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              {candidatado ? "CANDIDATURA ENVIADA" : candidatando ? "ENVIANDO..." : "CANDIDATAR-SE"}
              {!candidatado && !candidatando && (
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CompanyInfoPage;
