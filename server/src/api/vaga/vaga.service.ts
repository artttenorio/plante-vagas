import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { CreateVagaDto, ProcessoSeletivoDto } from './dto/create-vaga.dto';
import { UpdateVagaDto } from './dto/update-vaga.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CandidaturaNotificationService } from '../candidatura/candidatura-notification.service';
import { normalizeText } from '../../common/normalizeText';

const CANDIDATO_SELECT = { id: true, name: true, email: true, phone: true };
const EMPRESA_SELECT = { id: true, fantasyName: true, name: true };
const ITENS_POR_PAGINA_PADRAO = 10;
const ITENS_POR_PAGINA_MAXIMO = 50;

export interface FindAllVagaQuery {
  busca?: string;
  regiao?: string;
  area?: string;
  modalidade?: string;
  ordenacao?: string;
  pagina?: string;
  itensPorPagina?: string;
}

@Injectable()
export class VagaService {
  constructor(
    private prisma: PrismaService,
    private notification: CandidaturaNotificationService,
  ) {}

  private normalizarProcesso(dto: ProcessoSeletivoDto) {
    return { ...dto, dataInicio: new Date(dto.dataInicio) };
  }

  async create(createVagaDto: CreateVagaDto, empresaId: number) {
    const { beneficios, requisitos, etapas, processoSeletivo, ...vagaData } = createVagaDto;
    return this.prisma.vaga.create({
      data: {
        ...vagaData,
        nomeBusca: normalizeText(vagaData.nome),
        cargoBusca: normalizeText(vagaData.cargo),
        empresaId,
        beneficios: { createMany: { data: beneficios } },
        requisitos: { createMany: { data: requisitos } },
        etapas: { createMany: { data: etapas.map((etapa, ordem) => ({ ...etapa, ordem })) } },
        processoSeletivo: { create: this.normalizarProcesso(processoSeletivo) },
      },
      include: { beneficios: true, requisitos: true, etapas: { orderBy: { ordem: 'asc' } }, processoSeletivo: true },
    });
  }

  async findAll(query: FindAllVagaQuery) {
    const pagina = Math.max(1, Number(query.pagina) || 1);
    const itensPorPagina = Math.min(
      ITENS_POR_PAGINA_MAXIMO,
      Math.max(1, Number(query.itensPorPagina) || ITENS_POR_PAGINA_PADRAO),
    );
    const buscaNormalizada = query.busca ? normalizeText(query.busca.trim()) : '';

    const where: Prisma.VagaWhereInput = {
      status: 'aberta',
      ...(query.area && { area: query.area }),
      ...(query.modalidade && { modalidade: query.modalidade }),
      ...(query.regiao && { empresa: { Address: { city: query.regiao } } }),
      ...(buscaNormalizada && {
        OR: [
          { nomeBusca: { contains: buscaNormalizada } },
          { cargoBusca: { contains: buscaNormalizada } },
          { empresa: { fantasyNameBusca: { contains: buscaNormalizada } } },
          { empresa: { nameBusca: { contains: buscaNormalizada } } },
        ],
      }),
    };

    const orderBy: Prisma.VagaOrderByWithRelationInput =
      query.ordenacao === 'salario-maior'
        ? { salario: { sort: 'desc', nulls: 'last' } }
        : query.ordenacao === 'salario-menor'
          ? { salario: { sort: 'asc', nulls: 'last' } }
          : { createdAt: 'desc' };

    const [vagas, total] = await Promise.all([
      this.prisma.vaga.findMany({
        where,
        orderBy,
        skip: (pagina - 1) * itensPorPagina,
        take: itensPorPagina,
        include: {
          beneficios: true,
          requisitos: true,
          empresa: {
            select: {
              id: true,
              fantasyName: true,
              name: true,
              logoUrl: true,
              Address: { select: { city: true } },
            },
          },
        },
      }),
      this.prisma.vaga.count({ where }),
    ]);

    return {
      vagas,
      total,
      totalPaginas: Math.max(1, Math.ceil(total / itensPorPagina)),
      paginaAtual: pagina,
    };
  }

  async regioesComVagaAberta() {
    const vagas = await this.prisma.vaga.findMany({
      where: { status: 'aberta' },
      select: { empresa: { select: { Address: { select: { city: true } } } } },
    });
    const cidades = new Set(
      vagas.map((v) => v.empresa?.Address?.city).filter((c): c is string => !!c),
    );
    return [...cidades].sort((a, b) => a.localeCompare(b));
  }

