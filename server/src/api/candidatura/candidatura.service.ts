import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CandidaturaInput } from './ingestao/fonte-de-candidatura.interface';
import { MoveCandidaturaDto } from './dto/move-candidatura.dto';
import { CandidaturaNotificationService } from './candidatura-notification.service';

const CANDIDATO_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  photoUrl: true,
};
const EMPRESA_SELECT = {
  id: true,
  fantasyName: true,
  name: true,
  logoUrl: true,
};

@Injectable()
export class CandidaturaService {
  constructor(
    private prisma: PrismaService,
    private notification: CandidaturaNotificationService,
  ) {}

  async aplicar(input: CandidaturaInput) {
    const vaga = await this.prisma.vaga.findUnique({
      where: { id: input.vagaId },
      include: { etapas: { orderBy: { id: 'asc' }, take: 1 } },
    });
    if (!vaga) throw new NotFoundException('Vaga não encontrada');
    if (vaga.status === 'fechada') {
      throw new ConflictException('Vaga fechada para novas candidaturas');
    }

    const primeiraEtapa = vaga.etapas[0];
    if (!primeiraEtapa) {
      throw new ConflictException('Vaga não possui etapas configuradas');
    }

    const candidaturaExistente = await this.prisma.candidatoEtapa.findFirst({
      where: {
        candidatoId: input.candidatoId,
        etapa: { vagaId: input.vagaId },
      },
    });
    if (candidaturaExistente) {
      throw new ConflictException('Candidato já se candidatou a esta vaga');
    }

    const candidatura = await this.prisma.candidatoEtapa.create({
      data: {
        candidatoId: input.candidatoId,
        etapaId: primeiraEtapa.id,
        origem: input.origem,
      },
      include: {
        candidato: { select: CANDIDATO_SELECT },
        etapa: {
          include: {
            vaga: { include: { empresa: { select: EMPRESA_SELECT } } },
          },
        },
      },
    });

    void this.notification.candidaturaConfirmada({
      candidato: candidatura.candidato,
      empresa: candidatura.etapa.vaga.empresa,
      vaga: candidatura.etapa.vaga,
      etapa: candidatura.etapa,
    });

    return candidatura;
  }

