import * as request from 'supertest';
import {
  app,
  cleanupE2ETest,
  prisma,
  setupE2ETest,
} from './helpers/test-utils';

jest.setTimeout(60000);

describe('TradeflowController (e2e)', () => {
  beforeAll(async () => {
    await setupE2ETest();
  });

  afterAll(async () => {
    await cleanupE2ETest();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.strategy.deleteMany();
    await prisma.tradeflow.deleteMany();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.strategy.deleteMany();
    await prisma.tradeflow.deleteMany();
  });

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

  async function getAsset(token: string) {
    const asset = {
      symbol: 'DOGEUSDT',
      name: 'Dogecoin',
      isActive: true,
    };
    const response = await request(app.getHttpServer())
      .post('/asset')
      .set('Authorization', `Bearer ${token}`)
      .send(asset)
      .expect(201);

    return response.body;
  }

  async function getStrategy(token: string) {
    const strategy = {
      name: 'Nome de Estrategia teste',
      description: 'Descricao da estrategia teste',
      isActive: true,
    };
    const response = await request(app.getHttpServer())
      .post('/v1/strategy')
      .set('Authorization', `Bearer ${token}`)
      .send(strategy)
      .expect(201);

    return response.body;
  }

  describe('Create Tradeflow (e2e) - POST /v1/tradeflow', () => {
    it('deve criar uma nova estratégia com sucesso', async () => {
      let token = await getToken();
      let asset = await getAsset(token);
      let strategy = await getStrategy(token);

      const createdTradeflow = {
        assetId: asset.id,
        strategyId: strategy.id,
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/v1/tradeflow')
        .set('Authorization', `Bearer ${token}`)
        .send(createdTradeflow)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('assetId');
      expect(response.body).toHaveProperty('strategyId');
      expect(response.body).toHaveProperty('isActive');
    });

    it('deve retornar UnauthorizedException se o token nao for encontrado', async () => {
      let consoleErrorSpy: jest.SpyInstance;

      consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation((...args) => {
          if (args[0]?.includes?.('JWT Verification Error')) return;
        });

      let token = await getToken();
      let asset = await getAsset(token);
      let strategy = await getStrategy(token);

      const createdTradeflow = {
        assetId: asset.id,
        strategyId: strategy.id,
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/v1/tradeflow')
        .set('Authorization', `Bearer token-invalido`)
        .send(createdTradeflow)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('statusCode');
    });

    it('deve retornar 404 se o asset nao for encontrado', async () => {
      let token = await getToken();
      let strategy = await getStrategy(token);

      const createdTradeflow = {
        assetId: 'asset-id-invalido',
        strategyId: strategy.id,
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/v1/tradeflow')
        .set('Authorization', `Bearer ${token}`)
        .send(createdTradeflow)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body.message).toBe('Asset not found');
    });

    it('deve retornar 404 se o strategy nao for encontrado', async () => {
      let token = await getToken();
      let asset = await getAsset(token);

      const createdTradeflow = {
        assetId: asset.id,
        strategyId: 'strategy-id-invalido',
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/v1/tradeflow')
        .set('Authorization', `Bearer ${token}`)
        .send(createdTradeflow)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body.message).toBe('Strategy not found');
    });

    it('deve retornar 404 se o strategy nao for encontrado', async () => {
      let token = await getToken();
      let asset = await getAsset(token);

      const createdTradeflow = {
        assetId: asset.id,
        strategyId: 'strategy-id-invalido',
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/v1/tradeflow')
        .set('Authorization', `Bearer ${token}`)
        .send(createdTradeflow)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body.message).toBe('Strategy not found');
    });
  });

  describe('FindAllTradeflows (e2e) - GET /v1/tradeflow', () => {
    it('deve retornar uma lista de tradeflows do usuario', async () => {
      let token = await getToken();
      let asset = await getAsset(token);
      let strategy = await getStrategy(token);

      const createdTradeflow = {
        assetId: asset.id,
        strategyId: strategy.id,
        isActive: true,
      };

      await request(app.getHttpServer())
        .post('/v1/tradeflow')
        .set('Authorization', `Bearer ${token}`)
        .send(createdTradeflow)
        .expect(201);

      const responseGet = await request(app.getHttpServer())
        .get('/v1/tradeflow')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(responseGet.body.length).toBeGreaterThan(0);
    });

    it('deve retornar uma lista vazia caso o usuario não tenha tradeflows', async () => {
      let token = await getToken();

      const responseGet = await request(app.getHttpServer())
        .get('/v1/tradeflow')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(responseGet.body.length).toBe(0);
    });
  });

  describe('FindOneTradeflow (e2e) - GET /v1/tradeflow/:id', () => {
    it('deve retornar um tradeflow pelo id de um usuario', async () => {
      let token = await getToken();
      let asset = await getAsset(token);
      let strategy = await getStrategy(token);

      const createdTradeflow = {
        assetId: asset.id,
        strategyId: strategy.id,
        isActive: true,
      };

      const responseCreated = await request(app.getHttpServer())
        .post('/v1/tradeflow')
        .set('Authorization', `Bearer ${token}`)
        .send(createdTradeflow)
        .expect(201);

      const responseGet = await request(app.getHttpServer())
        .get(`/v1/tradeflow/${responseCreated.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(responseGet.body).toHaveProperty('id');
      expect(responseGet.body.id).toBe(responseCreated.body.id);
    });

    it('deve retornar NotFound se o tradeflow nao for encontrado', async () => {
      let token = await getToken();
      let asset = await getAsset(token);
      let strategy = await getStrategy(token);

      const createdTradeflow = {
        assetId: asset.id,
        strategyId: strategy.id,
        isActive: true,
      };

      const responseCreated = await request(app.getHttpServer())
        .post('/v1/tradeflow')
        .set('Authorization', `Bearer ${token}`)
        .send(createdTradeflow)
        .expect(201);

      const responseGet = await request(app.getHttpServer())
        .get(`/v1/tradeflow/IDNAOEXISTE`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(responseGet.body).toHaveProperty('message');
      expect(responseGet.body).toHaveProperty('error');
      expect(responseGet.body).toHaveProperty('statusCode');
      expect(responseGet.body.message).toBe('TradeFlow not found');
      
    });

    it('deve retornar Unauthorized se o token nao for encontrado ou for inválido', async () => {
      let token = await getToken();
      let asset = await getAsset(token);
      let strategy = await getStrategy(token);

      const createdTradeflow = {
        assetId: asset.id,
        strategyId: strategy.id,
        isActive: true,
      };

      const responseCreated = await request(app.getHttpServer())
        .post('/v1/tradeflow')
        .set('Authorization', `Bearer ${token}`)
        .send(createdTradeflow)
        .expect(201);

      const responseGet = await request(app.getHttpServer())
        .get(`/v1/tradeflow/${responseCreated.body.id}`)
        .set('Authorization', `Bearer TOKENINVALIDO`)
        .expect(401);

      expect(responseGet.body).toHaveProperty('message');
      expect(responseGet.body).toHaveProperty('error');
      expect(responseGet.body).toHaveProperty('statusCode');
      expect(responseGet.body.message).toBe('Invalid Token');
      
    });

  });

  
});
