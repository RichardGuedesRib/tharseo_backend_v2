import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {} 

    /**
     * Cria um novo usuario no banco de dados
     * 
     * @param data dados do usuario a ser criado
     * @returns um objeto com os dados do usuario, exceto a senha
     */
    async createUser(data: Prisma.UserCreateInput){
        const newUser = this.prisma.user.create({data});
        const { password, ...userWithoutPassword } = await newUser;
        return userWithoutPassword;
    }

    async getUserByEmail(email: string) {
        return this.prisma.user.findUnique({where: {email}});
    }

}
