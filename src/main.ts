import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({whitelist: true}));
  
  await app.listen(3000);

  console.log(`Application is running on port: 3000`);
}
bootstrap();
