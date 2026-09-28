import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class MoveCandidaturaDto {
  @IsOptional()
  @IsInt()
  etapaId?: number;

  @IsOptional()
  @IsBoolean()
  statusCandidato?: boolean;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsBoolean()
  rejeitado?: boolean;

  @IsOptional()
  @IsString()
  motivoRejeicao?: string;

  @IsOptional()
  @IsBoolean()
  escolhido?: boolean;
}
