import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import {
  CreateCurriculumDto,
  CURRICULUM_SECTION_MODEL,
  CURRICULUM_SECTION_ITEM_DTO,
  CURRICULUM_SECTION_DEDUPE_FIELD,
  createSectionWrapperDto,
} from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from 'generated/prisma';
import axios from 'axios';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

function flattenValidationMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((erro) => [
    ...Object.values(erro.constraints ?? {}),
    ...flattenValidationMessages(erro.children ?? []),
  ]);
}

@Injectable()
export class CurriculumService {
 constructor(private prisma: PrismaService) {}


  async create(createCurriculumDto: CreateCurriculumDto, userId: number) {

    const existCurriculum = await this.prisma.curriculo.findFirst({
      where: { usuarioId: userId },
    });

    if (existCurriculum) {
      throw new ConflictException('Currículo já cadastrado para este usuário');
    }

    return this.prisma.curriculo.create({                                                                                                                                                       
    data: {                                                                                                                                                                                   
      usuarioId: userId,
      experiencias: {                                                                                                                                                                         
        createMany: { data: createCurriculumDto.experiencias },
      },                                                                                                                                                                                      
      formacoes: {                        
        createMany: { data: createCurriculumDto.formacoes },
      },                                                                                                                                                                                      
      idiomas: {
        createMany: { data: createCurriculumDto.idiomas },                                                                                                                                    
      },                                      
      certificados: {                     
        createMany: { data: createCurriculumDto.certificados },
      },                                                                                                                                                                                      
      diferenciais: {
        createMany: { data: createCurriculumDto.diferenciais },
      },
      operacoesAgricolas: {
        createMany: { data: createCurriculumDto.operacoesAgricolas },
      },
      operacoesPecuarias: {
        createMany: { data: createCurriculumDto.operacoesPecuarias },
      },
      operacoesFlorestais: {
        createMany: { data: createCurriculumDto.operacoesFlorestais },
      },
      culturas: {
        createMany: { data: createCurriculumDto.culturas },
      },
      maquinas: {
        createMany: { data: createCurriculumDto.maquinas },
      },
      tecnologias: {
        createMany: { data: createCurriculumDto.tecnologias },
      },
    },
  });

  }

  findAll() {
    return this.prisma.curriculo.findMany({
      include: {
        experiencias: true,
        formacoes: true,
        idiomas: true,
        certificados: true,
        diferenciais: true,
        operacoesAgricolas: true,
        operacoesPecuarias: true,
        operacoesFlorestais: true,
        culturas: true,
        maquinas: true,
        tecnologias: true,
      },
    });
  }

  async findOne( userId: number) {
  console.log('USER ID:', userId);
    const curriculum = await this.prisma.curriculo.findFirst({
      where: { usuarioId: userId },
      include: {
        experiencias: true,
        formacoes: true,
        idiomas: true,
        certificados: true,
        diferenciais: true,
        operacoesAgricolas: true,
        operacoesPecuarias: true,
        operacoesFlorestais: true,
        culturas: true,
        maquinas: true,
        tecnologias: true,
      },
    });

     if (!curriculum) {
      throw new ConflictException('Currículo não encontrado para este usuário');
    }


    return curriculum
  }

  async findOneForCompany(candidatoId: number, empresaId: number) {
    const candidatura = await this.prisma.candidatoEtapa.findFirst({
      where: { candidatoId, etapa: { vaga: { empresaId } } },
    });
    if (!candidatura) {
      throw new ConflictException(
        'Sem permissão para ver o currículo deste candidato',
      );
    }

    const [usuario, curriculo] = await Promise.all([
      this.prisma.userCandidate.findUnique({
        where: { id: candidatoId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          dateNasc: true,
          gender: true,
          disablePerson: true,
          Address: true,
        },
      }),
      this.prisma.curriculo.findFirst({
        where: { usuarioId: candidatoId },
        include: {
          experiencias: true,
          formacoes: true,
          idiomas: true,
          certificados: true,
          diferenciais: true,
          operacoesAgricolas: true,
          operacoesPecuarias: true,
          operacoesFlorestais: true,
          culturas: true,
          maquinas: true,
          tecnologias: true,
        },
      }),
    ]);
    if (!usuario) {
      throw new NotFoundException('Candidato não encontrado');
    }

    return { usuario, curriculo };
  }

