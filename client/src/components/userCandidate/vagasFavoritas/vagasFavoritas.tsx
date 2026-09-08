import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Loader2, Building2, X } from "lucide-react";
import { toast } from "sonner";
import { getMinhasVagasFavoritas, desfavoritarVaga, type VagaFavoritada } from "@/services/favoritosVaga";

export default function VagasFavoritas() {
  const navigate = useNavigate();
  const [favoritas, setFavoritas] = useState<VagaFavoritada[]>([]);
  const [loading, setLoading] = useState(true);
  const [removendoId, setRemovendoId] = useState<number | null>(null);

  useEffect(() => {
    getMinhasVagasFavoritas()
      .then(setFavoritas)
      .finally(() => setLoading(false));
  }, []);

  const handleRemover = async (favorita: VagaFavoritada, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemovendoId(favorita.id);
    try {
      await desfavoritarVaga(favorita.vagaId);
      setFavoritas((prev) => prev.filter((f) => f.id !== favorita.id));
      toast.success("Vaga removida dos salvos");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao remover vaga salva");
    } finally {
      setRemovendoId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-deepGreen font-PrimaryFont mb-6">
          Vagas salvas
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-SecondFont">
            <Loader2 size={32} className="animate-spin text-mediumGreen mb-3" aria-hidden="true" />
            Carregando...
          </div>
        ) : favoritas.length === 0 ? (
          <div className="flex flex-col items-center text-center bg-white rounded-xl border border-gray-200 py-16 px-6">
            <div className="w-16 h-16 bg-paleGreen/40 rounded-2xl flex items-center justify-center mb-4">
              <Bookmark size={28} className="text-deepGreen" aria-hidden="true" />
            </div>
            <p className="text-gray-700 font-SecondFont font-medium mb-2">
              Você ainda não salvou nenhuma vaga
            </p>
            <button
              onClick={() => navigate("/pesquisa-de-vagas")}
              className="mt-2 text-deepGreen font-SecondFont font-semibold hover:text-mediumGreen transition-colors duration-200 underline underline-offset-4"
            >
              Ver vagas disponíveis
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {favoritas.map((favorita) => {
              const { vaga } = favorita;
              const nomeEmpresa = vaga.empresa.fantasyName || vaga.empresa.name;
              const encerrada = vaga.status !== "aberta";

              return (
                <div
                  key={favorita.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 font-SecondFont cursor-pointer hover:border-deepGreen/40 transition-colors duration-200 flex items-center justify-between gap-4"
                  onClick={() => navigate(`/pagina-vaga/${vaga.id}`)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {vaga.empresa.logoUrl ? (
                        <img src={vaga.empresa.logoUrl} alt={`Logo de ${nomeEmpresa}`} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={16} className="text-gray-400" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-deepGreen font-PrimaryFont truncate">
                        {vaga.nome}
                      </h2>
                      <p className="text-gray-500 text-sm mt-0.5 truncate">
                        {nomeEmpresa}
                        {encerrada && <span className="text-gray-400"> · vaga encerrada</span>}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleRemover(favorita, e)}
                    disabled={removendoId === favorita.id}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-600 transition-colors duration-200 flex-shrink-0 disabled:opacity-60"
                  >
                    <X size={14} aria-hidden="true" />
                    Remover
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
