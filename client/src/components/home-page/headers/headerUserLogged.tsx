import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, LogOut, ChevronRight, User, Search, Menu } from "lucide-react";
import { clearSession } from "../../../services/api";

const tabLabels: Record<string, string> = {
  "Perfil": "Perfil",
  "meus-dados": "Meus Dados",
  "endereco": "Endereço",
  "informacoes-login": "Informações de Login",
  "visualizar-curriculo": "Currículo",
  "informacoes-pessoais": "Informações Pessoais",
  "formacao-academica": "Formação Acadêmica",
  "experiencia-profissional": "Experiência Profissional",
  "idioma": "Idioma",
  "certificados": "Certificados",
  "diferenciais": "Diferenciais",
  "processos-seletivos": "Processos Seletivos",
  "importar-curriculo": "Importar Currículo",
};

const HeaderLogged = ({
  activeTab,
  onGoHome,
  onOpenMenu,
}: {
  activeTab?: string;
  onGoHome?: () => void;
  onOpenMenu?: () => void;
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const screenTitle = activeTab ? (tabLabels[activeTab] ?? activeTab) : "";

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 md:left-72 bg-white shadow-md py-3 px-4 sm:px-6 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMenu}
            aria-label="Abrir menu"
            className="md:hidden text-deepGreen p-1 -ml-1"
          >
            <Menu size={24} aria-hidden="true" />
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          {screenTitle && (
            <div className="flex items-center gap-2 text-gray-500 font-SecondFont text-sm">
              <button
                onClick={onGoHome}
                className="hover:text-deepGreen hover:underline underline-offset-2 transition-colors duration-200"
              >
                Início
              </button>
              <ChevronRight size={14} className="text-gray-400" />
              <span className="text-deepGreen font-medium">{screenTitle}</span>
            </div>
          )}
          <button
            onClick={() => navigate("/pesquisa-de-vagas")}
            className="flex items-center gap-2 border border-deepGreen text-deepGreen px-4 py-1.5 rounded-full
                       font-SecondFont text-sm hover:bg-deepGreen hover:text-white transition-all duration-200"
          >
            <Search size={14} />
            Buscar Vagas
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 bg-paleGreen text-deepGreen px-4 py-2 rounded-full
                       font-SecondFont font-medium text-sm hover:bg-mediumGreen hover:text-white
                       transition-all duration-200"
          >
            <User size={16} />
            <span className="hidden sm:inline">Minha Conta</span>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                <button
                  onClick={() => { navigate("/"); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-paleGreen/50
                             transition-colors font-SecondFont text-sm"
                >
                  <Home size={16} className="text-deepGreen" />
                  Página Inicial
                </button>
                <div className="border-t border-gray-100" />
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50
                             transition-colors font-SecondFont text-sm"
                >
                  <LogOut size={16} />
                  Sair da conta
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderLogged;
