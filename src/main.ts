import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapter: any) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception instanceof HttpException ? exception.message : 'Internal server error',
    };

    this.httpAdapter.reply(response, responseBody, status);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //using helmet for security headers
  app.use(helmet());
  // Enable CORS for all origins
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  // Enable global prefix for API routes
  const httpAdapter =app.getHttpAdapter();

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  const configService = app.get(ConfigService);

  const PORT = configService.getOrThrow<number>('PORT');

const config = new DocumentBuilder()
  .setTitle('Daily Expense Tracker API')
  .setDescription('API for tracking daily expenses and managing personal finance')
  .setVersion('1.0')
  .addTag('expenses', 'Manage expense records')
  .addTag('users', 'User management operations ')
  .addTag('categories', 'Expense categories management')
  .addTag('reports', 'Generate expense reports')
  .addBearerAuth()
  .addServer('http://localhost:8000', 'Development Server')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      displayRequestDuration: true,
      docExpansion: 'none', 
      filter:true,                                         
    showRequestDuration: true,               
    tryItOutEnabled: true,  
    },
    
    customSiteTitle: 'Expense Tracker API Docs'
  });

  await app.listen(PORT);
  console.log(`Documentation available at http://localhost:${PORT}/api/docs`);
}
bootstrap();



