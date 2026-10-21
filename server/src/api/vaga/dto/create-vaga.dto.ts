import { IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { HasNoDuplicateNomes, IsNotAbsurdlyFarInFuture } from 'src/common/validators';

class BeneficioDto {
  @IsString()
  nome: string;
}

class RequisitoDto {
  @IsString()
  nome: string;
}

class EtapaDto {
  @IsString()
  nome: string;

  @IsString()
  descricao: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  prazoDias?: number;
}

export class ProcessoSeletivoDto {
  @IsString()
  nome: string;

  @IsString()
  descricao: string;

  @IsDateString()
  @IsNotAbsurdlyFarInFuture(5)
  dataInicio: string;

  @IsInt()
  @Min(1)
  duracaoDias: number;
}

export class CreateVagaDto {
  @IsString()
  @MaxLength(100)
  nome: string;

  @IsString()
  cargo: string;

  @IsString()
  descricao: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  salario?: number;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  modalidade?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BeneficioDto)
  @HasNoDuplicateNomes()
  beneficios: BeneficioDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequisitoDto)
  requisitos: RequisitoDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EtapaDto)
  @HasNoDuplicateNomes()
  etapas: EtapaDto[];

  @ValidateNested()
  @Type(() => ProcessoSeletivoDto)
  processoSeletivo: ProcessoSeletivoDto;
}
