import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompanyService } from './company.service';
import { CompanyDto } from './dto/create-company-dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { UpdateCompanyCadastroDto } from './dto/update-company-cadastro.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('company')
export class CompanyController {
  constructor(private readonly comapanyService: CompanyService) {}

  @Post('singup')
  async create(@Body() data: CompanyDto): Promise<any> {
    const company = await this.comapanyService.createCompany(data);

    return {
      company,
    };
  }

  @Get('profile-comapany')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  async getDashboard(@Req() req) {
    const userId = req.user.sub;
    return this.comapanyService.getInfo(userId);
  }

  @Get(':id')
  async getPublicProfile(@Param('id') id: string) {
    return this.comapanyService.getPublicProfile(Number(id));
  }

  @Patch('update-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  async updateProfile(@Body() data: UpdateCompanyProfileDto, @Req() req) {
    const userId = req.user.sub;
    return this.comapanyService.updateProfile(userId, data);
  }

  @Patch('update-cadastro')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  async updateCadastro(@Body() data: UpdateCompanyCadastroDto, @Req() req) {
    const userId = req.user.sub;
    return this.comapanyService.updateCadastro(userId, data);
  }

  @Post('logo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  async uploadLogo(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string },
    @Req() req,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('O arquivo deve ser uma imagem');
    }
    const userId = req.user.sub;
    const logoUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return this.comapanyService.updateLogo(userId, logoUrl);
  }

  @Post('banner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  async uploadBanner(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string },
    @Req() req,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('O arquivo deve ser uma imagem');
    }
    const userId = req.user.sub;
    const bannerUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return this.comapanyService.updateBanner(userId, bannerUrl);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  async deleteCompany(@Req() req) {
    const userId = req.user.sub;
    return this.comapanyService.delete(userId);
  }
}
