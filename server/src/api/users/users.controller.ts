import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserService } from './users.service';

import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { use } from 'passport';
import { CreateUserDTO } from './dto/create-user-dto';
import { UpdateUserDTO } from './dto/update-user-deto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async create(@Body('userData') userData: CreateUserDTO): Promise<any> {
    const user = await this.userService.createUser(userData);

    return {
      user,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('candidate')
  async getDashboard(@Req() req) {
    const userId = req.user.sub;
    console.log(userId);
    return this.userService.getInfo(userId);
  }

   @Patch('update')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('candidate')
    async update(@Req() req: any, @Body() UpdateUserDTO: UpdateUserDTO ) {
      const userID = req.user.sub;
      return this.userService.update(userID, UpdateUserDTO)
    }

@Post('photo')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('candidate')
@UseInterceptors(FileInterceptor('file', { storage: undefined }))
async uploadPhoto(
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
  const photoUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  return this.userService.updatePhoto(userId, photoUrl);
}

@Delete('delete/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('candidate')
async deleteUser(@Req() req){
  const userId = req.user.sub
  return this.userService.delete(userId);
}

}
