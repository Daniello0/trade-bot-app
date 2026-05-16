import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../service/app/app.service';
import { DatabaseService } from '../service/database/init-typeorm';
import { AuthModule } from './auth.module';
import { UserModule } from './user.module';
import { BotModule } from './bot.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(DatabaseService.options),
        AuthModule,
        UserModule,
        BotModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
