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

  /** Meia-noite de hoje em UTC — a data vem do input como "YYYY-MM-DD". */
  private inicioDeHoje() {
    const agora = new Date();
    return new Date(
      Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()),
    );
  }

  private mesmoDia(a: Date, b: Date) {
    return a.getTime() === b.getTime();
  }

  /**
   * Processo seletivo não pode começar antes de hoje. Em edição, uma data
   * passada JÁ SALVA continua aceita se não mudou — senão as vagas antigas
   * (cujo dataInicio foi retroalimentado com a data de criação da vaga)
   * ficariam impossíveis de editar sem mexer na data.
   */
  private assertDataInicioNaoPassada(dataInicio: Date, anterior?: Date | null) {
    if (dataInicio >= this.inicioDeHoje()) return;
    if (anterior && this.mesmoDia(dataInicio, anterior)) return;

    throw new ConflictException(
      'A data de início do processo seletivo não pode ser anterior a hoje',
    );
  }

  async create(createVagaDto: CreateVagaDto, empresaId: number) {
    const { beneficios, requisitos, etapas, processoSeletivo, ...vagaData } = createVagaDto;
    this.assertDataInicioNaoPassada(new Date(processoSeletivo.dataInicio));
    const vaga = await this.prisma.vaga.create({
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
      include: {
        beneficios: true,
        requisitos: true,
        etapas: { orderBy: { ordem: 'asc' } },
        processoSeletivo: true,
        empresa: { select: EMPRESA_SELECT },
      },
    });

    void this.notificarCandidatosQueFavoritaram(vaga);

    return vaga;
  }

  /**
   * RF013/RF042 — avisa por WhatsApp (mesmo webhook n8n das outras
   * notificações) todo candidato que favoritou a empresa. Fire-and-forget:
   * falha de notificação não pode derrubar a criação da vaga, que já foi
   * gravada nesse ponto.
   */
  private async notificarCandidatosQueFavoritaram(vaga: {
    id: number;
    nome: string;
    cargo: string;
    empresaId: number;
    empresa: { id: number; fantasyName: string; name: string };
  }) {
    const favoritos = await this.prisma.empresaFavorita.findMany({
      where: { empresaId: vaga.empresaId },
      include: { candidato: { select: CANDIDATO_SELECT } },
    });

    for (const favorito of favoritos) {
      void this.notification.novaVagaEmpresaFavorita({
        candidato: favorito.candidato,
        empresa: vaga.empresa,
        vaga: { id: vaga.id, nome: vaga.nome, cargo: vaga.cargo },
      });
    }
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
    const vagas = await this.prisma.vaga.findMany({
      where: { empresaId },
      include: {
        beneficios: true,
        requisitos: true,
        etapas: this.ETAPAS_COM_ESCOLHIDO_INCLUDE,
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

    return vagas.map((vaga) => this.comTemCandidatoEscolhido(vaga));
  }

  async findOne(id: number) {
    const vaga = await this.prisma.vaga.findUnique({
      where: { id },
      include: {
        beneficios: true,
        requisitos: true,
        etapas: this.ETAPAS_COM_ESCOLHIDO_INCLUDE,
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

    return this.comTemCandidatoEscolhido(vaga);
  }

  // Traz, pra cada etapa, só o suficiente pra saber se ela tem algum
  // candidato escolhido — usado por comTemCandidatoEscolhido() logo abaixo.
  // Nenhum dado pessoal de candidato trafega aqui.
  private readonly ETAPAS_COM_ESCOLHIDO_INCLUDE = {
    orderBy: { ordem: 'asc' as const },
    include: {
      candidatoEtapas: { where: { escolhido: true }, select: { id: true } },
    },
  };

  /**
   * `temCandidatoEscolhido`: se alguma etapa da vaga já tem um candidato
   * marcado como escolhido. Usado pelo front pra decidir se avisa a
   * empresa antes de finalizar uma vaga sem ninguém escolhido ainda.
   */
  private comTemCandidatoEscolhido<
    T extends { etapas: { candidatoEtapas: { id: number }[] }[] },
  >(vaga: T) {
    const temCandidatoEscolhido = vaga.etapas.some(
      (etapa) => etapa.candidatoEtapas.length > 0,
    );
    return {
      ...vaga,
      etapas: vaga.etapas.map(({ candidatoEtapas, ...etapa }) => etapa),
      temCandidatoEscolhido,
    };
  }

  async update(id: number, updateVagaDto: UpdateVagaDto, empresaId: number) {
    const vaga = await this.prisma.vaga.findUnique({ where: { id } });

    if (!vaga) throw new ConflictException('Vaga não encontrada');
    if (vaga.empresaId !== empresaId) throw new ConflictException('Sem permissão para editar esta vaga');

    const { beneficios, requisitos, etapas, processoSeletivo, ...vagaData } = updateVagaDto;

    if (processoSeletivo) {
      const atual = await this.prisma.processoSeletivo.findUnique({
        where: { vagaId: id },
        select: { dataInicio: true },
      });
      this.assertDataInicioNaoPassada(
        new Date(processoSeletivo.dataInicio),
        atual?.dataInicio,
      );
    }

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

  /**
   * Finalizar uma vaga rejeita de verdade todo candidato que não foi
   * escolhido (fica marcado `rejeitado`, com notificação por WhatsApp) —
   * antes só mudava `vaga.status`, sem mexer nas candidaturas, então um
   * candidato "Em análise" continuava aparecendo assim pra ele mesmo
   * depois da vaga fechada (`estaEncerrado()` no front do candidato só
   * olha `rejeitado`/etapa fechada, nunca `vaga.status`). Reabrir a vaga
   * depois NÃO desfaz essa rejeição — combinado com a empresa: reabrir é
   * pra buscar candidato novo, não pra voltar a mexer em quem já foi
   * dispensado aqui.
   */
  async finalizar(id: number, empresaId: number) {
    const vaga = await this.prisma.vaga.findUnique({
      where: { id },
      include: {
        empresa: { select: EMPRESA_SELECT },
        etapas: {
          include: {
            candidatoEtapas: {
              where: { rejeitado: false, escolhido: false },
              include: { candidato: { select: CANDIDATO_SELECT } },
            },
          },
        },
      },
    });

    if (!vaga) throw new ConflictException('Vaga não encontrada');
    if (vaga.empresaId !== empresaId) throw new ConflictException('Sem permissão');

    const algumEscolhido = await this.prisma.candidatoEtapa.findFirst({
      where: { escolhido: true, etapa: { vagaId: id } },
      select: { id: true },
    });
    const motivoRejeicao = algumEscolhido
      ? 'Processo seletivo encerrado — a vaga foi preenchida com outro candidato.'
      : 'Processo seletivo encerrado pela empresa.';

    const candidaturasParaRejeitar = vaga.etapas.flatMap((e) =>
      e.candidatoEtapas.map((c) => ({ ...c, etapaNome: e.nome, etapaId: e.id })),
    );

    const [atualizada] = await this.prisma.$transaction([
      this.prisma.vaga.update({ where: { id }, data: { status: 'fechada' } }),
      this.prisma.candidatoEtapa.updateMany({
        where: { id: { in: candidaturasParaRejeitar.map((c) => c.id) } },
        data: { rejeitado: true, statusCandidato: false, motivoRejeicao },
      }),
    ]);

    for (const candidatura of candidaturasParaRejeitar) {
      void this.notification.candidaturaRecusada({
        candidato: candidatura.candidato,
        empresa: vaga.empresa,
        vaga: { id: vaga.id, nome: vaga.nome, cargo: vaga.cargo },
        etapa: { id: candidatura.etapaId, nome: candidatura.etapaNome },
        motivoRejeicao,
      });
    }

    return { ...atualizada, candidatosRejeitados: candidaturasParaRejeitar.length };
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

    const atual = await this.prisma.processoSeletivo.findUnique({
      where: { vagaId },
      select: { dataInicio: true },
    });

    const normalizado = this.normalizarProcesso(dto);
    this.assertDataInicioNaoPassada(normalizado.dataInicio, atual?.dataInicio);

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
    // Fechar uma etapa no meio do processo (não a primeira) deixava
    // confuso: notifica todo mundo que não avançou como "não selecionado"
    // sem dar pra reabrir depois pra ninguém específico. Restrito à
    // primeira etapa, onde fechar tem um significado direto e reversível
    // de menos risco: parar de receber candidaturas novas (ver aplicar()
    // em candidatura.service.ts).
    if (etapa.ordem !== 0) {
      throw new ConflictException(
        'Só é possível fechar a primeira etapa do processo seletivo',
      );
    }

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
