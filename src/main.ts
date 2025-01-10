import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);

  configureSwagger(app);

  await app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
}
bootstrap();

function configureSwagger(app) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nest-Test')
    .setDescription('Test-Task')
    .setVersion('1.0.0')
    .addTag('NestJS, MySQL (Sequelize), RestAPI, Docker')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/api/docs', app, document);
}