  async update(userId: number, curriculumDto: CreateCurriculumDto) {
    const curriculo = await this.prisma.curriculo.findFirst({ where: { usuarioId: userId } });

    if (!curriculo) {
      throw new ConflictException('Currículo não encontrado para este usuário');
    }

    const curriculoId = curriculo.id;

    const results = await this.prisma.$transaction([
      this.prisma.experienciaProfissional.deleteMany({ where: { curriculoId } }),
      this.prisma.formacaoAcademica.deleteMany({ where: { curriculoId } }),
      this.prisma.idioma.deleteMany({ where: { curriculoId } }),
      this.prisma.certificado.deleteMany({ where: { curriculoId } }),
      this.prisma.diferencial.deleteMany({ where: { curriculoId } }),
      this.prisma.operacaoAgricola.deleteMany({ where: { curriculoId } }),
      this.prisma.operacaoPecuaria.deleteMany({ where: { curriculoId } }),
      this.prisma.operacaoFlorestal.deleteMany({ where: { curriculoId } }),
      this.prisma.cultura.deleteMany({ where: { curriculoId } }),
      this.prisma.maquina.deleteMany({ where: { curriculoId } }),
      this.prisma.tecnologia.deleteMany({ where: { curriculoId } }),
      this.prisma.curriculo.update({
        where: { id: curriculoId },
        data: {
          experiencias: { createMany: { data: curriculumDto.experiencias } },
          formacoes: { createMany: { data: curriculumDto.formacoes } },
          idiomas: { createMany: { data: curriculumDto.idiomas } },
          certificados: { createMany: { data: curriculumDto.certificados } },
          diferenciais: { createMany: { data: curriculumDto.diferenciais } },
          operacoesAgricolas: { createMany: { data: curriculumDto.operacoesAgricolas } },
          operacoesPecuarias: { createMany: { data: curriculumDto.operacoesPecuarias } },
          operacoesFlorestais: { createMany: { data: curriculumDto.operacoesFlorestais } },
          culturas: { createMany: { data: curriculumDto.culturas } },
          maquinas: { createMany: { data: curriculumDto.maquinas } },
          tecnologias: { createMany: { data: curriculumDto.tecnologias } },
        },
      }),
    ]);
    return results[results.length - 1];
  }

  async updateSection(userId: number, section: string, items: Record<string, any>[]) {
    const model = CURRICULUM_SECTION_MODEL[section];
    if (!model) {
      throw new BadRequestException(`Seção de currículo inválida: ${section}`);
    }

    await this.validateSectionItems(section, items);

    const curriculo = await this.prisma.curriculo.findFirst({ where: { usuarioId: userId } });

    if (!curriculo) {
      throw new ConflictException('Currículo não encontrado para este usuário');
    }

    const curriculoId = curriculo.id;
    const delegate = (this.prisma as any)[model];

    const operations = [delegate.deleteMany({ where: { curriculoId } })];
    if (items.length > 0) {
      operations.push(
        delegate.createMany({ data: items.map((item) => ({ ...item, curriculoId })) }),
      );
    }
    await this.prisma.$transaction(operations);

    return delegate.findMany({ where: { curriculoId } });
  }

  /**
   * Valida a lista de itens de uma seção do currículo contra a DTO certa
   * (campos obrigatórios, datas, duplicados) antes de gravar — ver nota em
   * createSectionWrapperDto sobre por que isso não acontece sozinho via
   * ValidationPipe nesse endpoint.
   */
  private async validateSectionItems(section: string, items: Record<string, any>[]) {
    const ItemDto = CURRICULUM_SECTION_ITEM_DTO[section];
    if (!ItemDto) return;

    const WrapperDto = createSectionWrapperDto(ItemDto, CURRICULUM_SECTION_DEDUPE_FIELD[section]);
    const instance = plainToInstance(WrapperDto, { items });
    const errors = await validate(instance as object, { whitelist: false });

    if (errors.length > 0) {
      const mensagens = flattenValidationMessages(errors);
      throw new BadRequestException(mensagens.length ? mensagens : 'Dados inválidos');
    }
  }

  async remove(id:number, userId: number) {

     const existCurriculum = await this.prisma.curriculo.findFirst({
      where: { usuarioId: userId },
    });

    if (!existCurriculum) {
      throw new ConflictException('Currículo não encontrado para este usuário');
    }

    return this.prisma.curriculo.delete({
      where: { id: existCurriculum.id },
    });
  }

