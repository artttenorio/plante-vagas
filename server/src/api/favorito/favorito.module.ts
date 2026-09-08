import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FavoritoService } from './favorito.service';
import { FavoritoController } from './favorito.controller';

@Module({
  imports: [PrismaModule],
  controllers: [FavoritoController],
  providers: [FavoritoService],
})
export class FavoritoModule {}
