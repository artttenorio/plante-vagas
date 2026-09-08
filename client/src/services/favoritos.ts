import { authFetch, BASE_URL } from "./api";

const FAVORITO_URL = `${BASE_URL}/favorito`;

export interface EmpresaFavoritada {
  id: number;
  candidatoId: number;
  empresaId: number;
  createdAt: string;
  empresa: {
    id: number;
    fantasyName: string;
    name: string;
    logoUrl?: string | null;
  };
}

async function handle<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro na requisição");
  }
  return response.json();
}

export async function favoritarEmpresa(empresaId: number): Promise<EmpresaFavoritada> {
  const response = await authFetch(`${FAVORITO_URL}/${empresaId}`, {
    method: "POST",
  });
  return handle<EmpresaFavoritada>(response);
}

export async function desfavoritarEmpresa(empresaId: number): Promise<void> {
  const response = await authFetch(`${FAVORITO_URL}/${empresaId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro na requisição");
  }
}

export async function getMinhasFavoritas(): Promise<EmpresaFavoritada[]> {
  const response = await authFetch(`${FAVORITO_URL}/minhas`);
  return handle<EmpresaFavoritada[]>(response);
}
