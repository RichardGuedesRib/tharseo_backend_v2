import {
  Controller,
  Get,
  Put,
  Body,
  Inject,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

// Teste de deploy

@Controller('user')
export class UserController {
  @Inject()
  private readonly userService: UserService;

  @UseGuards(AuthGuard)
  @Get('/')
  /**
   * Retorna todos os usu rios cadastrados.
   *
   * @returns Uma lista com todos os usu rios cadastrados.
   */
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @UseGuards(AuthGuard)
  @Put('/profile')
  async updateProfile(
    @Request() request: any,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    try {
      const updatedUser = await this.userService.updateProfile(
        request.user.id,
        updateUserProfileDto,
      );

      if (!updatedUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return {
        message: 'Profile updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      if (error.message === 'Email already exists') {
        throw new HttpException(
          'Email is already in use by another user',
          HttpStatus.CONFLICT,
        );
      }
      if (error.message === 'Phone already exists') {
        throw new HttpException(
          'Phone number is already in use by another user',
          HttpStatus.CONFLICT,
        );
      }
      if (error.message === 'User not found') {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
