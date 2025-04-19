import * as request from 'supertest';
import { setupE2ETest, cleanupE2ETest, app } from './helpers/test-utils';

jest.setTimeout(60000);

describe('AuthController (e2e)', () => {
  beforeAll(async () => {
    await setupE2ETest();  // Configura o ambiente para os testes (migrando a DB e inicializando o NestJS)
  });

  afterAll(async () => {
    await cleanupE2ETest();  // Limpa os dados e fecha a aplicação após os testes
  });

  it('POST /auth/signup - deve criar um novo usuário', async () => {
    const userData = {
      name: 'João',
      lastName: 'Silva',
      email: 'joao@example.com',
      phone: '11999999999',
      password: '12345678',
      levelUser: 'admin',
      balance: 100.0,
      isActive: true,
    };

    const response = await request(app.getHttpServer())  // Envia a requisição para o servidor NestJS
      .post('/auth/signup')
      .send(userData)  // Envia os dados do novo usuário
      .expect(201);  // Espera um status 201 (Created)

    // Valida que a resposta possui o id do novo usuário
    expect(response.body).toHaveProperty('id');
    // Valida que os dados do usuário retornados coincidem com os dados enviados
    expect(response.body).toMatchObject({
      name: userData.name,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      levelUser: userData.levelUser,
      balance: userData.balance,
      isActive: userData.isActive,
    });
    // Valida que a senha não é retornada na resposta
    expect(response.body).not.toHaveProperty('password');
  });
});
