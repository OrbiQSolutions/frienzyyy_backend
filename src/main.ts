import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Sequelize } from 'sequelize-typescript';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1/api');

  const config = new DocumentBuilder()
    .setTitle('Frienzyyy Backend V1.0.0')
    .setDescription('The frienzyyy app which is a dating app')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  const sequelize = app.get(Sequelize);
  await sequelize.sync({ alter: true });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
