import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('deve verificar se a aplicacao está rodando', () => {
    return request(app.getHttpServer())
      .get('/health/check')
      .expect(200)
      .expect(
        `# HELP application_health_status Status do aplicativo\n# TYPE application_health_status gauge\napplication_health_status{status="up"} 1\n`,
      );
  });
});
