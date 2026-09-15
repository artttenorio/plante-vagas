export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type Session = {
  accessToken: string;
  userType?: string;
  userId?: string | number;
};

/**
 * A sessão fica em sessionStorage (não localStorage) de propósito: cada aba
 * tem seu próprio sessionStorage, então logar com contas diferentes em abas
 * diferentes não faz uma sobrescrever o token da outra. localStorage é
 * compartilhado entre todas as abas da mesma origem, então era isso que
 * causava as trocas/perdas de sessão ao usar múltiplos logins ao mesmo tempo.
 */
const storage = () => window.sessionStorage;

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

/**
 * Retorna o token válido da aba atual, ou null. Um token presente porém
 * expirado é tratado como "sem sessão" e já limpa o storage aqui — antes
 * disso, telas como PrivateRoute só checavam se existia *algum* valor
 * salvo, então uma sessão expirada ainda deixava passar pra tela protegida
 * (que ficava vazia, já que toda chamada à API voltava 401).
 */
export function getToken(): string | null {
  const token = storage().getItem("token");
  if (!token) return null;
  if (isExpired(token)) {
    clearSession();
    return null;
  }
  return token;
}

export function getUserType(): string | null {
  if (!getToken()) return null;
  return storage().getItem("userType");
}

export function getUserId(): string | null {
  if (!getToken()) return null;
  return storage().getItem("userId");
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
  storage().setItem("token", session.accessToken);
  if (session.userType !== undefined) {
    storage().setItem("userType", session.userType);
  }
  if (session.userId !== undefined) {
    storage().setItem("userId", String(session.userId));
  }
}

export function clearSession() {
  clearSessionCaches();
  storage().removeItem("token");
  storage().removeItem("userType");
  storage().removeItem("userId");
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
