export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type Session = {
  accessToken: string;
  userType?: string;
  userId?: string | number;
};

export function getToken() {
  return localStorage.getItem("token");
}

export function getUserType() {
  return localStorage.getItem("userType");
}

/**
 * Ações que só o candidato consome (candidatar-se, salvar vaga, favoritar
 * empresa). Visitante deslogado continua vendo — o botão leva pro login.
 * Quem está logado como empresa não vê, porque a API recusaria mesmo.
 */
export function podeUsarAcoesDeCandidato() {
  return getUserType() !== "company";
}

/** Espelho do acima: ações que só a empresa consome. */
export function podeUsarAcoesDeEmpresa() {
  return getUserType() !== "candidate";
}

/**
 * Caches em memória dos services (vaga.ts, company.ts) que guardam dado de
 * UM usuário. Como o logout é `navigate("/login")` (SPA, sem reload), esses
 * Maps sobreviviam à troca de conta e a sessão nova lia dado da anterior —
 * daí vinha o "Sem permissão" do backend, que confere o dono do recurso.
 * Cada service se registra aqui e é zerado no login e no logout.
 */
const sessionCaches: Array<() => void> = [];

export function registerSessionCache(reset: () => void) {
  sessionCaches.push(reset);
}

function clearSessionCaches() {
  sessionCaches.forEach((reset) => reset());
}

export function setSession(session: Session) {
  clearSessionCaches();
  localStorage.setItem("token", session.accessToken);
  if (session.userType !== undefined) {
    localStorage.setItem("userType", session.userType);
  }
  if (session.userId !== undefined) {
    localStorage.setItem("userId", String(session.userId));
  }
}

export function clearSession() {
  clearSessionCaches();
  localStorage.removeItem("token");
  localStorage.removeItem("userType");
  localStorage.removeItem("userId");
}

function withAuthHeader(options: RequestInit, token: string | null): RequestInit {
  return {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> | undefined),
      ...(token ? { authorization: `bearer ${token}` } : {}),
    },
  };
}

/**
 * fetch() com sessão: injeta o access token. Se a resposta vier 401
 * (token expirado ou inválido), limpa a sessão e manda o usuário pro /login.
 */
export async function authFetch(input: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(input, withAuthHeader(options, getToken()));

  if (response.status === 401) {
    clearSession();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  return response;
}
