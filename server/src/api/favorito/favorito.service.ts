import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const EMPRESA_SELECT = {
  id: true,
  fantasyName: true,
  name: true,
  logoUrl: true,
};

@Injectable()
export class FavoritoService {
  constructor(private readonly prisma: PrismaService) {}

  async favoritar(candidatoId: number, empresaId: number) {
    const jaExiste = await this.prisma.empresaFavorita.findUnique({
      where: { candidatoId_empresaId: { candidatoId, empresaId } },
    });
    if (jaExiste) {
      throw new ConflictException('Empresa já favoritada');
    }

    const empresa = await this.prisma.userCompany.findUnique({ where: { id: empresaId } });
    if (!empresa) {
      throw new ConflictException('Empresa não encontrada');
    }

    return this.prisma.empresaFavorita.create({
      data: { candidatoId, empresaId },
      include: { empresa: { select: EMPRESA_SELECT } },
    });
  }

  async desfavoritar(candidatoId: number, empresaId: number) {
    const jaExiste = await this.prisma.empresaFavorita.findUnique({
      where: { candidatoId_empresaId: { candidatoId, empresaId } },
    });
    if (!jaExiste) {
      throw new ConflictException('Empresa não está favoritada');
    }

    return this.prisma.empresaFavorita.delete({
      where: { candidatoId_empresaId: { candidatoId, empresaId } },
    });
  }

  async minhas(candidatoId: number) {
    return this.prisma.empresaFavorita.findMany({
      where: { candidatoId },
      include: { empresa: { select: EMPRESA_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
