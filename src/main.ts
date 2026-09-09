import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import hbs = require('hbs');
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('British Coffee Shop API')
    .setDescription(
      'RESTful API кофейни: пользователи и их сессии, отзывы, меню и кофейни.',
    )
    .setVersion('1.0')
    .addTag('users', 'Пользователи и их сессии')
    .addTag('reviews', 'Отзывы посетителей')
    .addTag('catalog', 'Разделы меню и позиции меню')
    .addTag('locations', 'Кофейни сети')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger UI is available on: http://localhost:${port}/api/docs`);
}

void bootstrap();
