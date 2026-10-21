import { IsEmail, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsBrazilianPhone, IsCep, IsCityName, IsFullName, IsSaneBirthDate, IsValidCPF } from 'src/common/validators';

export class AddressDTO {
  @IsOptional()
  country?: string;

  @IsOptional()
  state?: string;

  @IsNotEmpty()
  @IsCityName()
  city: string;

  @IsNotEmpty()
  district: string;

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

export class CreateUserDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsFullName()
  name: string;

  @IsNotEmpty()
  @IsSaneBirthDate(14)
  dateNasc: string;

  @IsNotEmpty()
  @IsValidCPF()
  cpf: string;

  @IsNotEmpty()
  @IsBrazilianPhone()
  phone: string;

  @IsNotEmpty()
  gender: string;

  @IsNotEmpty()
  disablePerson: string;

  @ValidateNested()
  @Type(() => AddressDTO)
  @IsNotEmpty()
  address: AddressDTO;
}
