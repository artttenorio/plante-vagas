import { Body, Controller, Post } from '@nestjs/common';
import CreateAddressDTO from './dto/create-address-dto';
import { Address } from './entities/address.entity';
import { AddressService } from './address.service';

@Controller('address')
export class AddressController {
  constructor(private readonly addessService: AddressService) {}

  @Post('register')
  async create(@Body() createAdressDTO: CreateAddressDTO): Promise<Address> {
    const address = await this.addessService.createAddress(createAdressDTO);
    return {
      ...address,
      complement: address.complement ?? '',
      country: address.country ?? '',
      state: address.state ?? '',
      userCandidate: {
        connect: {
          id: address.userCandidateId,
        },
      },
    };
  }
}
