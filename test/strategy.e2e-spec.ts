import * as request from 'supertest';
import {
  app,
  cleanupE2ETest,
  prisma,
  setupE2ETest,
} from './helpers/test-utils';

jest.setTimeout(60000);

describe('StrategyController (e2e)', () => {
  beforeAll(async () => {
    await setupE2ETest();
  });

  afterAll(async () => {
    await cleanupE2ETest();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.strategy.deleteMany();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.strategy.deleteMany();
  });

  let token: string;
  let strategyId: string;

  beforeAll(async () => {});

  async function getToken() {
    const userPayload = {
      name: 'User Strategy',
      lastName: 'Test',
      email: 'strategy@example.com',
      phone: '11999999999',
      password: '12345678',
      levelUser: 'admin',
      balance: 0,
      isActive: true,
    };

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(userPayload)
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: userPayload.email,
        password: userPayload.password,
      })
      .expect(200);

    return loginResponse.body.token;
  }

  it('deve criar uma nova estratégia com sucesso', async () => {
    const strategyData = {
      name: 'Nome de Estrategia teste',
      description: 'Descricao da estrategia teste',
      isActive: true,
    };

    token = await getToken();

    const response = await request(app.getHttpServer())
      .post('/v1/strategy')
      .set('Authorization', `Bearer ${token}`)
      .send(strategyData)
      .expect(201);

    strategyId = response.body.id;

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(strategyData.name);
    expect(response.body.description).toBe(strategyData.description);
    expect(response.body.isActive).toBe(true);
    expect(response.body).toHaveProperty('userId');
  });

  it('deve retornar um BadRequestException ao criar uma nova estratégia com dados inválidos', async () => {
    const strategyData = {
      name: 'Nome de Estrategia teste',
      description: 'Descricao da estrategia teste',
    };

    token = await getToken();

    const response = await request(app.getHttpServer())
      .post('/v1/strategy')
      .set('Authorization', `Bearer ${token}`)
      .send(strategyData)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('statusCode');
    expect(response.body.statusCode).toBe(400);
    expect(response.body.error).toBe('Bad Request');
  });

  it('deve retornar todas as estrategias do usuário', async () => {
    token = await getToken();

    const strategyData = {
      name: 'Nome de Estrategia teste',
      description: 'Descricao da estrategia teste',
      isActive: true,
    };

    await request(app.getHttpServer())
      .post('/v1/strategy')
      .set('Authorization', `Bearer ${token}`)
      .send(strategyData)
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/v1/strategy')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
  });

  it('deve retornar uma estrategia pelo id', async () => {
    token = await getToken();

    const strategyData = {
      name: 'Nome de Estrategia teste',
      description: 'Descricao da estrategia teste',
      isActive: true,
    };

    const responseStrategy = await request(app.getHttpServer())
      .post('/v1/strategy')
      .set('Authorization', `Bearer ${token}`)
      .send(strategyData)
      .expect(201);
    
    const response = await request(app.getHttpServer())
      .get(`/v1/strategy/${responseStrategy.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
  });

  it('deve atualizar uma estrategia pelo id', async () => {
    token = await getToken();

    const strategyDataOriginal = {
      name: 'Nome de Estrategia teste',
      description: 'Descricao da estrategia teste',
      isActive: true,
    };

    const responseStrategy = await request(app.getHttpServer())
      .post('/v1/strategy')
      .set('Authorization', `Bearer ${token}`)
      .send(strategyDataOriginal)
      .expect(201);

    const strategyData = {
      name: 'Nome de Estrategia teste',
      description: 'Descricao da estrategia teste',
      isActive: false,
    };

    const response = await request(app.getHttpServer())
      .patch(`/v1/strategy/${responseStrategy.body.id}`)
      .send(strategyData)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('isActive');
    expect(response.body.isActive).toBe(false);
  });
});
