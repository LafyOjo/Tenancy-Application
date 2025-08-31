import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IpFilterMiddleware } from './ip-filter.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(new IpFilterMiddleware().use);

  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3001);
}

bootstrap();
