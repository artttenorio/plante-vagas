import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Menu, X, User, ChevronRight } from "lucide-react";

import logo from "../../../assets/images/logo.png";

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginClick = () => {
    if (token && userType === "candidate") {
      navigate("/candidato/pagina-inicial");
    } else if (token && userType === "company") {
      navigate("/empresa");
    } else {
      navigate("/login");
    }
  };

  const navLinks = [
    { label: "HOME", path: "/home" },
    { label: "VAGAS", path: "/pesquisa-de-vagas" },
    { label: "CONTATO", path: "#contato" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg py-2"
          : "bg-white shadow-md py-3"
      }`}
    >
      <div className="w-full flex items-center justify-between max-w-[1600px] mx-auto px-6">
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer group"
          onClick={() => navigate("/home")}
        >
          <img
            src={logo}
            alt="Logo"
            className="h-12 transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8 font-SecondFont">
          {navLinks.map((link) => (
            <a
              key={link.label}
              onClick={() => link.path.startsWith("/") && navigate(link.path)}
              href={link.path.startsWith("#") ? link.path : undefined}
              className="relative text-deepGreen font-medium text-sm tracking-wide cursor-pointer
                         hover:text-mediumGreen transition-colors duration-300
                         after:content-[''] after:absolute after:bottom-[-4px] after:left-0
                         after:w-0 after:h-[2px] after:bg-mediumGreen after:transition-all after:duration-300
                         hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Login Button - Desktop */}
        <div className="hidden lg:flex items-center space-x-3">
          <button
            onClick={handleLoginClick}
            className="flex items-center space-x-2 border border-deepGreen text-deepGreen px-5 py-2.5 rounded-full
                       font-SecondFont font-medium text-sm tracking-wide
                       hover:bg-deepGreen hover:text-white transition-colors duration-300"
          >
            <User size={16} />
            <span>{token ? "MEU PERFIL" : "ENTRAR"}</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-paleGreen transition-colors duration-200"
        >
          {isMenuOpen ? (
            <X size={28} className="text-deepGreen" />
          ) : (
            <Menu size={28} className="text-deepGreen" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl
                    transition-all duration-300 overflow-hidden ${
                      isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    }`}
      >
        <nav className="flex flex-col py-4">
          {navLinks.map((link, index) => (
            <a
              key={link.label}
              onClick={() => {
                if (link.path.startsWith("/")) navigate(link.path);
                setIsMenuOpen(false);
              }}
              href={link.path.startsWith("#") ? link.path : undefined}
              className="flex items-center justify-between px-6 py-4 text-deepGreen font-SecondFont
                         font-medium hover:bg-paleGreen/50 transition-colors duration-200 cursor-pointer
                         border-b border-gray-100 last:border-b-0"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span>{link.label}</span>
              <ChevronRight size={18} className="text-mediumGreen" />
            </a>
          ))}
          <div className="px-6 py-4 mt-2">
            <button
              onClick={() => {
                handleLoginClick();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 bg-deepGreen text-white
                         px-5 py-3 rounded-full font-SecondFont font-medium
                         hover:bg-mediumGreen transition-colors duration-300"
            >
              <User size={18} />
              <span>{token ? "MEU PERFIL" : "ENTRAR"}</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
