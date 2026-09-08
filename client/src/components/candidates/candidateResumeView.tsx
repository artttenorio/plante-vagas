import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, Phone, MapPin, User, Cake, UserRound } from "lucide-react";
import { getCurriculumForCompany, type CandidateResume } from "@/services/curriculum";
import CurriculumSections, { SectionTitle } from "@/components/userCandidate/curriculum/curriculumSections";

export default function CandidateResumeView() {
  const { candidatoId } = useParams<{ candidatoId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const backQuery = searchParams.toString();

  const [data, setData] = useState<CandidateResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!candidatoId) return;
    let active = true;
    setLoading(true);
    setError(null);
    getCurriculumForCompany(Number(candidatoId))
      .then((res) => {
        if (active) setData(res);
      })
      .catch((e: any) => {
        if (active) setError(e.message || "Erro ao carregar currículo");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [candidatoId]);

  const usuario = data?.usuario;
  const curriculo = data?.curriculo;
  const addr = usuario?.Address;
  const location = [addr?.city, addr?.state].filter(Boolean).join(" — ");

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(backQuery ? `/candidatos?${backQuery}` : "/candidatos")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-deepGreen transition-colors duration-200 mb-6"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar para candidatos
        </button>

        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-24 flex items-center justify-center">
            <p className="text-gray-500 flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Carregando currículo...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-24 flex items-center justify-center">
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {!loading && !error && usuario && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 font-SecondFont overflow-hidden">
            {/* Cabeçalho do currículo */}
            <div className="bg-deepGreen text-white px-8 py-10 text-center">
              <h1 className="text-3xl font-bold font-PrimaryFont">{usuario.name || "—"}</h1>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 text-sm text-paleGreen">
                {usuario.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" aria-hidden="true" /> {usuario.email}
                  </span>
                )}
                {usuario.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" aria-hidden="true" /> {usuario.phone}
                  </span>
                )}
                {location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" aria-hidden="true" /> {location}
                  </span>
                )}
              </div>
              {usuario.disablePerson === "Sim" && (
                <span className="inline-block mt-4 text-xs px-3 py-1 bg-white/20 rounded-full">
                  PcD
                </span>
              )}
            </div>

            <div className="p-6 sm:p-10">
              {/* Informações pessoais */}
              <div className="mb-10">
                <SectionTitle icon={User} title="Informações Pessoais" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-700">
                  {usuario.dateNasc && (
                    <div className="flex items-start gap-2">
                      <Cake className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" aria-hidden="true" />
                      <div>
                        <span className="text-gray-400 block text-xs mb-1">Data de nascimento</span>
                        {new Date(usuario.dateNasc).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  )}
                  {usuario.gender && (
                    <div className="flex items-start gap-2">
                      <UserRound className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" aria-hidden="true" />
                      <div>
                        <span className="text-gray-400 block text-xs mb-1">Gênero</span>
                        {usuario.gender}
                      </div>
                    </div>
                  )}
                  {addr && (
                    <div className="flex items-start gap-2 sm:col-span-1">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" aria-hidden="true" />
                      <div>
                        <span className="text-gray-400 block text-xs mb-1">Endereço</span>
                        {[addr.street, addr.number, addr.district, addr.city, addr.state]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Seções do currículo */}
              {curriculo ? (
                <CurriculumSections curriculum={curriculo} />
              ) : (
                <p className="text-gray-400 text-sm italic py-8 text-center">
                  Este candidato ainda não preencheu o currículo.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
