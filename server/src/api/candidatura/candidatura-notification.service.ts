import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

type CandidatoPayload = {
  id: number;
  name: string;
  email: string;
  phone: string;
};
type EmpresaPayload = { id: number; name: string; fantasyName: string };
type VagaPayload = { id: number; nome: string; cargo: string };
type EtapaPayload = { id: number; nome: string };

@Injectable()
export class CandidaturaNotificationService {
  private readonly logger = new Logger(CandidaturaNotificationService.name);
  private readonly webhookUrl = process.env.N8N_CANDIDATURA_WEBHOOK_URL;

  async candidaturaConfirmada(params: {
    candidato: CandidatoPayload;
    empresa: EmpresaPayload;
    vaga: VagaPayload;
    etapa: EtapaPayload;
  }) {
    await this.enviar('candidatura_confirmada', {
      candidato: this.mapCandidato(params.candidato),
      empresa: this.mapEmpresa(params.empresa),
      vaga: params.vaga,
      etapa: params.etapa,
    });
  }

  async avancouEtapa(params: {
    candidato: CandidatoPayload;
    empresa: EmpresaPayload;
    vaga: VagaPayload;
    etapaAnterior: EtapaPayload;
    etapa: EtapaPayload;
  }) {
    await this.enviar('avancou_etapa', {
      candidato: this.mapCandidato(params.candidato),
      empresa: this.mapEmpresa(params.empresa),
      vaga: params.vaga,
      etapaAnterior: params.etapaAnterior,
      etapa: params.etapa,
    });
  }

  async candidaturaRecusada(params: {
    candidato: CandidatoPayload;
    empresa: EmpresaPayload;
    vaga: VagaPayload;
    etapa: EtapaPayload;
    motivoRejeicao: string | null;
  }) {
    await this.enviar('candidatura_recusada', {
      candidato: this.mapCandidato(params.candidato),
      empresa: this.mapEmpresa(params.empresa),
      vaga: params.vaga,
      etapa: params.etapa,
      motivoRejeicao: params.motivoRejeicao,
    });
  }

  async processoEncerrado(params: {
    candidato: CandidatoPayload;
    empresa: EmpresaPayload;
    vaga: VagaPayload;
    etapa: EtapaPayload;
  }) {
    await this.enviar('processo_encerrado', {
      candidato: this.mapCandidato(params.candidato),
      empresa: this.mapEmpresa(params.empresa),
      vaga: params.vaga,
      etapa: params.etapa,
    });
  }

  /**
   * RF013/RF042 — candidato que favoritou a empresa é avisado quando ela
   * publica uma vaga nova. Um envio por candidato favoritado.
   */
  async novaVagaEmpresaFavorita(params: {
    candidato: CandidatoPayload;
    empresa: EmpresaPayload;
    vaga: VagaPayload;
  }) {
    await this.enviar('nova_vaga_empresa_favorita', {
      candidato: this.mapCandidato(params.candidato),
      empresa: this.mapEmpresa(params.empresa),
      vaga: params.vaga,
    });
  }

  private mapCandidato(candidato: CandidatoPayload) {
    return {
      id: candidato.id,
      nome: candidato.name,
      email: candidato.email,
      telefone: candidato.phone,
    };
  }

  private mapEmpresa(empresa: EmpresaPayload) {
    return { id: empresa.id, nome: empresa.fantasyName || empresa.name };
  }

  private async enviar(evento: string, dados: Record<string, unknown>) {
    if (!this.webhookUrl) {
      this.logger.warn(
        `N8N_CANDIDATURA_WEBHOOK_URL não configurada — notificação "${evento}" não enviada`,
      );
      return;
    }

    try {
      await axios.post(this.webhookUrl, {
        evento,
        ...dados,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Falha ao notificar candidato (${evento}): ${msg}`);
    }
  }
}
