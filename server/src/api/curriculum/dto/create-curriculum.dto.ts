import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HasNoDuplicateField, IsNotBlank, IsNotFutureDate, IsOnOrAfterDate } from 'src/common/validators';

export class ExperienciaDto {
  @IsString()
  cargo: string;

  @IsString()
  empresa: string;

  @IsString()
  descricao: string;

  @IsDateString()
  @IsNotFutureDate()
  inicioData: string;

  @IsOptional()
  @IsDateString()
  @IsOnOrAfterDate('inicioData')
  fimData?: string;

  @IsOptional()
  @IsBoolean()
  empregoAtual?: boolean;
}

export class FormacaoDto {
  @IsString()
  nivelFormacao: string;

  @IsString()
  grauFormacao: string;

  @IsString()
  curso: string;

  @IsString()
  nomeInstituicao: string;

  @IsString()
  status: string;

  @IsDateString()
  inicioData: string;

  @IsOptional()
  @IsDateString()
  @IsOnOrAfterDate('inicioData')
  fimData?: string;
}

export class CertificadoDto {
  @IsString()
  @IsNotBlank()
  nomeInstituicao: string;

  @IsString()
  @IsNotBlank()
  descricao: string;

  @IsString()
  @IsNotBlank()
  certificate_name: string;
}

export class IdiomaDto {
  @IsString()
  idioma: string;

  @IsString()
  nivel: string;
}

export class DiferencialDto {
  @IsString()
  descricao: string;

  @IsOptional()
  @IsIn([1, 2])
  grupo?: number;
}

export class OperacaoAgricolaDto {
  @IsString()
  nome: string;

  @IsString()
  nivelExperiencia: string;

  @IsString()
  descricao: string;
}

export class OperacaoPecuariaDto {
  @IsString()
  nome: string;

  @IsString()
  nivelExperiencia: string;

  @IsString()
  descricao: string;
}

export class OperacaoFlorestalDto {
  @IsString()
  nome: string;

  @IsString()
  nivelExperiencia: string;

  @IsString()
  descricao: string;
}

export class CulturaDto {
  @IsString()
  nome: string;

  @IsString()
  nivelExperiencia: string;

  @IsString()
  descricao: string;
}

export class MaquinaDto {
  @IsString()
  nome: string;

  @IsString()
  nivelExperiencia: string;

  @IsString()
  descricao: string;
}

export class TecnologiaDto {
  @IsString()
  nome: string;

  @IsString()
  nivelExperiencia: string;

  @IsString()
  descricao: string;
}

export const CURRICULUM_SECTION_MODEL: Record<string, string> = {
  experiencias: 'experienciaProfissional',
  formacoes: 'formacaoAcademica',
  certificados: 'certificado',
  idiomas: 'idioma',
  diferenciais: 'diferencial',
  operacoesAgricolas: 'operacaoAgricola',
  operacoesPecuarias: 'operacaoPecuaria',
  operacoesFlorestais: 'operacaoFlorestal',
  culturas: 'cultura',
  maquinas: 'maquina',
  tecnologias: 'tecnologia',
};

export class UpdateCurriculumSectionDto {
  @IsArray()
  data: Record<string, any>[];
}

/**
 * O endpoint `PATCH update-section/:section` é o que as telas de currículo
 * realmente usam (cada seção salva separadamente) — mas o corpo chega como
 * `data: Record<string, any>[]`, sem tipo, então o ValidationPipe do Nest
 * nunca aplica os decorators das classes acima (ele só valida quando o tipo
 * declarado é uma classe conhecida). Esse mapa + validateSectionItems (no
 * service) fecham esse buraco, validando o array certo pra cada seção.
 */
export const CURRICULUM_SECTION_ITEM_DTO: Record<string, new () => object> = {
  experiencias: ExperienciaDto,
  formacoes: FormacaoDto,
  certificados: CertificadoDto,
  idiomas: IdiomaDto,
  diferenciais: DiferencialDto,
  operacoesAgricolas: OperacaoAgricolaDto,
  operacoesPecuarias: OperacaoPecuariaDto,
  operacoesFlorestais: OperacaoFlorestalDto,
  culturas: CulturaDto,
  maquinas: MaquinaDto,
  tecnologias: TecnologiaDto,
};

/** Seções cuja lista não pode ter o campo indicado repetido entre os itens. */
export const CURRICULUM_SECTION_DEDUPE_FIELD: Record<string, string | undefined> = {
  idiomas: 'idioma',
};

/**
 * Monta, em tempo de execução, uma classe `{ items: ItemDto[] }` com os
 * decorators certos (array de itens validados + checagem de duplicado,
 * quando aplicável) — os decorators de propriedade são só funções chamadas
 * com (prototype, nomeDaPropriedade), então aplicá-los assim funciona igual
 * a declará-los com `@`.
 */
export function createSectionWrapperDto(ItemDto: new () => object, dedupeField?: string) {
  class SectionWrapperDto {
    items: object[];
  }
  IsArray()(SectionWrapperDto.prototype, 'items');
  ValidateNested({ each: true })(SectionWrapperDto.prototype, 'items');
  Type(() => ItemDto)(SectionWrapperDto.prototype, 'items');
  if (dedupeField) {
    HasNoDuplicateField(dedupeField)(SectionWrapperDto.prototype, 'items');
  }
  return SectionWrapperDto;
}

export class CreateCurriculumDto {

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienciaDto)
  experiencias: ExperienciaDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormacaoDto)
  formacoes: FormacaoDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificadoDto)
  certificados: CertificadoDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IdiomaDto)
  @HasNoDuplicateField('idioma')
  idiomas: IdiomaDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiferencialDto)
  diferenciais: DiferencialDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperacaoAgricolaDto)
  operacoesAgricolas: OperacaoAgricolaDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperacaoPecuariaDto)
  operacoesPecuarias: OperacaoPecuariaDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperacaoFlorestalDto)
  operacoesFlorestais: OperacaoFlorestalDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CulturaDto)
  culturas: CulturaDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaquinaDto)
  maquinas: MaquinaDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TecnologiaDto)
  tecnologias: TecnologiaDto[];
}