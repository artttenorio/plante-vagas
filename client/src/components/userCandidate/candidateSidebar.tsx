import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Search, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useUser } from "./userContext";
import { clearSession } from "@/services/api";
import logo from "../../assets/images/logo.png";

export type SidebarSubItem = {
  value: string;
  title: string;
  icon?: LucideIcon;
};

export type SidebarSection = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: SidebarSubItem[];
};

type Props = {
  sections: SidebarSection[];
  activeTab: string;
  onSelectTab: (value: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export default function CandidateSidebar({ sections, activeTab, onSelectTab, mobileOpen, onCloseMobile }: Props) {
  const navigate = useNavigate();
  const { UserData } = useUser();
  const { user } = UserData;

  const activeSectionId =
    sections.find((s) => (s.items.length > 0 ? s.items.some((i) => i.value === activeTab) : s.id === activeTab))
      ?.id ?? sections[0]?.id;
  const [openSection, setOpenSection] = useState(activeSectionId);

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onCloseMobile} />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-paleGreen text-deepGreen flex flex-col z-50
                   transition-transform duration-300 ease-in-out
                   ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo + close (mobile) */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-deepGreen/15">
          <img
            src={logo}
            alt="Plante Vagas"
            className="h-12 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <button onClick={onCloseMobile} className="md:hidden text-deepGreen/70 hover:text-deepGreen">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-deepGreen/15">
          <div className="w-10 h-10 rounded-full bg-deepGreen text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.name || "—"}</p>
            <p className="text-xs text-deepGreen/70 truncate">{user.email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {sections.map((section) => {
            const isOpen = openSection === section.id;
            const hasItems = section.items.length > 0;

            return (
              <div key={section.id}>
                <button
                  onClick={() => {
                    if (hasItems) {
                      setOpenSection(isOpen ? "" : section.id);
                    } else {
                      onSelectTab(section.items[0]?.value ?? section.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    activeSectionId === section.id ? "bg-deepGreen/10 text-deepGreen" : "text-deepGreen/80 hover:bg-deepGreen/5 hover:text-deepGreen"
                  }`}
                >
                  <section.icon size={18} aria-hidden="true" />
                  <span className="flex-1 text-left">{section.label}</span>
                  {hasItems && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  )}
                </button>

                {hasItems && isOpen && (
                  <div className="mt-1 ml-4 pl-4 border-l border-deepGreen/15 space-y-0.5">
                    {section.items.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => onSelectTab(item.value)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                          activeTab === item.value
                            ? "bg-deepGreen text-white font-medium"
                            : "text-deepGreen/70 hover:bg-deepGreen/5 hover:text-deepGreen"
                        }`}
                      >
                        {item.icon && <item.icon size={14} aria-hidden="true" />}
                        <span className="text-left">{item.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-deepGreen/15 space-y-2">
          <button
            onClick={() => navigate("/pesquisa-de-vagas")}
            className="w-full flex items-center justify-center gap-2 bg-deepGreen text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-mediumGreen transition-colors duration-200"
          >
            <Search size={16} aria-hidden="true" />
            Buscar Vagas
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-deepGreen/70 hover:text-deepGreen py-2 text-sm transition-colors duration-200"
          >
            <LogOut size={16} aria-hidden="true" />
            Sair da conta
          </button>
        </div>
      </aside>
    </>
  );
}
