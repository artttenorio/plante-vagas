import { authFetch, BASE_URL, registerSessionCache } from "./api";

const VAGA_URL = `${BASE_URL}/vaga`;

export interface ProcessoSeletivoPayload {
  nome: string;
  descricao: string;
  dataInicio: string;
  duracaoDias: number;
}

export interface VagaPayload {
  nome: string;
  cargo: string;
  descricao: string;
  salario?: number;
  area?: string;
  modalidade?: string;
  beneficios: { nome: string }[];
  requisitos: { nome: string }[];
  etapas: { nome: string; descricao: string; prazoDias?: number }[];
  processoSeletivo: ProcessoSeletivoPayload;
}

export interface EtapaProcessoSeletivo {
  id: number;
  nome: string;
  descricao: string;
  status: string;
  prazoDias?: number | null;
  ordem: number;
}

export interface ProcessoSeletivo {
  id: number;
  nome: string;
  descricao: string;
  dataInicio: string;
  duracaoDias: number;
}

export interface Vaga {
  id: number;
  nome: string;
  cargo: string;
  descricao: string;
  salario?: number;
  status: string;
  area?: string | null;
  modalidade?: string | null;
  beneficios: { id: number; nome: string }[];
  requisitos: { id: number; nome: string }[];
  etapas: EtapaProcessoSeletivo[];
  processoSeletivo?: ProcessoSeletivo | null;
  empresaId: number;
  empresa?: {
    id: number;
    fantasyName: string;
    name: string;
    logoUrl?: string | null;
    Address?: { city: string } | null;
  };
  createdAt: string;
  updatedAt: string;
}

const vagaCache = new Map<number, Vaga>();
let vagasByEmpresaCache: Vaga[] | null = null;

function invalidateVagaListCaches() {
  vagasByEmpresaCache = null;
}

// Zerado no login e no logout: `vagasByEmpresaCache` guarda as vagas de UMA
// empresa, e `vagaCache` guarda vagas que a conta anterior podia ver.
registerSessionCache(() => {
  vagaCache.clear();
  vagasByEmpresaCache = null;
  regioesCache = null;
});

