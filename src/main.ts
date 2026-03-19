import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix (exclude health check routes)
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1', {
    exclude: ['/', 'health'],
  });

  // Enable CORS
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://chms-taupe.vercel.app',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    ...(process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : []),
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Church Management System API')
    .setDescription(
      'Complete REST API for Church Management System with authentication, contributions, expenses, departments, members, facilitators, and reporting',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Contributions', 'Church contribution management')
    .addTag('Expenses', 'Church expense management')
    .addTag('Departments', 'Department management and assignments')
    .addTag('Members', 'Church member management')
    .addTag('Facilitators (Children & Teens)', 'Children and teens ministry facilitators')
    .addTag('Reports', 'Financial and operational reports')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on: http://0.0.0.0:${port}`);

  console.log(`
    ✅ Application is running on: http://localhost:${port}
    📚 Swagger documentation: http://localhost:${port}/api/docs
    🔐 API endpoints available at: http://localhost:${port}/${process.env.API_PREFIX || 'api/v1'}
  `);
}

bootstrap();
