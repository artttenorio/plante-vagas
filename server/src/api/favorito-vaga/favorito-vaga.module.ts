import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FavoritoVagaService } from './favorito-vaga.service';
import { FavoritoVagaController } from './favorito-vaga.controller';

@Module({
  imports: [PrismaModule],
  controllers: [FavoritoVagaController],
  providers: [FavoritoVagaService],
})
export class FavoritoVagaModule {}
