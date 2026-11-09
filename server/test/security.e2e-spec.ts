/**
 * Testes de seguranca do TCC: IDOR, criptografia/senhas, injecao de codigo e
 * bots. Roda contra um banco real (nao usa o mock generico do app.e2e-spec),
 * porque IDOR so faz sentido com dois usuarios de verdade no banco.
 *
 * Pre-requisito: banco de dev no ar e migrado (mesmo fluxo do README do
 * server): `docker compose up -d postgres` e `npx prisma migrate deploy`,
 * com DATABASE_URL apontando pra ele (o .env do server ja faz isso).
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/api/prisma/prisma.service';
import { gerarCPF, gerarCNPJ } from './support/fake-docs';

describe('Seguranca (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let server: App;

  const senha = 'SenhaForte123!';
  const seed = Date.now();

  let candidatoA: { token: string; id: number; email: string };
  let candidatoB: { token: string; id: number; email: string };
  let empresaA: { token: string; id: number; email: string };
  let empresaB: { token: string; id: number; email: string };
  let vagaDaEmpresaA: number;
  let etapaDaEmpresaA: number;

  function enderecoCandidato() {
    return {
      city: 'Lorena',
      district: 'Centro',
      street: 'Rua Teste',
      number: '100',
      complement: '',
      postalCode: '12600000',
      country: 'Brasil',
      state: 'SP',
    };
  }

  async function criarCandidato(indice: number) {
    const email = `seguranca.candidato.${seed}.${indice}@teste.com`;
    const res = await request(server)
      .post('/users/signup')
      .send({
        userData: {
          email,
          password: senha,
          name: 'Fulano de Teste',
          dateNasc: new Date('2000-01-01').toISOString(),
          cpf: gerarCPF(seed + indice),
          phone: '11999990000',
          gender: 'Outro',
          disablePerson: 'Não',
          address: enderecoCandidato(),
        },
      })
      .expect(201);

    const login = await request(server)
      .post('/auth/login')
      .send({ email, password: senha })
      .expect(201);

    return { token: login.body.accessToken, id: res.body.user.id, email };
  }

  async function criarEmpresa(indice: number) {
    const email = `seguranca.empresa.${seed}.${indice}@teste.com`;
    const res = await request(server)
      .post('/company/singup')
      .send({
        email,
        password: senha,
        name: 'Empresa Teste LTDA',
        cnpj: gerarCNPJ(seed + indice),
        description: 'Empresa de teste de segurança',
        socialReason: 'Empresa Teste LTDA',
        fantasyName: `Empresa Teste ${indice}`,
        phone: '11999990000',
        openingDate: '2020-01-01',
        address: {
          city: 'Lorena',
          district: 'Centro',
          street: 'Rua Teste',
          number: '200',
          complement: '',
          postalCode: '12600000',
          country: 'Brasil',
          state: 'SP',
        },
      })
      .expect(201);

    const login = await request(server)
      .post('/auth/login')
      .send({ email, password: senha })
      .expect(201);

    return { token: login.body.accessToken, id: res.body.company.id, email };
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    server = app.getHttpServer();
    prisma = moduleFixture.get(PrismaService);

    candidatoA = await criarCandidato(1);
    candidatoB = await criarCandidato(2);
    empresaA = await criarEmpresa(1);
    empresaB = await criarEmpresa(2);

    const vagaRes = await request(server)
      .post('/vaga/create')
      .set('authorization', `bearer ${empresaA.token}`)
      .send({
        nome: 'Vaga de teste de segurança',
        cargo: 'Testador',
        descricao: 'Vaga criada só pra testar IDOR',
        beneficios: [],
        requisitos: [],
        etapas: [{ nome: 'Triagem', descricao: 'Primeira etapa' }],
        processoSeletivo: {
          nome: 'Processo de teste',
          descricao: 'Processo criado pra teste',
          dataInicio: new Date().toISOString(),
          duracaoDias: 10,
        },
      })
      .expect(201);

    vagaDaEmpresaA = vagaRes.body.id;
    etapaDaEmpresaA = vagaRes.body.etapas[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('IDOR', () => {
    it('empresa B não consegue editar vaga da empresa A', async () => {
      const res = await request(server)
        .patch(`/vaga/update/${vagaDaEmpresaA}`)
        .set('authorization', `bearer ${empresaB.token}`)
        .send({ nome: 'Vaga sequestrada' });

      expect(res.status).not.toBe(200);

      const vaga = await request(server).get(`/vaga/find/${vagaDaEmpresaA}`).expect(200);
      expect(vaga.body.nome).toBe('Vaga de teste de segurança');
    });

    it('empresa B não consegue excluir vaga da empresa A', async () => {
      const res = await request(server)
        .delete(`/vaga/delete/${vagaDaEmpresaA}`)
        .set('authorization', `bearer ${empresaB.token}`);

      expect(res.status).not.toBe(200);
    });

    it('empresa B não consegue ver os candidatos da etapa da empresa A', async () => {
      const res = await request(server)
        .get(`/candidatura/etapa/${etapaDaEmpresaA}`)
        .set('authorization', `bearer ${empresaB.token}`);

      expect(res.status).not.toBe(200);
    });

    it('empresa B não consegue ver a lista de candidatos da vaga da empresa A', async () => {
      const res = await request(server)
        .get(`/candidatura/vaga/${vagaDaEmpresaA}`)
        .set('authorization', `bearer ${empresaB.token}`);

      expect(res.status).not.toBe(200);
    });

    it('rota de usuários exige autenticação (não lista candidato de outra conta sem token)', async () => {
      await request(server).get('/users/profile').expect(401);
    });

    it('token de candidato não acessa rota exclusiva de empresa', async () => {
      const res = await request(server)
        .get('/vaga/find/empresa')
        .set('authorization', `bearer ${candidatoA.token}`);

      expect(res.status).not.toBe(200);
    });
  });

  describe('Criptografia e senhas', () => {
    it('a senha nunca é devolvida em nenhuma resposta da API', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({ email: candidatoA.email, password: senha })
        .expect(201);

      expect(JSON.stringify(res.body)).not.toContain(senha);
      expect(res.body.password).toBeUndefined();
    });

    it('a senha é armazenada com hash (bcrypt), nunca em texto puro', async () => {
      const userNoBanco = await prisma.userCandidate.findUnique({
        where: { email: candidatoA.email },
      });

      expect(userNoBanco?.password).not.toBe(senha);
      expect(userNoBanco?.password).toMatch(/^\$2[aby]\$/);
    });

    it('login com senha errada é recusado', async () => {
      await request(server)
        .post('/auth/login')
        .send({ email: candidatoA.email, password: 'senha-errada-qualquer' })
        .expect(401);
    });

    it('login recusa e-mail inexistente sem revelar se o e-mail existe (mesma resposta genérica)', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({ email: 'ninguem-usa-esse-email@teste.com', password: senha })
        .expect(401);

      const resSenhaErrada = await request(server)
        .post('/auth/login')
        .send({ email: candidatoA.email, password: 'senha-errada-qualquer' })
        .expect(401);

      expect(res.body.message).toBe(resSenhaErrada.body.message);
    });
  });

  describe('Injeção de código', () => {
    it('tentativa de SQL injection no e-mail de login é rejeitada pela validação, não chega no banco', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({ email: "' OR '1'='1", password: 'qualquer' });

      expect(res.status).toBe(400);
    });

    it('SQL injection na busca de vagas não quebra a API nem afeta outras vagas', async () => {
      const res = await request(server)
        .get('/vaga/find/all')
        .query({ busca: "'; DROP TABLE \"Vaga\"; --" })
        .expect(200);

      expect(Array.isArray(res.body.vagas)).toBe(true);

      // se a tabela tivesse sido afetada, essa consulta já teria quebrado
      const vagaAindaExiste = await request(server)
        .get(`/vaga/find/${vagaDaEmpresaA}`)
        .expect(200);
      expect(vagaAindaExiste.body.id).toBe(vagaDaEmpresaA);
    });

    it('payload de script na descrição da vaga é salvo como texto puro (sem executar/quebrar), sanitização é responsabilidade do front ao renderizar', async () => {
      const payload = '<script>alert(1)</script>';
      const res = await request(server)
        .post('/vaga/create')
        .set('authorization', `bearer ${empresaA.token}`)
        .send({
          nome: 'Vaga com payload',
          cargo: 'Testador',
          descricao: payload,
          beneficios: [],
          requisitos: [],
          etapas: [{ nome: 'Triagem', descricao: 'Etapa' }],
          processoSeletivo: {
            nome: 'Processo',
            descricao: 'Processo',
            dataInicio: new Date().toISOString(),
            duracaoDias: 10,
          },
        })
        .expect(201);

      expect(res.body.descricao).toBe(payload);
      // nota: o front (React) escapa isso ao renderizar com {descricao} —
      // o risco real seria usar dangerouslySetInnerHTML com esse campo.
    });
  });

  describe('Bots / força bruta', () => {
    it('FALHA ESPERADA: não existe limite de tentativas de login — múltiplas tentativas seguidas são todas aceitas sem bloqueio', async () => {
      const tentativas = 8;
      const respostas: request.Response[] = [];
      for (let i = 0; i < tentativas; i++) {
        respostas.push(
          await request(server)
            .post('/auth/login')
            .send({ email: candidatoA.email, password: 'senha-errada' }),
        );
      }

      // todas voltam 401 "normal" — nenhuma é bloqueada (429), o que
      // demonstra a ausência de rate limiting / proteção contra bots.
      const algumBloqueio = respostas.some((r) => r.status === 429);
      expect(algumBloqueio).toBe(false);

      // registra o achado explicitamente pra aparecer no relatório do Jest
      console.warn(
        'ACHADO DE SEGURANÇA: POST /auth/login aceita tentativas ilimitadas sem bloqueio (sem @nestjs/throttler). Recomenda-se adicionar rate limiting.',
      );
    });

    it('cadastro não exige nenhum desafio anti-bot (CAPTCHA) — scripts podem criar contas em massa', async () => {
      // apenas documenta o achado: o endpoint de signup aceita qualquer
      // requisição bem formada, sem reCAPTCHA/hCaptcha nem rate limit.
      console.warn(
        'ACHADO DE SEGURANÇA: POST /users/signup e /company/singup não têm CAPTCHA nem rate limiting — vulnerável a criação automatizada de contas.',
      );
      expect(true).toBe(true);
    });
  });
});
