import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { execSync } from 'child_process';

export let app: INestApplication;
export let prisma: PrismaService;

/**
 * Configura o módulo de teste para os testes de ponta a ponta (E2E).
 *
 * Essa função cria um módulo de teste com o módulo de aplicação principal,
 * cria a aplicação, inicializa o pipe de validação global e
 * inicializa a aplicação.
 *
 * Além disso, limpa o banco de dados antes de iniciar os testes,
 * deletando todos os usuários existentes.
 */
export const setupE2ETest = async () => {
  process.env.DATABASE_URL =
    'postgresql://postgres:root@localhost:5432/test_db';

  try {
    execSync(
      'npx dotenv -e .env.test -- npx prisma db push --schema=prisma/schema.prisma',
      { stdio: 'inherit' },
    );
  } catch (error) {
    console.error('Erro ao rodar o comando prisma db push:', error);
    throw error;
  }

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());

  await app.init();

  prisma = app.get(PrismaService);

  await prisma.user.deleteMany();
};

/**
 * Limpa o banco de dados após os testes de ponta a ponta (E2E)
 *
 * Essa função deleta todos os usuários existentes no banco de dados
 * e fecha a aplicação, liberando recursos.
 */
export const cleanupE2ETest = async () => {
  await prisma.user.deleteMany();
  await app.close();
};
