import { useNavigate } from "react-router-dom";
import { useRegister } from "./RegisterContextCompany";
import { useState } from "react";
import { FileText, Phone, Calendar, Building2, MapPin, ArrowRight, Loader2 } from "lucide-react";

import { phoneMask } from "../masks/phoneMask";
import { toast } from "sonner";

import { cnpjMask } from "../masks/cnpjMask";
import { cepMask } from "../masks/cepMask";
import { BASE_URL, setSession } from "../../services/api";

const RegisterCompanyTwo = () => {
  const navigate = useNavigate();
  const { formData } = useRegister();

  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [socialReason, setSocialReason] = useState("");
  const [openingDate, setOpeningDate] = useState("");
  const [fantasyName, setFantasyName] = useState("");

  // Campos de endereço
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);

  const handleCnpjChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = cnpjMask(e.target.value);
    setCnpj(masked);
    const cleaned = masked.replace(/\D/g, "");
    if (cleaned.length === 14) {
      setCnpjLoading(true);
      try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleaned}`);
        if (!res.ok) {
          toast.error("CNPJ não encontrado");
          return;
        }
        const data = await res.json();
        if (data.razao_social) setSocialReason(data.razao_social);
        if (data.nome_fantasia) setFantasyName(data.nome_fantasia);
        if (data.data_inicio_atividade) setOpeningDate(data.data_inicio_atividade);
        toast.success("Dados da empresa preenchidos automaticamente", {
          description: "Você pode editar qualquer campo antes de continuar",
          duration: 3000,
        });
      } catch {
        toast.error("Erro ao buscar dados do CNPJ");
      } finally {
        setCnpjLoading(false);
      }
    }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = cepMask(e.target.value);
    setCep(masked);
    const cleaned = masked.replace("-", "");
    if (cleaned.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
        const data = await res.json();
        if (data.erro) {
          toast.error("CEP não encontrado");
        } else {
          setStreet(data.logradouro || "");
          setDistrict(data.bairro || "");
          setCity(data.localidade || "");
          setState(data.uf || "");
        }
      } catch {
        toast.error("Erro ao buscar CEP");
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (
      !name ||
      !cnpj ||
      !phone ||
      !openingDate ||
      !socialReason ||
      !fantasyName ||
      !cep ||
      !street ||
      !number ||
      !district ||
      !city ||
      !state
    ) {
      toast.error("Preencha todos os campos para avançar", {
        description:
          "Todos os campos a seguir devem ser preenchidos para realizar o cadastro",
        duration: 3000,
      });
      return;
    }

    if (!consent) {
      toast.error("É necessário aceitar os termos para continuar", {
        description: "Confirme que você leu os Termos de Uso e a Política de Privacidade",
        duration: 3000,
      });
      return;
    }

    setSubmitting(true);
    const payload = {
      email: formData.email,
      password: formData.password,
      name: name,
      openingDate: new Date(openingDate).toISOString(),
      cnpj: cnpj,
      phone: phone,
      socialReason: socialReason,
      fantasyName: fantasyName,
      description: "",
      address: {
        postalCode: cep,
        street: street,
        number: number,
        complement: complement,
        district: district,
        city: city,
        state: state,
        country: "Brasil",
      },
    };

    try {
      const response = await fetch(`${BASE_URL}/company/singup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Cadastro realizado com sucesso", {
          duration: 3000,
        });

        try {
          const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: formData.email, password: formData.password }),
          });

          if (loginRes.ok) {
            const session = await loginRes.json();
            setSession(session);
            navigate("/empresa");
            return;
          }
        } catch {
          // se o login automático falhar, cai no fallback abaixo
        }

        navigate("/login");
      } else {
        toast.error("Erro ao realizar cadastro", {
          description: result.message,
          duration: 3000,
        });
      }
    } catch (error: any) {
      toast.error("Erro ao realizar cadastro", {
        description: error?.message ?? "Não foi possível conectar ao servidor",
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent transition-all duration-300";
  const plainInputClass =
    "w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mediumGreen focus:border-transparent transition-all duration-300";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-xl
               border border-white/50 font-SecondFont text-gray-800"
    >
      <div className="text-center mb-8">
        <p className="uppercase text-xs tracking-[0.2em] text-mediumGreen font-semibold mb-3">
          Passo 2 de 2
        </p>
        <h2 className="text-2xl font-bold text-deepGreen font-PrimaryFont">Dados da empresa</h2>
        <p className="text-gray-600 mt-2">Preencha os dados oficiais da sua empresa</p>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="nome" className={labelClass}>
            Nome da Empresa
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Building2 size={20} aria-hidden="true" />
            </div>
            <input
              type="text"
              id="nome"
              name="nome"
              autoComplete="organization"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da empresa"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="cnpj" className={labelClass}>
            CNPJ
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <FileText size={20} aria-hidden="true" />
            </div>
            <input
              type="text"
              id="cnpj"
              name="cnpj"
              value={cnpj}
              onChange={handleCnpjChange}
              placeholder="00.000.000/0000-00"
              className={inputClass}
            />
            {cnpjLoading && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                Buscando...
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Preenchemos razão social, nome fantasia e data de abertura automaticamente — você pode editar se quiser.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="telephone" className={labelClass}>
              Telefone/Celular
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone size={20} aria-hidden="true" />
              </div>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(phoneMask(e.target.value))}
                placeholder="99 99999-9999"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="date" className={labelClass}>
              Data de abertura
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Calendar size={20} aria-hidden="true" />
              </div>
              <input
                type="date"
                id="date"
                name="date"
                value={openingDate}
                onChange={(e) => setOpeningDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="social-reason" className={labelClass}>
              Razão Social
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Building2 size={20} aria-hidden="true" />
              </div>
              <input
                type="text"
                id="social-reason"
                name="social-reason"
                autoComplete="organization"
                value={socialReason}
                onChange={(e) => setSocialReason(e.target.value)}
                placeholder="Razão social"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="fantasy-name" className={labelClass}>
              Nome fantasia
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Building2 size={20} aria-hidden="true" />
              </div>
              <input
                type="text"
                id="fantasy-name"
                name="fantasy-name"
                value={fantasyName}
                onChange={(e) => setFantasyName(e.target.value)}
                placeholder="Nome fantasia"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Seção de Endereço */}
        <div className="pt-2">
          <div className="flex items-center gap-2 text-deepGreen font-semibold mb-4">
            <MapPin size={18} aria-hidden="true" />
            <h3 className="font-PrimaryFont text-lg">Endereço da Empresa</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="cep" className={labelClass}>
                CEP
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="cep"
                  name="cep"
                  autoComplete="postal-code"
                  value={cep}
                  onChange={handleCepChange}
                  placeholder="00000-000"
                  className={plainInputClass}
                />
                {cepLoading && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    Buscando...
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-5">
              <div>
                <label htmlFor="street" className={labelClass}>
                  Rua
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  autoComplete="address-line1"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Nome da rua"
                  className={plainInputClass}
                />
              </div>
              <div>
                <label htmlFor="number" className={labelClass}>
                  Número
                </label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Nº"
                  className={plainInputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="complement" className={labelClass}>
                Complemento (opcional)
              </label>
              <input
                type="text"
                id="complement"
                name="complement"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                placeholder="Sala, andar, etc."
                className={plainInputClass}
              />
            </div>

            <div>
              <label htmlFor="district" className={labelClass}>
                Bairro
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Nome do bairro"
                className={plainInputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="city" className={labelClass}>
                  Cidade
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Nome da cidade"
                  className={plainInputClass}
                />
              </div>
              <div>
                <label htmlFor="state" className={labelClass}>
                  Estado
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  autoComplete="address-level1"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="UF"
                  className={plainInputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Consentimento LGPD */}
        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            id="consent"
            name="consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 w-4 h-4 accent-deepGreen"
          />
          <label htmlFor="consent" className="text-sm text-gray-700">
            Li e aceito os{" "}
            <a href="/termos-de-uso" target="_blank" rel="noopener noreferrer" className="text-deepGreen underline">
              Termos de Uso
            </a>{" "}
            e a{" "}
            <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-deepGreen underline">
              Política de Privacidade
            </a>
            , e autorizo o tratamento dos meus dados conforme a LGPD.
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="w-full flex items-center justify-center gap-2 bg-deepGreen text-white
                   py-4 rounded-xl font-semibold text-lg
                   hover:bg-mediumGreen transition-colors duration-300
                   disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 size={20} className="animate-spin" aria-hidden="true" />
              Cadastrando...
            </>
          ) : (
            <>
              CADASTRAR-SE
              <ArrowRight size={20} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default RegisterCompanyTwo;
