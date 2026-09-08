import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './api/users/users.module';
import { PrismaModule } from './api/prisma/prisma.module';
import { AddressModule } from './api/address/address.module';
import { AuthModule } from './api/auth/auth.module';
import { CompanyModule } from './api/company/company.module';
import { CurriculumModule } from './api/curriculum/curriculum.module';
import { VagaModule } from './api/vaga/vaga.module';
import { CandidaturaModule } from './api/candidatura/candidatura.module';
import { FavoritoModule } from './api/favorito/favorito.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    PrismaModule,
    AddressModule,
    AuthModule,
    CompanyModule,
    CurriculumModule,
    VagaModule,
    CandidaturaModule,
    FavoritoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
