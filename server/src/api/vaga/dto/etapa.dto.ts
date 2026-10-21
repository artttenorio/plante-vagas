import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class EtapaBodyDto {
  @IsString()
  nome: string;

  @IsString()
  descricao: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  prazoDias?: number;
}
