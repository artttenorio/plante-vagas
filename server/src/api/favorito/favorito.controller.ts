import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { FavoritoService } from './favorito.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('favorito')
export class FavoritoController {
  constructor(private readonly favoritoService: FavoritoService) {}

  @Post(':empresaId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('candidate')
  async favoritar(@Param('empresaId') empresaId: string, @Req() req) {
    const candidatoId = req.user.sub;
    return this.favoritoService.favoritar(candidatoId, Number(empresaId));
  }

  @Delete(':empresaId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('candidate')
  async desfavoritar(@Param('empresaId') empresaId: string, @Req() req) {
    const candidatoId = req.user.sub;
    return this.favoritoService.desfavoritar(candidatoId, Number(empresaId));
  }

  @Get('minhas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('candidate')
  async minhas(@Req() req) {
    const candidatoId = req.user.sub;
    return this.favoritoService.minhas(candidatoId);
  }
}
