import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { FavoritoVagaService } from './favorito-vaga.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('favorito-vaga')
export class FavoritoVagaController {
  constructor(private readonly favoritoVagaService: FavoritoVagaService) {}

  @Post(':vagaId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('candidate')
  async favoritar(@Param('vagaId') vagaId: string, @Req() req) {
    const candidatoId = req.user.sub;
    return this.favoritoVagaService.favoritar(candidatoId, Number(vagaId));
  }

  @Delete(':vagaId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('candidate')
  async desfavoritar(@Param('vagaId') vagaId: string, @Req() req) {
    const candidatoId = req.user.sub;
    return this.favoritoVagaService.desfavoritar(candidatoId, Number(vagaId));
  }

  @Get('minhas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('candidate')
  async minhas(@Req() req) {
    const candidatoId = req.user.sub;
    return this.favoritoVagaService.minhas(candidatoId);
  }
}
