import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user')
export class UserController {
    @Inject()
    private readonly userService: UserService;

    @UseGuards(AuthGuard)
    @Get("/")
    async getAllUsers() {
        return this.userService.getAllUsers();
    }


}
