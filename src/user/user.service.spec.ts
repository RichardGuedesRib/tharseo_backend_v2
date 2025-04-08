import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../database/prisma.service';
import { createHash } from 'crypto';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('user service deve ser instanciado', () => {
    expect(service).toBeDefined();
  });

  it('deve criar um novo usuario', async () => {
    const newUser = {
      name: 'Teste Richard',
      lastName: 'Sobrenome Richard',
      email: 'teste@teste.com',
      phone: '11912345678',
      password: createHash('sha256').update('123456').digest('hex'),
      levelUser: 'admin',
      balance: 0,
      isActive: true,
    };

    const createdUser = { id: 1, ...newUser };

    (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);

    const result = await service.createUser(newUser);
    expect(result.id).toBe(createdUser.id);
    expect(prisma.user.create).toHaveBeenCalledWith({ data: newUser });
  });

  it('deve retornar erro ao criar um usuario', async () => {
    const newUser = {
      name: 'Teste Richard',
      lastName: 'Sobrenome Richard',
      email: 'teste@teste.com',
      phone: '11912345678',
      password: '1234',
      levelUser: 'admin',
      balance: 0,
      isActive: true,
    };

    const error = new Error('Erro ao criar usuário');
    (prisma.user.create as jest.Mock).mockRejectedValue(error);
    await expect(service.createUser(newUser)).rejects.toThrow(
      'Erro ao criar usuário',
    );

    expect(prisma.user.create).toHaveBeenCalledWith({ data: newUser });
  });

  it('deve retornar o usuário pelo email', async () => {
    const email = 'teste@teste.com';
    const foundUser = {
      id: 1,
      name: 'Richard',
      lastName: 'Sobrenome',
      email,
      phone: '11912345678',
      password: 'hashedpassword',
      levelUser: 'admin',
      balance: 0,
      isActive: true,
    };
  
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(foundUser);
  
    const result = await service.getUserByEmail(email);
  
    expect(result).toEqual(foundUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
  });

  it('deve retornar null se o usuário não for encontrado', async () => {
    const email = 'naoencontrado@teste.com';
  
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
  
    const result = await service.getUserByEmail(email);
  
    expect(result).toBeNull();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
  });

  it('deve retornar todos os usuários', async () => {
    const users = [
      {
        id: 1,
        name: 'Usuário 1',
        lastName: 'Sobrenome 1',
        email: 'user1@teste.com',
        phone: '11911111111',
        password: 'senha1',
        levelUser: 'admin',
        balance: 100,
        isActive: true,
      },
      {
        id: 2,
        name: 'Usuário 2',
        lastName: 'Sobrenome 2',
        email: 'user2@teste.com',
        phone: '11922222222',
        password: 'senha2',
        levelUser: 'user',
        balance: 50,
        isActive: false,
      },
    ];
  
    (prisma.user.findMany as jest.Mock).mockResolvedValue(users);
  
    const result = await service.getAllUsers();
  
    expect(result).toEqual(users);
    expect(prisma.user.findMany).toHaveBeenCalled();
  });
  
  it('deve buscar um usuário por Id', async () => {
    const userId = "abc1234";
    const user = {
      id: "abc1234",
      name: 'Usuário 1',
      lastName: 'Sobrenome 1',
      email: 'user1@teste.com',
      phone: '11911111111',
      password: 'senha1',
      levelUser: 'admin',
      balance: 100,
      isActive: true,
    };
  
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
  
    const result = await service.getUserById(userId);
  
    expect(result).toEqual(user);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      include: { wallets: true, credential: true },
    });
    
  });

  it('deve dar falha ao buscar um usuário que não existe', async () => {
    const userId = "abc";
    const user = {
      id: "abc1234",
      name: 'Usuário 1',
      lastName: 'Sobrenome 1',
      email: 'user1@teste.com',
      phone: '11911111111',
      password: 'senha1',
      levelUser: 'admin',
      balance: 100,
      isActive: true,
    };
  
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
  
    const result = await service.getUserById(userId);

    expect(result).toBeNull();

  });

});
