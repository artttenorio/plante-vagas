import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const VAGA_SELECT = {
  id: true,
  nome: true,
  cargo: true,
  salario: true,
  status: true,
  empresa: {
    select: { id: true, fantasyName: true, name: true, logoUrl: true },
  },
};

@Injectable()
export class FavoritoVagaService {
  constructor(private readonly prisma: PrismaService) {}

  async favoritar(candidatoId: number, vagaId: number) {
    const jaExiste = await this.prisma.vagaFavorita.findUnique({
      where: { candidatoId_vagaId: { candidatoId, vagaId } },
    });
    if (jaExiste) {
      throw new ConflictException('Vaga já favoritada');
    }

    const vaga = await this.prisma.vaga.findUnique({ where: { id: vagaId } });
    if (!vaga) {
      throw new ConflictException('Vaga não encontrada');
    }

    return this.prisma.vagaFavorita.create({
      data: { candidatoId, vagaId },
      include: { vaga: { select: VAGA_SELECT } },
    });
  }

  async desfavoritar(candidatoId: number, vagaId: number) {
    const jaExiste = await this.prisma.vagaFavorita.findUnique({
      where: { candidatoId_vagaId: { candidatoId, vagaId } },
    });
    if (!jaExiste) {
      throw new ConflictException('Vaga não está favoritada');
    }

    return this.prisma.vagaFavorita.delete({
      where: { candidatoId_vagaId: { candidatoId, vagaId } },
    });
  }

  async minhas(candidatoId: number) {
    return this.prisma.vagaFavorita.findMany({
      where: { candidatoId },
      include: { vaga: { select: VAGA_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
