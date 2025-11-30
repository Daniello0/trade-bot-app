import { NestFactory } from '@nestjs/core';
import { AppModule } from './module/app.module';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as process from 'node:process';
import { initTypeOrm } from './service/database/InitTypeOrm';

dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        credentials: true,
        origin: process.env.CLIENT_ORIGIN,
    });
    app.use(cookieParser());

    await initTypeOrm();

    await app.listen(process.env.APP_PORT || 3001);
}
bootstrap();
