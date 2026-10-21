import { Injectable } from '@nestjs/common';
import CreateAddressDTO from './dto/create-address-dto';
import { PrismaService } from 'src/api/prisma/prisma.service';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async createAddress(createAddress: CreateAddressDTO) {
    return this.prisma.address.create({
      data: createAddress,
    });
  }
}
