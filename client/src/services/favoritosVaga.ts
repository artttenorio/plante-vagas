import { authFetch, BASE_URL } from "./api";

const FAVORITO_VAGA_URL = `${BASE_URL}/favorito-vaga`;

export interface VagaFavoritada {
  id: number;
  candidatoId: number;
  vagaId: number;
  createdAt: string;
  vaga: {
    id: number;
    nome: string;
    cargo: string;
    salario?: number | null;
    status: string;
    empresa: {
      id: number;
      fantasyName: string;
      name: string;
      logoUrl?: string | null;
    };
  };
}

async function handle<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro na requisição");
  }
  return response.json();
}

export async function favoritarVaga(vagaId: number): Promise<VagaFavoritada> {
  const response = await authFetch(`${FAVORITO_VAGA_URL}/${vagaId}`, {
    method: "POST",
  });
  return handle<VagaFavoritada>(response);
}

export async function desfavoritarVaga(vagaId: number): Promise<void> {
  const response = await authFetch(`${FAVORITO_VAGA_URL}/${vagaId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro na requisição");
  }
}

export async function getMinhasVagasFavoritas(): Promise<VagaFavoritada[]> {
  const response = await authFetch(`${FAVORITO_VAGA_URL}/minhas`);
  return handle<VagaFavoritada[]>(response);
}
