import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Loader2, Building2, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import { getMinhasFavoritas, desfavoritarEmpresa, type EmpresaFavoritada } from "@/services/favoritos";

export default function Favoritos() {
  const navigate = useNavigate();
  const [favoritas, setFavoritas] = useState<EmpresaFavoritada[]>([]);
  const [loading, setLoading] = useState(true);
  const [removendoId, setRemovendoId] = useState<number | null>(null);

  useEffect(() => {
    getMinhasFavoritas()
      .then(setFavoritas)
      .finally(() => setLoading(false));
  }, []);

  const handleRemover = async (favorita: EmpresaFavoritada, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemovendoId(favorita.id);
    try {
      await desfavoritarEmpresa(favorita.empresaId);
      setFavoritas((prev) => prev.filter((f) => f.id !== favorita.id));
      toast.success("Empresa removida dos favoritos");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao remover dos favoritos");
    } finally {
      setRemovendoId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-deepGreen font-PrimaryFont mb-6">
          Empresas favoritas
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-SecondFont">
            <Loader2 size={32} className="animate-spin text-mediumGreen mb-3" aria-hidden="true" />
            Carregando...
          </div>
        ) : favoritas.length === 0 ? (
          <div className="flex flex-col items-center text-center bg-white rounded-2xl border border-gray-100 py-16 px-6">
            <div className="w-16 h-16 bg-paleGreen/40 rounded-2xl flex items-center justify-center mb-4">
              <Heart size={28} className="text-deepGreen" aria-hidden="true" />
            </div>
            <p className="text-gray-700 font-SecondFont font-medium mb-2">
              Você ainda não favoritou nenhuma empresa
            </p>
            <button
              onClick={() => navigate("/pesquisa-de-vagas")}
              className="mt-2 text-deepGreen font-SecondFont font-semibold hover:text-mediumGreen transition-colors duration-200 underline underline-offset-4"
            >
              Ver vagas disponíveis
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {favoritas.map((favorita) => {
              const nomeEmpresa = favorita.empresa.fantasyName || favorita.empresa.name;

              return (
                <div
                  key={favorita.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 font-SecondFont cursor-pointer hover:border-mediumGreen/30 transition-colors duration-200 flex items-center justify-between gap-4"
                  onClick={() => navigate(`/empresa-publica/${favorita.empresaId}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-paleGreen/40 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {favorita.empresa.logoUrl ? (
                        <img src={favorita.empresa.logoUrl} alt={`Logo de ${nomeEmpresa}`} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={20} className="text-deepGreen" aria-hidden="true" />
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-deepGreen font-PrimaryFont">
                      {nomeEmpresa}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={(e) => handleRemover(favorita, e)}
                      disabled={removendoId === favorita.id}
                      className="flex items-center gap-2 text-sm text-gray-600 px-4 py-2 rounded-xl border border-gray-200 hover:border-red-300 hover:text-red-600 transition-colors duration-200 disabled:opacity-60"
                    >
                      <X size={16} aria-hidden="true" />
                      Remover
                    </button>
                    <ArrowRight size={18} className="text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
