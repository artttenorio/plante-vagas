import { useNavigate } from "react-router-dom";
import { useRegister } from "./RegisterContext";
import { useState } from "react";
import { BASE_URL } from "../../services/api";

const RegisterThree = () => {
  const navigate = useNavigate();
  const { formData } = useRegister();

  const [cep, setCep] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [complement, setComplement] = useState("");
  const [consent, setConsent] = useState(false);

  const handleSubmit = async () => {
    if (!cep || !district || !city || !street || !postalCode) {
      alert("Prencha todos os campos obrigatórios para poder cadastrar ");
    } else if (!consent) {
      alert("É necessário aceitar os Termos de Uso e a Política de Privacidade para cadastrar");
    } else {
      const payload = {
        userData: {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          dateNasc: new Date(formData.dateNasc).toISOString(),
          cpf: formData.cpf,
          phone: formData.phone,
          gender: formData.gender,
          disablePerson: formData.disablePerson,
        },

        addressInfo: {
          city: city,
          district: district,
          street: street,
          number: postalCode,
          complement: complement,
          postalCode: cep,
          country: "Brasil",
          state: "PR",
        },
      };

      try {
        const response = await fetch(`${BASE_URL}/users/singup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
          alert("Cadastro Realizado com sucesso");
          navigate("/login");
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error("Erro no cadastro:", error);
      }
    }
  };

  return (
    <>
      <div className="grid bg-white p-6 sm:p-12 rounded-lg shadow-md font-SecondFont max-w-full mx-auto">
        <h1 className="text-xl  ">Passo 3 de 3</h1>

        <div className="grid mt-6">
          <label htmlFor="CEP" className="text-start text-lg mt-2 mb-2">
            CEP
          </label>
          <input
            type="text"
            id="CEP"
            name="CEP"
            onChange={(e) => {
              setCep(e.target.value);
            }}
            placeholder="Insira seu CEP aqui."
            className="border-2 border-deepGreen rounded-lg shadow-md p-3 pl-3 text-MediumGray bg-LightGray"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="grid mt-6 mb-3">
            <label htmlFor="Bairro" className="text-start text-lg mt-2 mb-2">
              Bairro
            </label>
            <input
              type="text"
              id="Bairro"
              name="Bairro"
              onChange={(e) => {
                setDistrict(e.target.value);
              }}
              placeholder="Insira seu bairro aqui."
              className="border-2 border-deepGreen rounded-lg shadow-md p-3 pl-3 text-MediumGray bg-LightGray"
            />
          </div>
          <div className="grid mt-6 mb-3">
            <label htmlFor="Cidade" className="text-start text-lg mt-2 mb-2">
              Cidade
            </label>
            <input
              type="text"
              id="Cidade"
              name="Cidade"
              onChange={(e) => {
                setCity(e.target.value);
              }}
              placeholder="Insira sua Cidade aqui."
              className="border-2 border-deepGreen rounded-lg shadow-md p-3 pl-3 text-MediumGray bg-LightGray"
            />
          </div>
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-4 mt-3">
          <div className="grid mt-6 mb-3">
            <label htmlFor="Endereço" className="text-start text-lg mt-2 mb-2">
              Endereço
            </label>
            <input
              type="text"
              id="Endereço"
              name="Endereço"
              onChange={(e) => {
                setStreet(e.target.value);
              }}
              placeholder="Insira seu endereço aqui."
              className="border-2 border-deepGreen rounded-lg shadow-md p-3 pl-3 text-MediumGray bg-LightGray"
            />
          </div>
          <div className="grid mt-6 mb-3">
            <label htmlFor="Número" className="text-start text-lg mt-2 mb-2">
              Número
            </label>
            <input
              type="text"
              id="Número"
              name="Número"
              onChange={(e) => {
                setPostalCode(e.target.value);
              }}
              placeholder="N° residencial"
              className="border-2 border-deepGreen rounded-lg shadow-md p-3 pl-3 text-black bg-LightGray"
            />
          </div>
        </div>

        <div className="grid mt-6 mb-3">
          <label htmlFor="Número" className="text-start text-lg mt-2 mb-2">
            Complemento
          </label>
          <input
            type="text"
            id="Complemento"
            name="Complemento"
            onChange={(e) => {
              setComplement(e.target.value);
            }}
            placeholder="Informe o complemento (opcional)."
            className="border-2 border-deepGreen rounded-lg shadow-md p-3 pl-3 text-black bg-LightGray"
          />
        </div>

        <div className="flex items-start gap-3 mt-6 mb-2 max-w-md mx-auto">
          <input
            type="checkbox"
            id="consent"
            name="consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 w-4 h-4 accent-deepGreen"
          />
          <label htmlFor="consent" className="text-sm text-gray-700 text-start">
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

        <div className="grid justify-center">
          <button
            onClick={handleSubmit}
            type="submit"
            className="w-80 h-14 bg-deepGreen text-lg sm:text-xl text-white px-2 sm:px-4 py-1 sm:py-1 rounded-lg hover:bg-mediumGreen font-SecondFont mt-12 mb-4"
          >
            CADASTRE-SE
          </button>
        </div>
      </div>
    </>
  );
};

export default RegisterThree;
