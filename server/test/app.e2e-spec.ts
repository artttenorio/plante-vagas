import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/api/prisma/prisma.service';
import { createPrismaMock } from './support/prisma-mock';

describe('App (smoke)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(createPrismaMock())
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('boots the whole module graph without errors', () => {
    expect(app).toBeDefined();
  });

  it('GET / responds with 200', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('GET /vaga/find/all responds with 200 and a paginated list (public route)', () => {
    return request(app.getHttpServer())
      .get('/vaga/find/all')
      .expect(200)
      .expect({ vagas: [], total: 0, totalPaginas: 1, paginaAtual: 1 });
  });

  it('POST /vaga/create without a token is rejected (401)', () => {
    return request(app.getHttpServer())
      .post('/vaga/create')
      .send({})
      .expect(401);
  });

  it('POST /auth/login with an invalid body is rejected by validation (400)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'not-an-email' })
      .expect(400);
  });

  it('POST /candidatura/integracoes/:sistema without an API key is rejected (401)', () => {
    return request(app.getHttpServer())
      .post('/candidatura/integracoes/qualquer')
      .send({})
      .expect(401);
  });
});
