import { Controller, Post, Inject, Body } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    @Inject()
    private readonly authService: AuthService

    @Post('signup')
    async signUp(@Body() data: Prisma.UserCreateInput){
        const user = await this.authService.signUp(data); 
        return user;        
    }

}
