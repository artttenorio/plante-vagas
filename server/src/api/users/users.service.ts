import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/api/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user-dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDTO } from './dto/update-user-deto';
import { omitPassword } from 'src/common/omitPassword';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUser: CreateUserDTO): Promise<Omit<User, 'password'>> {
    // E-mail é o identificador de login em ambas as tabelas (candidato e
    // empresa) e não diferencia maiúsculas de minúsculas — sem isso, dava
    // pra criar duas contas pro "mesmo" e-mail só mudando a capitalização,
    // ou uma conta de candidato e outra de empresa com o e-mail idêntico.
    const emailNormalizado = createUser.email.toLowerCase();

    const existEmail = await this.prisma.userCandidate.findFirst({
      where: { email: emailNormalizado },
    });
    const existEmailEmpresa = await this.prisma.userCompany.findFirst({
      where: { email: emailNormalizado },
    });
    const existCpf = await this.prisma.userCandidate.findFirst({
      where: { cpf: createUser.cpf },
    });

    if (existCpf) {
      throw new ConflictException('Cpf já cadastrado');
    }

    if (existEmail || existEmailEmpresa) {
      throw new ConflictException('email já cadastrado');
    }
    const hashedPassword = await bcrypt.hash(createUser.password, 10);

    const { address, ...userData } = createUser;

    const created = await this.prisma.userCandidate.create({
      data: {
        ...userData,
        email: emailNormalizado,
        password: hashedPassword,
        Address: {
          create: {
            city: address.city,
            district: address.district,
            street: address.street,
            number: address.number,
            postalCode: address.postalCode,
            complement: address.complement,
            state: address.state,
            country: address.country || 'Brasil',
          },
        },
      },
      include: {
        Address: true,
      },
    });
    return omitPassword(created);
  }

  async getInfo(userId: number) {
    const user = await this.prisma.userCandidate.findUnique({
      where: { id: userId },
      include: { Address: true },
    });
    if (!user) {
      throw new ConflictException('Usuário não encontrado');
    }
    return {
      user: omitPassword(user),
    };
  }


   async update(userId: number, userDTO: UpdateUserDTO) {
      const user = await this.prisma.userCandidate.findFirst({ where: { id: userId } });
  
      if (!user) {
        throw new ConflictException('Usuário não encontrado para este usuário');
      }
  
      let hashedPassword: string | undefined;


      if (userDTO.newPassword) {

        if (!userDTO.currentPassword) {
              throw new ConflictException('Senha atual não enviada')
           }

        const comparedPassword = await bcrypt.compare(userDTO.currentPassword, user.password)

        if (!comparedPassword) {
            throw new ConflictException('Senha atual incorreta')
           }

         hashedPassword = await bcrypt.hash(userDTO.newPassword, 10)
      }

       const data: any = {};
          if (userDTO.phone) data.phone = userDTO.phone;
          if (userDTO.disablePerson) data.disablePerson = userDTO.disablePerson;
          if (userDTO.gender) data.gender = userDTO.gender;
          if (hashedPassword) data.password = hashedPassword;
          if (userDTO.address) {
            data.Address = {
              upsert: {
                create: userDTO.address,
                update: userDTO.address,
              }
            }
        }

         const updated = await this.prisma.userCandidate.update({
            where: { id: userId },
            data,
            include: { Address: true },
          });
         return omitPassword(updated);
    }

  async updatePhoto(userId: number, photoUrl: string) {
    const updated = await this.prisma.userCandidate.update({
      where: { id: userId },
      data: { photoUrl },
    });
    return omitPassword(updated);
  }

  async delete(userId: number){

    const findUser = await this.prisma.userCandidate.findUnique({
      where: { id: userId },
    });

    if (!findUser) {
      throw new ConflictException('Usuário não encontrado');
    }

    const deleted = await this.prisma.userCandidate.delete({
      where: { id: findUser.id },
    });
    return omitPassword(deleted);
  }
}
