import { authFetch, BASE_URL } from "./api";
import type { EtapaProcessoSeletivo, ProcessoSeletivo } from "./vaga";

const CANDIDATURA_URL = `${BASE_URL}/candidatura`;

export interface Candidatura {
  id: number;
  statusCandidato: boolean;
  dataConclusao?: string;
  observacoes?: string;
  rejeitado: boolean;
  motivoRejeicao?: string;
  origem: string;
  candidatoId: number;
  etapaId: number;
  createdAt: string;
  etapa?: EtapaProcessoSeletivo & {
    vagaId: number;
    vaga?: {
      id: number;
      nome: string;
      cargo: string;
      empresa?: { id: number; fantasyName: string; name: string; logoUrl?: string | null };
      // RF017 — processo seletivo completo, pro candidato ver todas as
      // etapas e em qual delas ele está, não só a atual.
      etapas?: EtapaProcessoSeletivo[];
      processoSeletivo?: ProcessoSeletivo | null;
    };
  };
  candidato?: { id: number; name: string; email: string; phone: string; photoUrl?: string | null };
}

export interface MoveCandidaturaPayload {
  etapaId?: number;
  statusCandidato?: boolean;
  observacoes?: string;
  rejeitado?: boolean;
  motivoRejeicao?: string;
}

async function handle<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro na requisição");
  }
  return response.json();
}

export async function candidatarSe(vagaId: number): Promise<Candidatura> {
  const response = await authFetch(`${CANDIDATURA_URL}/vaga/${vagaId}`, {
    method: "POST",
  });
  return handle<Candidatura>(response);
}

export async function getMinhasCandidaturas(): Promise<Candidatura[]> {
  const response = await authFetch(`${CANDIDATURA_URL}/minhas`);
  return handle<Candidatura[]>(response);
}

export async function getCandidatosPorVaga(vagaId: number): Promise<Candidatura[]> {
  const response = await authFetch(`${CANDIDATURA_URL}/vaga/${vagaId}`);
  return handle<Candidatura[]>(response);
}

export interface ContagemEtapa {
  etapaId: number;
  total: number;
  rejeitados: number;
  ativos: number;
}

/** Quantos candidatos há em cada etapa, pra empresa ver sem abrir a lista. */
export async function getContagemPorEtapa(vagaId: number): Promise<ContagemEtapa[]> {
  const response = await authFetch(`${CANDIDATURA_URL}/vaga/${vagaId}/contagem`);
  return handle<ContagemEtapa[]>(response);
}

export async function getCandidatosPorEtapa(etapaId: number): Promise<Candidatura[]> {
  const response = await authFetch(`${CANDIDATURA_URL}/etapa/${etapaId}`);
  return handle<Candidatura[]>(response);
}

export async function moverCandidatura(id: number, data: MoveCandidaturaPayload): Promise<Candidatura> {
  const response = await authFetch(`${CANDIDATURA_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handle<Candidatura>(response);
}

export async function cancelarCandidatura(id: number): Promise<void> {
  const response = await authFetch(`${CANDIDATURA_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro na requisição");
  }
}
