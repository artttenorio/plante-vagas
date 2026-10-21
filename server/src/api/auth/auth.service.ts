import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    // E-mail não diferencia maiúsculas de minúsculas — igual no cadastro.
    const emailNormalizado = email.toLowerCase();

    let user: any = await this.prisma.userCandidate.findUnique({
      where: { email: emailNormalizado },
    });

    let userType: 'candidate' | 'company' | null = null;

    if (user) {
      userType = 'candidate';
    } else {
      user = await this.prisma.userCompany.findUnique({ where: { email: emailNormalizado } });
      if (user) {
        userType = 'company';
      }
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    const accessToken = await this.generateToken(user.id, user.email, userType);

    return {
      accessToken,
      userType,
      userId: user.id,
    };
  }

  private async generateToken(
    sub: number,
    email: string,
    role: 'candidate' | 'company' | null,
  ) {
    return this.jwtService.signAsync(
      { sub, email, role },
      { secret: process.env.JWT_SECRET, expiresIn: '24h' },
    );
  }

  async login(dto: { email: string; password: string }) {
    return this.validateUser(dto.email, dto.password);
  }
}
