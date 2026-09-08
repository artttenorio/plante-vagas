import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "@/pages/home-page";
import Login from "@/pages/login";
import RegisterUserOne from "@/pages/register/register-1";
import RegisterUserTwo from "@/pages/register/register-2";
import RegisterUserThree from "@/pages/register/register-3";
import JobPage from "@/pages/JobPage";
import SearchJobs from "@/pages/Serachjob";
import CompanyPublicProfile from "@/pages/CompanyPublicProfile";
import Profile from "@/pages/userCandidate";
import { RegisterProvider } from "@/components/register/RegisterContext";
import PrivateRoute from "./privateRoute";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/components/userCandidate/userContext";
import { RegisterProviderCompany } from "@/components/registerCompany/RegisterContextCompany";
import PageRegisterCompanyOne from "@/pages/registerCompany/register-1";
import PageRegisterCompanyTwo from "@/pages/registerCompany/register-2";
import CompanyProfile from "@/pages/companyProfile";
import EditCompanyProfile from "@/pages/companyProfile/editar";
import CompanySettings from "@/pages/companyProfile/configuracoes";
import CompanyVagas from "@/pages/companyVagas";
import ManagementProcess from "@/pages/managementProcess";
import Candidates from "@/pages/candidates";
import CandidateCurriculo from "@/pages/candidates/curriculo";
import { UserProviderCompany } from "@/components/company/userContextCompany";
import CreateVaga from "@/pages/createVaga";

export default function Router() {
  return (
    <BrowserRouter>
      <RegisterProvider>
        <RegisterProviderCompany>
          <Routes>
            {/* ROTAS PÚBLICAS */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pagina-vaga/:id" element={<JobPage />} />
            <Route path="/empresa-publica/:id" element={<CompanyPublicProfile />} />
            <Route path="/pesquisa-de-vagas" element={<SearchJobs />} />
            <Route path="/register" element={<RegisterUserOne />} />
            <Route path="/register-2" element={<RegisterUserTwo />} />
            <Route path="/register-3" element={<RegisterUserThree />} />
            <Route
              path="/register-company"
              element={<PageRegisterCompanyOne />}
            />
            <Route
              path="/register-company-2"
              element={<PageRegisterCompanyTwo />}
            />

            {/* ROTAS PROTEGIDAS - CANDIDATO */}
            <Route
              element={
                <UserProvider>
                  <PrivateRoute allowedRoles={["candidate"]} />
                </UserProvider>
              }
            >
              <Route path="/candidato/pagina-inicial" element={<Profile />} />
            </Route>

            {/* ROTAS PROTEGIDAS - EMPRESA */}
            <Route
              element={
                <UserProviderCompany>
                  <PrivateRoute allowedRoles={["company"]} />
                </UserProviderCompany>
              }
            >
              <Route path="/empresa" element={<CompanyProfile />} />
              <Route path="/empresa/editar" element={<EditCompanyProfile />} />
              <Route path="/empresa/configuracoes" element={<CompanySettings />} />
              <Route path="/vagas-empresa" element={<CompanyVagas />} />
              <Route
                path="/gerenciar-processo"
                element={<ManagementProcess />}
              />
              <Route path="/candidatos" element={<Candidates />} />
              <Route path="/candidatos/curriculo/:candidatoId" element={<CandidateCurriculo />} />
              <Route path="/criar-vaga" element={<CreateVaga />} />
            </Route>
          </Routes>
        </RegisterProviderCompany>
      </RegisterProvider>

      <Toaster />
    </BrowserRouter>
  );
}
