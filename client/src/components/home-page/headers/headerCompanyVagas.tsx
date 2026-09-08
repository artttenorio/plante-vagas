import { useNavigate } from "react-router-dom";
import logo from "../../../assets/images/logo.png";

const HeaderLogged = () => {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md py-3 px-4 sm:px-6 z-30 ">
      <div className="container mx-auto flex items-center justify-between flex-wrap">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="h-12"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          />
        </div>
        <p> INÍCIO </p>
        <p> Perfil </p>
      </div>
    </header>
  );
};

export default HeaderLogged;
