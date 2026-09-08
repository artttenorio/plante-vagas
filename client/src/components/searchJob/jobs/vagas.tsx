import { useNavigate } from "react-router-dom";
import { Clock, Briefcase, DollarSign, ArrowRight, Building2, Tag } from "lucide-react";
import { timeAgo } from "@/utils/timeAgo";

const Vagas = (props: {
  id: number;
  nome: string;
  cargo: string;
  salario?: number;
  descricao: string;
  beneficios: { id: number; nome: string }[];
  empresa?: { id: number; fantasyName: string; name: string; logoUrl?: string | null };
  createdAt: string;
}) => {
  const navigate = useNavigate();
  const nomeEmpresa = props.empresa?.fantasyName || props.empresa?.name;
  const irParaEmpresa = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (props.empresa?.id) navigate(`/empresa-publica/${props.empresa.id}`);
  };

  return (
    <div
      className="group bg-white p-6 md:p-8 rounded-2xl shadow-md hover:shadow-xl
               border border-gray-100 hover:border-mediumGreen/30
               transition-all duration-300 flex flex-col md:flex-row gap-6 max-w-4xl mx-auto"
    >
      {/* Company Logo */}
      <div className="flex-shrink-0 flex justify-center md:justify-start">
        <button
          type="button"
          onClick={irParaEmpresa}
          disabled={!props.empresa?.id}
          title={nomeEmpresa ? `Ver perfil de ${nomeEmpresa}` : undefined}
          className="w-24 h-24 md:w-28 md:h-28 bg-gray-50 rounded-2xl flex items-center justify-center
                      border border-gray-100 group-hover:border-mediumGreen/30 transition-colors duration-300 overflow-hidden
                      disabled:cursor-default"
        >
          {props.empresa?.logoUrl ? (
            <img src={props.empresa.logoUrl} alt={nomeEmpresa ? `Logo de ${nomeEmpresa}` : "Logo da empresa"} className="w-full h-full object-cover" />
          ) : (
            <Building2 size={40} className="text-gray-300" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 text-center md:text-left">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-deepGreen font-PrimaryFont group-hover:text-mediumGreen transition-colors duration-300">
            {props.nome}
          </h2>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-3 text-gray-600 font-SecondFont text-sm">
            {nomeEmpresa && (
              <button
                type="button"
                onClick={irParaEmpresa}
                disabled={!props.empresa?.id}
                className="flex items-center gap-2 hover:text-deepGreen hover:underline transition-colors duration-200 disabled:no-underline disabled:cursor-default disabled:hover:text-gray-600"
              >
                <Building2 size={16} className="text-mediumGreen" />
                {nomeEmpresa}
              </button>
            )}
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-mediumGreen" />
              Postada há {timeAgo(props.createdAt)}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 bg-paleGreen text-deepGreen px-3 py-1.5 rounded-full text-xs font-SecondFont font-medium">
            <Briefcase size={14} />
            {props.cargo}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-SecondFont font-medium">
            <DollarSign size={14} />
            {props.salario ? `R$ ${props.salario.toLocaleString("pt-BR")}` : "A combinar"}
          </span>
          {props.beneficios.map((beneficio) => (
            <span
              key={beneficio.id}
              className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-SecondFont font-medium"
            >
              <Tag size={14} />
              {beneficio.nome}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm font-SecondFont leading-relaxed line-clamp-2">
          {props.descricao}
        </p>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-center md:justify-end">
        <button
          onClick={() => navigate(`/pagina-vaga/${props.id}`)}
          className="group/btn flex items-center gap-2 bg-deepGreen text-white px-6 py-3 rounded-xl
                   font-SecondFont font-semibold hover:bg-mediumGreen transition-all duration-300
                   hover:shadow-lg hover:shadow-deepGreen/20 w-full md:w-auto justify-center"
        >
          VER VAGA
          <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default Vagas;
