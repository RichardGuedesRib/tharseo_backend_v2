import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {} 

    async createUser(data: Prisma.UserCreateInput){
        return this.prisma.user.create({data});
    }

}
