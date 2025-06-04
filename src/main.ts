import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);

  const PORT = configService.getOrThrow<number>('PORT');

  const config = new DocumentBuilder()
    .setTitle('Daily Expense Tracker API')
    .setDescription('API for tracking daily expenses and managing personal finance')
    .setVersion('1.0')
    .addTag('expenses', 'Manage expense records')
    .addTag('users', 'User management operations')
    .addTag('categories', 'Expense categories management')
    .addTag('reports', 'Generate expense reports')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
  
    customSiteTitle: 'Expense Tracker API Docs'
  });

  await app.listen(PORT);
  console.log(`Documentation available at http://localhost:${PORT}/api/docs`);
}
bootstrap();
