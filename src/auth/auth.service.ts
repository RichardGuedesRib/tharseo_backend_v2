import { Inject, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
    @Inject()
    private readonly userService: UserService;

    async signUp(data: Prisma.UserCreateInput) {
        const user = await this.userService.createUser(data);
        return user;        
    }



}