  async findByEmpresa(empresaId: number) {
    return this.prisma.vaga.findMany({
      where: { empresaId },
      include: {
        beneficios: true,
        requisitos: true,
        etapas: { orderBy: { ordem: 'asc' } },
        processoSeletivo: true,
        empresa: {
          select: {
            id: true,
            fantasyName: true,
            name: true,
            logoUrl: true,
            Address: { select: { city: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const vaga = await this.prisma.vaga.findUnique({
      where: { id },
      include: {
        beneficios: true,
        requisitos: true,
        etapas: { orderBy: { ordem: 'asc' } },
        processoSeletivo: true,
        empresa: {
          select: {
            id: true,
            fantasyName: true,
            name: true,
            logoUrl: true,
            Address: { select: { city: true } },
          },
        },
      },
    });

    if (!vaga) throw new ConflictException('Vaga não encontrada');

    return vaga;
  }

  async update(id: number, updateVagaDto: UpdateVagaDto, empresaId: number) {
    const vaga = await this.prisma.vaga.findUnique({ where: { id } });

    if (!vaga) throw new ConflictException('Vaga não encontrada');
    if (vaga.empresaId !== empresaId) throw new ConflictException('Sem permissão para editar esta vaga');

    const { beneficios, requisitos, etapas, processoSeletivo, ...vagaData } = updateVagaDto;

    return this.prisma.$transaction(async (tx) => {
      if (beneficios) {
        await tx.beneficio.deleteMany({ where: { vagaId: id } });
      }
      if (requisitos) {
        await tx.requisito.deleteMany({ where: { vagaId: id } });
      }
      if (etapas && etapas.length > 0) {
        await tx.etapaProcessoSeletivo.deleteMany({ where: { vagaId: id } });
      }
      if (processoSeletivo) {
        const normalizado = this.normalizarProcesso(processoSeletivo);
        await tx.processoSeletivo.upsert({
          where: { vagaId: id },
          create: { ...normalizado, vagaId: id },
          update: normalizado,
        });
      }
      return tx.vaga.update({
        where: { id },
        data: {
          ...vagaData,
          ...(vagaData.nome && { nomeBusca: normalizeText(vagaData.nome) }),
          ...(vagaData.cargo && { cargoBusca: normalizeText(vagaData.cargo) }),
          ...(beneficios && { beneficios: { createMany: { data: beneficios } } }),
          ...(requisitos && { requisitos: { createMany: { data: requisitos } } }),
          ...(etapas && { etapas: { createMany: { data: etapas.map((etapa, ordem) => ({ ...etapa, ordem })) } } }),
        },
        include: { beneficios: true, requisitos: true, etapas: { orderBy: { ordem: 'asc' } }, processoSeletivo: true },
      });
    });
  }

  async duplicar(id: number, empresaId: number) {
    const vaga = await this.prisma.vaga.findUnique({
      where: { id },
      include: { beneficios: true, requisitos: true, etapas: { orderBy: { ordem: 'asc' } } },
    });

    if (!vaga) throw new ConflictException('Vaga não encontrada');
    if (vaga.empresaId !== empresaId) throw new ConflictException('Sem permissão');

    return this.prisma.vaga.create({
      data: {
        nome: `${vaga.nome} (cópia)`,
        cargo: vaga.cargo,
        // nomeBusca precisa ser recalculado — o nome muda (ganha "(cópia)").
        // cargoBusca pode ser recalculado direto do cargo original, que
        // não muda na duplicação.
        nomeBusca: normalizeText(`${vaga.nome} (cópia)`),
        cargoBusca: normalizeText(vaga.cargo),
        descricao: vaga.descricao,
        salario: vaga.salario,
        area: vaga.area,
        modalidade: vaga.modalidade,
        empresaId,
        beneficios: { createMany: { data: vaga.beneficios.map((b) => ({ nome: b.nome })) } },
        requisitos: { createMany: { data: vaga.requisitos.map((r) => ({ nome: r.nome })) } },
        etapas: {
          createMany: {
            data: vaga.etapas.map((e) => ({ nome: e.nome, descricao: e.descricao, prazoDias: e.prazoDias, ordem: e.ordem })),
          },
        },
      },
      include: { beneficios: true, requisitos: true, etapas: { orderBy: { ordem: 'asc' } }, processoSeletivo: true },
    });
  }

  async finalizar(id: number, empresaId: number) {
    const vaga = await this.prisma.vaga.findUnique({ where: { id } });

    if (!vaga) throw new ConflictException('Vaga não encontrada');
    if (vaga.empresaId !== empresaId) throw new ConflictException('Sem permissão');

    return this.prisma.vaga.update({ where: { id }, data: { status: 'fechada' } });
  }

  async reabrir(id: number, empresaId: number) {
    const vaga = await this.prisma.vaga.findUnique({ where: { id } });

    if (!vaga) throw new ConflictException('Vaga não encontrada');
    if (vaga.empresaId !== empresaId) throw new ConflictException('Sem permissão');

    return this.prisma.vaga.update({ where: { id }, data: { status: 'aberta' } });
  }

  async upsertProcessoSeletivo(vagaId: number, dto: ProcessoSeletivoDto, empresaId: number) {
    const vaga = await this.prisma.vaga.findUnique({ where: { id: vagaId } });

    if (!vaga) throw new ConflictException('Vaga não encontrada');
    if (vaga.empresaId !== empresaId) throw new ConflictException('Sem permissão');

    const normalizado = this.normalizarProcesso(dto);
    return this.prisma.processoSeletivo.upsert({
      where: { vagaId },
      create: { ...normalizado, vagaId },
      update: normalizado,
    });
  }

  async updateEtapa(
    etapaId: number,
    data: { nome: string; descricao: string; prazoDias?: number },
    empresaId: number,
  ) {
    const etapa = await this.prisma.etapaProcessoSeletivo.findUnique({
      where: { id: etapaId },
      include: { vaga: true },
    });

    if (!etapa) throw new ConflictException('Etapa não encontrada');
    if (etapa.vaga.empresaId !== empresaId) throw new ConflictException('Sem permissão');

    return this.prisma.etapaProcessoSeletivo.update({
      where: { id: etapaId },
      data: { nome: data.nome, descricao: data.descricao, prazoDias: data.prazoDias },
    });
  }

  async reordenarEtapas(vagaId: number, etapaIds: number[], empresaId: number) {
    const vaga = await this.prisma.vaga.findUnique({ where: { id: vagaId } });

    if (!vaga) throw new ConflictException('Vaga não encontrada');
    if (vaga.empresaId !== empresaId) throw new ConflictException('Sem permissão');

    return this.prisma.$transaction(
      etapaIds.map((etapaId, ordem) =>
        this.prisma.etapaProcessoSeletivo.update({
          where: { id: etapaId, vagaId },
          data: { ordem },
        }),
      ),
    );
  }

  async fecharEtapa(etapaId: number, empresaId: number) {
    const etapa = await this.prisma.etapaProcessoSeletivo.findUnique({
      where: { id: etapaId },
      include: {
        vaga: { include: { empresa: { select: EMPRESA_SELECT } } },
        candidatoEtapas: { where: { rejeitado: false }, include: { candidato: { select: CANDIDATO_SELECT } } },
      },
    });

    if (!etapa) throw new ConflictException('Etapa não encontrada');
    if (etapa.vaga.empresaId !== empresaId) throw new ConflictException('Sem permissão');

    const atualizada = await this.prisma.etapaProcessoSeletivo.update({
      where: { id: etapaId },
      data: { status: 'fechada' },
    });

    for (const candidatoEtapa of etapa.candidatoEtapas) {
      void this.notification.processoEncerrado({
        candidato: candidatoEtapa.candidato,
        empresa: etapa.vaga.empresa,
        vaga: { id: etapa.vaga.id, nome: etapa.vaga.nome, cargo: etapa.vaga.cargo },
        etapa: { id: etapa.id, nome: etapa.nome },
      });
    }

    return atualizada;
  }

  async removeEtapa(etapaId: number, empresaId: number) {
    const etapa = await this.prisma.etapaProcessoSeletivo.findUnique({
      where: { id: etapaId },
      include: { vaga: true },
    });

    if (!etapa) throw new ConflictException('Etapa não encontrada');
    if (etapa.vaga.empresaId !== empresaId) throw new ConflictException('Sem permissão');

    const totalEtapas = await this.prisma.etapaProcessoSeletivo.count({
      where: { vagaId: etapa.vagaId },
    });
    if (totalEtapas <= 1) {
      throw new ConflictException(
        'Não é possível excluir a última etapa do processo seletivo. Adicione outra etapa antes, ou exclua a vaga inteira.',
      );
    }

    return this.prisma.etapaProcessoSeletivo.delete({ where: { id: etapaId } });
  }

  async addEtapa(
    vagaId: number,
    etapa: { nome: string; descricao: string; prazoDias?: number },
    empresaId: number,
  ) {
    const vaga = await this.prisma.vaga.findUnique({ where: { id: vagaId } });

    if (!vaga) throw new ConflictException('Vaga não encontrada');
    if (vaga.empresaId !== empresaId) throw new ConflictException('Sem permissão');

    const totalEtapas = await this.prisma.etapaProcessoSeletivo.count({ where: { vagaId } });

    return this.prisma.etapaProcessoSeletivo.create({
      data: {
        nome: etapa.nome,
        descricao: etapa.descricao,
        prazoDias: etapa.prazoDias,
        vagaId,
        ordem: totalEtapas,
      },
    });
  }

  async remove(id: number, empresaId: number) {
    const vaga = await this.prisma.vaga.findUnique({ where: { id } });

    if (!vaga) throw new ConflictException('Vaga não encontrada');
    if (vaga.empresaId !== empresaId) throw new ConflictException('Sem permissão para excluir esta vaga');

    return this.prisma.vaga.delete({ where: { id } });
  }
}