export async function createVaga(data: VagaPayload): Promise<Vaga> {
  const response = await authFetch(`${VAGA_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao criar vaga");
  }
  invalidateVagaListCaches();
  return response.json();
}

export interface BuscarVagasParams {
  busca?: string;
  regiao?: string;
  area?: string;
  modalidade?: string;
  ordenacao?: string;
  pagina?: number;
  itensPorPagina?: number;
}

export interface BuscarVagasResultado {
  vagas: Vaga[];
  total: number;
  totalPaginas: number;
  paginaAtual: number;
}

export async function buscarVagas(params: BuscarVagasParams): Promise<BuscarVagasResultado> {
  const query = new URLSearchParams();
  if (params.busca) query.set("busca", params.busca);
  if (params.regiao) query.set("regiao", params.regiao);
  if (params.area) query.set("area", params.area);
  if (params.modalidade) query.set("modalidade", params.modalidade);
  if (params.ordenacao) query.set("ordenacao", params.ordenacao);
  if (params.pagina) query.set("pagina", String(params.pagina));
  if (params.itensPorPagina) query.set("itensPorPagina", String(params.itensPorPagina));

  const response = await authFetch(`${VAGA_URL}/find/all?${query.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao buscar vagas");
  }
  return response.json();
}

let regioesCache: string[] | null = null;

export async function getRegioesComVagaAberta(): Promise<string[]> {
  if (regioesCache) return regioesCache;

  const response = await authFetch(`${VAGA_URL}/find/regioes`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao buscar regiões");
  }
  const regioes = await response.json();
  regioesCache = regioes;
  return regioes;
}

export async function getVagaById(id: number): Promise<Vaga> {
  const cached = vagaCache.get(id);
  if (cached) return cached;

  const response = await authFetch(`${VAGA_URL}/find/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao buscar vaga");
  }
  const vaga = await response.json();
  vagaCache.set(id, vaga);
  return vaga;
}

export async function getVagasByEmpresa(): Promise<Vaga[]> {
  if (vagasByEmpresaCache) return vagasByEmpresaCache;

  const response = await authFetch(`${VAGA_URL}/find/empresa`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao buscar vagas");
  }
  const vagas = await response.json();
  vagasByEmpresaCache = vagas;
  return vagas;
}

export async function updateVaga(id: number, data: Partial<VagaPayload>): Promise<Vaga> {
  const response = await authFetch(`${VAGA_URL}/update/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao atualizar vaga");
  }
  const vaga = await response.json();
  vagaCache.set(id, vaga);
  invalidateVagaListCaches();
  return vaga;
}

export async function updateEtapaService(etapaId: number, data: { nome: string; descricao: string; prazoDias?: number }): Promise<EtapaProcessoSeletivo> {
  const response = await authFetch(`${VAGA_URL}/etapa/${etapaId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao editar etapa");
  }
  vagaCache.clear();
  invalidateVagaListCaches();
  return response.json();
}

export async function deleteEtapa(etapaId: number): Promise<void> {
  const response = await authFetch(`${VAGA_URL}/etapa/${etapaId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao excluir etapa");
  }
  vagaCache.clear();
  invalidateVagaListCaches();
}

export async function addEtapa(vagaId: number, etapa: { nome: string; descricao: string; prazoDias?: number }): Promise<EtapaProcessoSeletivo> {
  const response = await authFetch(`${VAGA_URL}/${vagaId}/etapa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(etapa),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao adicionar etapa");
  }
  vagaCache.delete(vagaId);
  invalidateVagaListCaches();
  return response.json();
}

export async function upsertProcessoSeletivo(
  vagaId: number,
  data: ProcessoSeletivoPayload,
): Promise<ProcessoSeletivo> {
  const response = await authFetch(`${VAGA_URL}/${vagaId}/processo-seletivo`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao salvar processo seletivo");
  }
  vagaCache.delete(vagaId);
  invalidateVagaListCaches();
  return response.json();
}

export async function finalizarVaga(id: number): Promise<Vaga> {
  const response = await authFetch(`${VAGA_URL}/${id}/finalizar`, { method: "PATCH" });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao finalizar vaga");
  }
  vagaCache.delete(id);
  invalidateVagaListCaches();
  return response.json();
}

export async function reabrirVaga(id: number): Promise<Vaga> {
  const response = await authFetch(`${VAGA_URL}/${id}/reabrir`, { method: "PATCH" });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao reabrir vaga");
  }
  vagaCache.delete(id);
  invalidateVagaListCaches();
  return response.json();
}

export async function duplicarVaga(id: number): Promise<Vaga> {
  const response = await authFetch(`${VAGA_URL}/${id}/duplicar`, { method: "POST" });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao duplicar vaga");
  }
  invalidateVagaListCaches();
  return response.json();
}

export async function reordenarEtapas(vagaId: number, etapaIds: number[]): Promise<void> {
  const response = await authFetch(`${VAGA_URL}/${vagaId}/etapas/reordenar`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ etapaIds }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao reordenar etapas");
  }
  vagaCache.delete(vagaId);
  invalidateVagaListCaches();
}

export async function fecharEtapa(etapaId: number): Promise<EtapaProcessoSeletivo> {
  const response = await authFetch(`${VAGA_URL}/etapa/${etapaId}/fechar`, { method: "PATCH" });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao fechar etapa");
  }
  vagaCache.clear();
  invalidateVagaListCaches();
  return response.json();
}

export async function deleteVaga(id: number): Promise<void> {
  const response = await authFetch(`${VAGA_URL}/delete/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao excluir vaga");
  }
  vagaCache.delete(id);
  invalidateVagaListCaches();
}
