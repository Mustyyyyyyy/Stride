import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedServer: any;

export const bootstrapServer = async () => {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    app.enableCors({ origin: '*' });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();
    cachedServer = expressApp;
  }
  return cachedServer;
};

export default async function handler(req: any, res: any) {
  try {
    const server = await bootstrapServer();
    await new Promise<void>((resolve, reject) => {
      server(req, res);
      res.on('finish', resolve);
      res.on('error', reject);
    });
  } catch (err) {
    console.error('Vercel serverless error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }
}
