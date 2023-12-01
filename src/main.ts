import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.setGlobalPrefix('api');

  const logger = new Logger('bootstrap');

  app.useGlobalPipes(new ValidationPipe({whitelist: true}));
  
  await app.listen( process.env.PORT || 3000 );

  logger.log(`App running on port: 3000`);
}
bootstrap();
