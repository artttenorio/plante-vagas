import { IsOptional, ValidateNested } from "class-validator";
import { AddressDTO } from "./create-user-dto";
import { Type } from "class-transformer";
import { IsBrazilianPhone } from "src/common/validators";

export class UpdateUserDTO {

@IsOptional()
currentPassword?: string

@IsOptional()
newPassword?: string

@IsOptional()
disablePerson?: string

@IsOptional()
gender?: string

@IsOptional()
@ValidateNested()
@Type(() => AddressDTO)
address?: AddressDTO


@IsOptional()
@IsBrazilianPhone()
phone?: string

}