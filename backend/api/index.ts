import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { IncomingMessage, ServerResponse } from 'http';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AppModule } = require('../dist/src/app.module.js');

const server = express();
let initialized = false;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix('api');
  await app.init();
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!initialized) {
    await bootstrap();
    initialized = true;
  }
  server(req, res);
}