  async importFromPdf(fileBuffer: Buffer): Promise<CreateCurriculumDto> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('OPENAI_API_KEY não configurada');
    }

    const base64Pdf = fileBuffer.toString('base64');

    const prompt = `Analise este currículo em PDF e extraia as informações retornando APENAS um JSON válido com a seguinte estrutura exata (sem explicações, sem markdown):
{
  "experiencias": [
    {
      "cargo": "string",
      "empresa": "string",
      "descricao": "string",
      "inicioData": "YYYY-MM-DDTHH:mm:ss.000Z",
      "fimData": "YYYY-MM-DDTHH:mm:ss.000Z ou null",
      "empregoAtual": false
    }
  ],
  "formacoes": [
    {
      "nivelFormacao": "fundamental|medio|tecnico|superior|posgraduacao|mestrado|doutorado",
      "grauFormacao": "string",
      "curso": "string",
      "nomeInstituicao": "string",
      "status": "completo|em andamento|incompleto",
      "inicioData": "YYYY-MM-DDTHH:mm:ss.000Z",
      "fimData": "YYYY-MM-DDTHH:mm:ss.000Z ou null"
    }
  ],
  "certificados": [
    {
      "certificate_name": "string",
      "nomeInstituicao": "string",
      "descricao": "string"
    }
  ],
  "idiomas": [
    {
      "idioma": "portugues|ingles|espanhol|frances|alemao|italiano|mandarim|japones|coreano|arabe|russo",
      "nivel": "basico|intermediario|avancado|fluente|nativo"
    }
  ],
  "diferenciais": [
    {
      "descricao": "string"
    }
  ],
  "operacoesAgricolas": [
    {
      "nome": "string (ex: plantio, colheita, pulverizacao, preparo_solo, irrigacao, adubacao, colheita_mecanizada)",
      "nivelExperiencia": "basico|intermediario|avancado",
      "descricao": "string"
    }
  ],
  "operacoesPecuarias": [
    {
      "nome": "string (ex: manejo_bovinos, manejo_aves, manejo_suinos, ordenha, vacinacao, nutricao_animal)",
      "nivelExperiencia": "basico|intermediario|avancado",
      "descricao": "string"
    }
  ],
  "operacoesFlorestais": [
    {
      "nome": "string (ex: plantio_florestal, corte_colheita_madeira, manejo_florestal, viveiro_florestal, controle_pragas_florestais)",
      "nivelExperiencia": "basico|intermediario|avancado",
      "descricao": "string"
    }
  ],
  "culturas": [
    {
      "nome": "string (ex: soja, milho, cafe, cana_de_acucar, algodao, arroz, feijao, trigo, hortalicas, fruticultura)",
      "nivelExperiencia": "basico|intermediario|avancado",
      "descricao": "string"
    }
  ],
  "maquinas": [
    {
      "nome": "string (ex: trator, colheitadeira, pulverizador, plantadeira, semeadora, rocadeira, caminhao_carreta_agricola)",
      "nivelExperiencia": "basico|intermediario|avancado",
      "descricao": "string"
    }
  ],
  "tecnologias": [
    {
      "nome": "string (ex: agricultura_precisao, gps_piloto_automatico, drones_agricolas, sensoriamento_remoto, softwares_gestao_agricola, irrigacao_automatizada)",
      "nivelExperiencia": "basico|intermediario|avancado",
      "descricao": "string"
    }
  ]
}

Regras importantes:
- Datas desconhecidas: use "2000-01-01T00:00:00.000Z"
- fimData null quando empregoAtual=true
- Extraia habilidades/competências como diferenciais
- Extraia operações agrícolas, pecuárias e florestais, culturas, máquinas e tecnologias mencionadas no currículo relacionadas ao agronegócio; se não houver informação, retorne listas vazias
- Retorne SOMENTE o JSON, sem nenhum texto adicional`;

    let responseText: string;
    try {
      const { data } = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'file',
                  file: {
                    filename: 'curriculum.pdf',
                    file_data: `data:application/pdf;base64,${base64Pdf}`,
                  },
                },
                {
                  type: 'text',
                  text: prompt,
                },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      responseText = data.choices[0].message.content;
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message;
      throw new InternalServerErrorException(`Erro ao chamar a API de IA: ${msg}`);
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new InternalServerErrorException('A IA não retornou um JSON válido');
    }

    try {
      return JSON.parse(jsonMatch[0]) as CreateCurriculumDto;
    } catch {
      throw new InternalServerErrorException('Falha ao interpretar o JSON retornado pela IA');
    }
  }
}
