import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyDto } from './dto/create-company-dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { UpdateCompanyCadastroDto } from './dto/update-company-cadastro.dto';
import { Company } from './entities/company.entity';
import * as bcrypt from 'bcrypt';
import { normalizeText } from '../../common/normalizeText';
import { omitPassword } from '../../common/omitPassword';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async createCompany(createCompany: CompanyDto): Promise<Omit<Company, 'password'>> {
    // E-mail é o identificador de login em ambas as tabelas (candidato e
    // empresa) e não diferencia maiúsculas de minúsculas.
    const emailNormalizado = createCompany.email.toLowerCase();

    const existEmail = await this.prisma.userCompany.findFirst({
      where: { email: emailNormalizado },
    });
    const existEmailCandidato = await this.prisma.userCandidate.findFirst({
      where: { email: emailNormalizado },
    });

    const existCnpj = await this.prisma.userCompany.findFirst({
      where: { cnpj: createCompany.cnpj },
    });

    if (existEmail || existEmailCandidato) {
      throw new ConflictException('Email já cadastrado');
    }

    if (existCnpj) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(createCompany.password, 10);

    const { address, ...companyData } = createCompany;

    const created = await this.prisma.userCompany.create({
      data: {
        ...companyData,
        email: emailNormalizado,
        password: hashedPassword,
        fantasyNameBusca: normalizeText(companyData.fantasyName),
        nameBusca: normalizeText(companyData.name),
        openingDate: new Date(companyData.openingDate),
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
    const user = await this.prisma.userCompany.findUnique({
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

  async getPublicProfile(companyId: number) {
    const company = await this.prisma.userCompany.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        fantasyName: true,
        description: true,
        openingDate: true,
        logoUrl: true,
        bannerUrl: true,
        facebookUrl: true,
        instagramUrl: true,
        linkedinUrl: true,
        websiteUrl: true,
        Address: { select: { city: true, state: true } },
        vagas: {
          where: { status: 'aberta' },
          select: {
            id: true,
            nome: true,
            cargo: true,
            salario: true,
            area: true,
            modalidade: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!company) {
      throw new ConflictException('Empresa não encontrada');
    }
    return company;
  }

  async updateProfile(userId: number, data: UpdateCompanyProfileDto) {
    const updated = await this.prisma.userCompany.update({
      where: { id: userId },
      data,
      include: { Address: true },
    });
    return omitPassword(updated);
  }

  async updateCadastro(userId: number, data: UpdateCompanyCadastroDto) {
    const { address, openingDate, currentPassword, newPassword, ...rest } = data;

    const user = await this.prisma.userCompany.findFirst({ where: { id: userId } });

    if (!user) {
      throw new ConflictException('Usuário não encontrado para este usuário');
    }

    let hashedPassword: string | undefined;

    if (newPassword) {
      if (!currentPassword) {
        throw new ConflictException('Senha atual não enviada');
      }

      const comparedPassword = await bcrypt.compare(currentPassword, user.password);

      if (!comparedPassword) {
        throw new ConflictException('Senha atual incorreta');
      }

      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    const updated = await this.prisma.userCompany.update({
      where: { id: userId },
      data: {
        ...rest,
        ...(hashedPassword ? { password: hashedPassword } : {}),
        ...(rest.fantasyName ? { fantasyNameBusca: normalizeText(rest.fantasyName) } : {}),
        ...(rest.name ? { nameBusca: normalizeText(rest.name) } : {}),
        ...(openingDate ? { openingDate: new Date(openingDate) } : {}),
        ...(address
          ? {
              Address: {
                upsert: {
                  create: { ...address, country: address.country || 'Brasil' },
                  update: { ...address, country: address.country || 'Brasil' },
                },
              },
            }
          : {}),
      },
      include: { Address: true },
    });
    return omitPassword(updated);
  }

  async delete(userId: number) {
    const findCompany = await this.prisma.userCompany.findUnique({
      where: { id: userId },
    });

    if (!findCompany) {
      throw new ConflictException('Usuário não encontrado');
    }

    const deleted = await this.prisma.userCompany.delete({
      where: { id: findCompany.id },
    });
    return omitPassword(deleted);
  }

  async updateLogo(userId: number, logoUrl: string) {
    const updated = await this.prisma.userCompany.update({
      where: { id: userId },
      data: { logoUrl },
    });
    return omitPassword(updated);
  }

  async updateBanner(userId: number, bannerUrl: string) {
    const updated = await this.prisma.userCompany.update({
      where: { id: userId },
      data: { bannerUrl },
    });
    return omitPassword(updated);
  }
}
