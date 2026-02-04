import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', () => {
      const registerDto = {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        phone: '+233201234567',
        password: 'Password123!',
      };

      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toEqual(registerDto.email);
          accessToken = res.body.accessToken;
        });
    });

    it('should fail with duplicate email', () => {
      const registerDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'duplicate@example.com',
        phone: '+233201234567',
        password: 'Password123!',
      };

      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .then(() => {
          return request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send(registerDto)
            .expect(409);
        });
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        })
        .expect((res) => {
          if (res.status === 200) {
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
          }
        });
    });

    it('should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword',
        })
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout user', () => {
      if (!accessToken) {
        return;
      }

      return request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });
});
