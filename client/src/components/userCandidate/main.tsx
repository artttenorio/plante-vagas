import { useState } from "react";
import CandidateSidebar, { type SidebarSection } from "./candidateSidebar";
import HeaderLogged from "../home-page/headers/headerUserLogged";
import ProfileCard from "./profile/profilecard";
import MyData from "./profile/myData";
import Address from "./profile/address";
import InfoLogin from "./profile/infoLogin";
import PersonalInfo from "./curriculum/infoPersonal";
import CurriculumView from "./curriculum/curriculumView";
import AcademicInfo from "./curriculum/infoAcademic";
import Language from "./curriculum/language";
import ProfessionalInfo from "./curriculum/infoProfessional";
import Certificate from "./curriculum/certificates";
import Differentiate from "./curriculum/differentiate";
import OperacaoAgricola from "./curriculum/operacaoAgricola";
import OperacaoPecuaria from "./curriculum/operacaoPecuaria";
import OperacaoFlorestal from "./curriculum/operacaoFlorestal";
import Culturas from "./curriculum/culturas";
import Maquinas from "./curriculum/maquinas";
import Tecnologias from "./curriculum/tecnologias";
import SelectionProcess from "./selectionProcess/selectionProcess";
import Favoritos from "./favoritos/favoritos";
import VagasFavoritas from "./vagasFavoritas/vagasFavoritas";
import ImportCurriculum from "./curriculum/importCurriculum";
import { CurriculumProvider } from "./curriculumContext";
import {
  User,
  Clipboard,
  ClipboardList,
  Heart,
  Bookmark,
  IdCard,
  MapPin,
  KeyRound,
  Eye,
  Upload,
  GraduationCap,
  Briefcase,
  Languages,
  Award,
  Star,
  Tractor,
  PawPrint,
  TreePine,
  Wheat,
  Wrench,
  Cpu,
} from "lucide-react";

const SECTIONS: SidebarSection[] = [
  {
    id: "perfil",
    label: "Perfil",
    icon: User,
    items: [
      { value: "meus-dados", title: "Meus Dados", icon: IdCard },
      { value: "endereco", title: "Endereço", icon: MapPin },
      { value: "informacoes-login", title: "Informações de login", icon: KeyRound },
    ],
  },
  {
    id: "curriculo",
    label: "Currículo",
    icon: Clipboard,
    items: [
      { value: "visualizar-curriculo", title: "Visualizar Currículo", icon: Eye },
      { value: "importar-curriculo", title: "Importar PDF", icon: Upload },
      { value: "informacoes-pessoais", title: "Informações Pessoais", icon: IdCard },
      { value: "formacao-academica", title: "Formação Acadêmica", icon: GraduationCap },
      { value: "experiencia-profissional", title: "Experiência Profissional", icon: Briefcase },
      { value: "idioma", title: "Idioma", icon: Languages },
      { value: "certificados", title: "Certificados", icon: Award },
      { value: "diferenciais", title: "Diferenciais", icon: Star },
      { value: "operacoes-agricolas", title: "Operações Agrícolas", icon: Tractor },
      { value: "operacoes-pecuarias", title: "Operações Pecuárias", icon: PawPrint },
      { value: "operacoes-florestais", title: "Operações Florestais", icon: TreePine },
      { value: "culturas", title: "Culturas", icon: Wheat },
      { value: "maquinas", title: "Máquinas", icon: Wrench },
      { value: "tecnologias", title: "Tecnologias", icon: Cpu },
    ],
  },
  {
    id: "processos-seletivos",
    label: "Processos Seletivos",
    icon: ClipboardList,
    items: [],
  },
  {
    id: "empresas-favoritas",
    label: "Empresas Favoritas",
    icon: Heart,
    items: [],
  },
  {
    id: "vagas-salvas",
    label: "Vagas Salvas",
    icon: Bookmark,
    items: [],
  },
];

export default function Page() {
  const [activeTab, setActiveTab] = useState("Perfil");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelectTab = (value: string) => {
    setActiveTab(value);
    setMobileOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Perfil":
        return <ProfileCard />;
      case "meus-dados":
        return <MyData />;
      case "endereco":
        return <Address />;
      case "informacoes-login":
        return <InfoLogin />;
      case "visualizar-curriculo":
        return (
          <CurriculumView
            onCreate={() => setActiveTab("formacao-academica")}
            onImport={() => setActiveTab("importar-curriculo")}
          />
        );
      case "informacoes-pessoais":
        return <PersonalInfo />;
      case "formacao-academica":
        return <AcademicInfo />;
      case "experiencia-profissional":
        return <ProfessionalInfo />;
      case "idioma":
        return <Language />;
      case "certificados":
        return <Certificate />;
      case "diferenciais":
        return <Differentiate />;
      case "operacoes-agricolas":
        return <OperacaoAgricola />;
      case "operacoes-pecuarias":
        return <OperacaoPecuaria />;
      case "operacoes-florestais":
        return <OperacaoFlorestal />;
      case "culturas":
        return <Culturas />;
      case "maquinas":
        return <Maquinas />;
      case "tecnologias":
        return <Tecnologias />;
      case "processos-seletivos":
        return <SelectionProcess />;
      case "empresas-favoritas":
        return <Favoritos />;
      case "vagas-salvas":
        return <VagasFavoritas />;
      case "importar-curriculo":
        return <ImportCurriculum />;
      default:
        return;
    }
  };

  return (
    <CurriculumProvider>
      <CandidateSidebar
        sections={SECTIONS}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="md:ml-72">
        <header>
          <HeaderLogged
            activeTab={activeTab}
            onGoHome={() => handleSelectTab("Perfil")}
            onOpenMenu={() => setMobileOpen(true)}
          />
        </header>

        <div className="pt-20 w-full">{renderContent()}</div>
      </div>
    </CurriculumProvider>
  );
}
