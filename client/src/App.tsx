import { useEffect } from "react";
import "./App.css";
import "./tailwind.css";
import Router from "./routes";
import { clearSession, isSessionInactive, recordActivity } from "./services/api";

function App() {
  useEffect(() => {
    recordActivity();
    const eventos = ["mousedown", "keydown", "scroll", "touchstart"];
    eventos.forEach((evento) => window.addEventListener(evento, recordActivity));

    const intervalo = setInterval(() => {
      if (isSessionInactive()) {
        clearSession();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }, 60 * 1000);

    return () => {
      eventos.forEach((evento) => window.removeEventListener(evento, recordActivity));
      clearInterval(intervalo);
    };
  }, []);

  return <Router />;
}

export default App;
