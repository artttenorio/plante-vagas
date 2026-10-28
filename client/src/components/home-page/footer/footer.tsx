import { useNavigate } from "react-router";
import { MapPin, Phone, Mail, Instagram, Linkedin, Facebook, Send, Leaf, ArrowRight } from "lucide-react";
import logo from "../../../assets/images/logo.png";

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", path: "/home" },
    { label: "Sobre o Agro", path: "#sobre" },
    { label: "Serviços", path: "#servico" },
    { label: "Vagas", path: "/pesquisa-de-vagas" },
    { label: "Contato", path: "#contato" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Facebook, href: "#", label: "Facebook" },
  ];

  return (
    <footer id="contato" className="bg-deepGreen">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt="Logo" className="h-12 brightness-0 invert" />
            </div>
            <p className="text-white/80 font-SecondFont text-sm leading-relaxed mb-6">
              Conectando talentos às melhores oportunidades do agronegócio brasileiro.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/10
                           flex items-center justify-center transition-colors duration-300"
                >
                  <social.icon size={18} className="text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-white font-SecondFont font-bold text-lg mb-6 flex items-center gap-2">
              <Leaf size={18} className="text-paleGreen" />
              Contato
            </h3>
            <div className="space-y-4">
              <a
                href="#"
                className="flex items-start gap-3 text-white/80 hover:text-white
                         transition-colors duration-300 font-SecondFont text-sm group"
              >
                <MapPin size={18} className="text-paleGreen flex-shrink-0 mt-0.5" />
                <span>Rua Dolores Florenzano Vidal, Vila Nunes - Lorena/SP</span>
              </a>
              <a
                href="tel:+5511989879293"
                className="flex items-center gap-3 text-white/80 hover:text-white
                         transition-colors duration-300 font-SecondFont text-sm"
              >
                <Phone size={18} className="text-paleGreen flex-shrink-0" />
                <span>(11) 9898-9293</span>
              </a>
              <a
                href="mailto:plantio@contato.com"
                className="flex items-center gap-3 text-white/80 hover:text-white
                         transition-colors duration-300 font-SecondFont text-sm"
              >
                <Mail size={18} className="text-paleGreen flex-shrink-0" />
                <span>plantio@contato.com</span>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-white font-SecondFont font-bold text-lg mb-6">
              Acesso Rápido
            </h3>
            <nav className="space-y-3">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  onClick={() => link.path.startsWith("/") && navigate(link.path)}
                  href={link.path.startsWith("#") ? link.path : undefined}
                  className="group flex items-center gap-2 text-white/80 hover:text-white
                           transition-colors duration-300 font-SecondFont text-sm cursor-pointer"
                >
                  <ArrowRight
                    size={14}
                    className="text-paleGreen opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0
                             transition-all duration-300"
                  />
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-white font-SecondFont font-bold text-lg mb-6">
              Newsletter
            </h3>
            <p className="text-white/80 font-SecondFont text-sm mb-4">
              Receba informações sobre novas vagas e oportunidades no agronegócio.
            </p>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  className="w-full p-4 pr-12 bg-white/10 border border-white/20 rounded-xl
                           focus:outline-none focus:border-paleGreen
                           text-white placeholder-white/50 font-SecondFont text-sm
                           transition-colors duration-300"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-paleGreen
                           flex items-center justify-center
                           hover:bg-white transition-colors duration-300 group"
                >
                  <Send size={16} className="text-deepGreen" />
                </button>
              </div>
              <button
                className="w-full bg-paleGreen text-deepGreen rounded-xl px-6 py-3
                         font-SecondFont font-semibold hover:bg-white transition-colors duration-300"
              >
                INSCREVER-SE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/80 font-SecondFont text-sm text-center md:text-left">
              {currentYear} Plante Vagas. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <a
                onClick={() => navigate("/termos-de-uso")}
                className="text-white/80 hover:text-white font-SecondFont text-sm transition-colors duration-300 cursor-pointer"
              >
                Termos de Uso
              </a>
              <a
                onClick={() => navigate("/privacidade")}
                className="text-white/80 hover:text-white font-SecondFont text-sm transition-colors duration-300 cursor-pointer"
              >
                Privacidade
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
