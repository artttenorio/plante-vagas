import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CandidaturaService } from './candidatura.service';
import { IngestaoService } from './ingestao/ingestao.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { MoveCandidaturaDto } from './dto/move-candidatura.dto';

@Controller('candidatura')
export class CandidaturaController {
  constructor(
    private readonly candidaturaService: CandidaturaService,
    private readonly ingestaoService: IngestaoService,
  ) {}

  @Post('vaga/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('candidate')
  async candidatar(@Param('id') id: string, @Req() req) {
    return this.ingestaoService.ingerir(
      'interna',
      { candidatoId: req.user.sub, vagaId: Number(id) },
      {},
    );
  }

  @Get('minhas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('candidate')
  async minhas(@Req() req) {
    return this.candidaturaService.minhas(req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('candidate')
  async cancelar(@Param('id') id: string, @Req() req) {
    return this.candidaturaService.cancelar(Number(id), req.user.sub);
  }

  @Get('vaga/:vagaId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  async porVaga(@Param('vagaId') vagaId: string, @Req() req) {
    return this.candidaturaService.porVaga(Number(vagaId), req.user.sub);
  }

  @Get('vaga/:vagaId/contagem')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  async contagemPorEtapa(@Param('vagaId') vagaId: string, @Req() req) {
    return this.candidaturaService.contagemPorEtapa(
      Number(vagaId),
      req.user.sub,
    );
  }

  @Get('etapa/:etapaId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  async porEtapa(@Param('etapaId') etapaId: string, @Req() req) {
    return this.candidaturaService.porEtapa(Number(etapaId), req.user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  async mover(
    @Param('id') id: string,
    @Body() dto: MoveCandidaturaDto,
    @Req() req,
  ) {
    return this.candidaturaService.mover(Number(id), dto, req.user.sub);
  }
}
