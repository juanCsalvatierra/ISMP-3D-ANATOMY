// override: true — backend/.env es la fuente de verdad del PORT del backend.
// Sin esto, un PORT heredado del entorno (p. ej. el que usa el frontend para
// :3000) pisaría el default y el backend intentaría bindear el mismo puerto.
import { config } from 'dotenv';
config({ override: true });
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