  async minhas(candidatoId: number) {
    return this.prisma.candidatoEtapa.findMany({
      where: { candidatoId },
      include: {
        etapa: {
          include: {
            // RF017: além da etapa em que o candidato está, ele precisa
            // enxergar o processo inteiro — todas as etapas na ordem e os
            // dados do processo seletivo (nome, início, duração).
            vaga: {
              include: {
                empresa: { select: EMPRESA_SELECT },
                etapas: { orderBy: { ordem: 'asc' } },
                processoSeletivo: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async porVaga(vagaId: number, empresaId: number) {
    await this.assertVagaPertenceEmpresa(vagaId, empresaId);

    return this.prisma.candidatoEtapa.findMany({
      where: { etapa: { vagaId } },
      include: { candidato: { select: CANDIDATO_SELECT }, etapa: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Quantos candidatos há em cada etapa da vaga, pra empresa ver o número
   * direto na tela de "Gerenciar processo seletivo" sem abrir "Ver
   * candidatos". Só contagem — nenhum dado pessoal trafega aqui, e por isso
   * é um endpoint separado do findOne da vaga, que é público.
   */
  async contagemPorEtapa(vagaId: number, empresaId: number) {
    await this.assertVagaPertenceEmpresa(vagaId, empresaId);

    const etapas = await this.prisma.etapaProcessoSeletivo.findMany({
      where: { vagaId },
      select: {
        id: true,
        _count: { select: { candidatoEtapas: true } },
        candidatoEtapas: { where: { rejeitado: true }, select: { id: true } },
      },
    });

    return etapas.map((etapa) => {
      const rejeitados = etapa.candidatoEtapas.length;
      return {
        etapaId: etapa.id,
        total: etapa._count.candidatoEtapas,
        rejeitados,
        ativos: etapa._count.candidatoEtapas - rejeitados,
      };
    });
  }

  async porEtapa(etapaId: number, empresaId: number) {
    const etapa = await this.prisma.etapaProcessoSeletivo.findUnique({
      where: { id: etapaId },
      include: { vaga: true },
    });
    if (!etapa) throw new NotFoundException('Etapa não encontrada');
    if (etapa.vaga.empresaId !== empresaId) {
      throw new ConflictException('Sem permissão');
    }

    return this.prisma.candidatoEtapa.findMany({
      where: { etapaId },
      include: { candidato: { select: CANDIDATO_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async mover(id: number, dto: MoveCandidaturaDto, empresaId: number) {
    const candidatura = await this.prisma.candidatoEtapa.findUnique({
      where: { id },
      include: {
        etapa: {
          include: {
            vaga: { include: { empresa: { select: EMPRESA_SELECT } } },
          },
        },
      },
    });
    if (!candidatura) throw new NotFoundException('Candidatura não encontrada');
    if (candidatura.etapa.vaga.empresaId !== empresaId) {
      throw new ConflictException('Sem permissão');
    }

    if (dto.etapaId !== undefined) {
      const novaEtapa = await this.prisma.etapaProcessoSeletivo.findUnique({
        where: { id: dto.etapaId },
      });
      if (!novaEtapa || novaEtapa.vagaId !== candidatura.etapa.vagaId) {
        throw new ConflictException('Etapa inválida para esta vaga');
      }
    }

    const etapaAnterior = candidatura.etapa;

    const atualizada = await this.prisma.candidatoEtapa.update({
      where: { id },
      data: {
        ...(dto.etapaId !== undefined && { etapaId: dto.etapaId }),
        ...(dto.statusCandidato !== undefined && {
          statusCandidato: dto.statusCandidato,
        }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes }),
        ...(dto.rejeitado !== undefined && {
          rejeitado: dto.rejeitado,
          // rejeitar um candidato desfaz um eventual "avançou" anterior —
          // os dois estados não fazem sentido juntos
          ...(dto.rejeitado && { statusCandidato: false }),
        }),
        ...(dto.motivoRejeicao !== undefined && {
          motivoRejeicao: dto.motivoRejeicao,
        }),
      },
      include: {
        etapa: {
          include: {
            vaga: { include: { empresa: { select: EMPRESA_SELECT } } },
          },
        },
        candidato: { select: CANDIDATO_SELECT },
      },
    });

    if (dto.rejeitado) {
      void this.notification.candidaturaRecusada({
        candidato: atualizada.candidato,
        empresa: atualizada.etapa.vaga.empresa,
        vaga: atualizada.etapa.vaga,
        etapa: atualizada.etapa,
        motivoRejeicao: atualizada.motivoRejeicao,
      });
    } else if (dto.etapaId !== undefined && dto.etapaId !== etapaAnterior.id) {
      void this.notification.avancouEtapa({
        candidato: atualizada.candidato,
        empresa: atualizada.etapa.vaga.empresa,
        vaga: atualizada.etapa.vaga,
        etapaAnterior,
        etapa: atualizada.etapa,
      });
    }

    return atualizada;
  }

  async cancelar(id: number, candidatoId: number) {
    const candidatura = await this.prisma.candidatoEtapa.findUnique({
      where: { id },
    });
    if (!candidatura) throw new NotFoundException('Candidatura não encontrada');
    if (candidatura.candidatoId !== candidatoId) {
      throw new ConflictException('Sem permissão');
    }

    await this.prisma.candidatoEtapa.delete({ where: { id } });
  }

  private async assertVagaPertenceEmpresa(vagaId: number, empresaId: number) {
    const vaga = await this.prisma.vaga.findUnique({ where: { id: vagaId } });
    if (!vaga) throw new NotFoundException('Vaga não encontrada');
    if (vaga.empresaId !== empresaId) {
      throw new ConflictException(
        'Sem permissão para ver candidatos desta vaga',
      );
    }
  }
}
