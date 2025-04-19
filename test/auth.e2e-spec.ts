import * as request from 'supertest';
import { setupE2ETest, cleanupE2ETest, app } from './helpers/test-utils';
import * as bcrypt from 'bcrypt';

jest.setTimeout(60000);

describe('AuthController (e2e)', () => {
  beforeAll(async () => {
    await setupE2ETest();
  });

  afterAll(async () => {
    await cleanupE2ETest();
  });

  describe('POST /auth/signup', () => {
    it('deve criar um novo usuário', async () => {
      const userData = {
        name: 'DSM',
        lastName: 'Tharseo',
        email: 'dsm@example.com',
        phone: '11999999999',
        password: '12345678',
        levelUser: 'admin',
        balance: 100.0,
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');

      expect(response.body).toMatchObject({
        name: userData.name,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        levelUser: userData.levelUser,
        balance: userData.balance,
        isActive: userData.isActive,
      });

      expect(response.body).not.toHaveProperty('password');
    });

    it('deve retornar erro ao criar um novo usuário com email duplicado', async () => {
      const userData = {
        name: 'DSM',
        lastName: 'Tharseo',
        email: 'dsm@example.com',
        phone: '11999999999',
        password: '12345678',
        levelUser: 'admin',
        balance: 100.0,
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Erro ao cadastrar usuário');
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('POST /auth/signin', () => {
    it('deve fazer login com sucesso', async () => {
      const loginRequest = {
        email: 'dsm@example.com',
        password: '12345678',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(loginRequest)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        email: 'dsm@example.com',
      });
    });

    it('deve receber Unauthorized ao tentar logar com credenciais erradas', async () => {
      const loginRequest = {
        email: 'dsm@example.com',
        password: '1234',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(loginRequest)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body.statusCode).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });
});
