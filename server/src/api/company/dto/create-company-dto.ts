import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsBrazilianPhone, IsCep, IsCityName, IsHttpUrl, IsNotBlank, IsNotFutureDate, IsValidCNPJ } from 'src/common/validators';

export class AddressCompanyDTO {
  @IsOptional()
  country?: string;

  @IsOptional()
  state?: string;

  @IsNotEmpty()
  @IsCityName()
  city: string;

  @IsNotEmpty()
  district!: string;

  @IsNotEmpty()
  street: string;

  @IsNotEmpty()
  number: string;

  @IsOptional()
  complement?: string;

  @IsNotEmpty()
  @IsCep()
  postalCode: string;
}

export class CompanyDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsString()
  @IsValidCNPJ()
  cnpj: string;

  @IsString()
  description: string;

  @IsString()
  socialReason: string;

  @IsString()
  @IsNotBlank()
  fantasyName: string;

  @IsString()
  @IsBrazilianPhone()
  phone: string;

  @IsString()
  @IsNotFutureDate()
  openingDate: string;

  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  @IsHttpUrl()
  websiteUrl?: string;

  @ValidateNested()
  @Type(() => AddressCompanyDTO)
  @IsNotEmpty()
  address: AddressCompanyDTO;
}
