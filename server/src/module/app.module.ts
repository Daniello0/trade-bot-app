import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from '../controller/app.controller';
import { AppService } from '../service/app.service';
import { AssignUserIdMiddleware } from '../middleware/user-id.middleware';
import { BotService } from '../service/bot.service';
import { BotController } from '../controller/bot.controller';
import { UserService } from '../service/user.service';
import { UserController } from '../controller/user.controller';
import { CryptoService } from '../service/crypto.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bots } from '../entity/Bots';
import { SpotGridSettings } from '../entity/SpotGridSettings';
import { GridSettings } from '../entity/GridSettings';
import { LevelsSettings } from '../entity/LevelsSettings';
import { Users } from '../entity/Users';
import { SpotGridSettingsService } from '../database-service/spot-grid-settings.service';
import { GridSettingsService } from '../database-service/grid-settings.service';
import { LevelsSettingsService } from '../database-service/levels-settings.service';
import { DatabaseService } from '../database-service/init-typeorm';

@Module({
    imports: [
        TypeOrmModule.forRoot(DatabaseService.options),
        TypeOrmModule.forFeature([
            Bots,
            SpotGridSettings,
            GridSettings,
            LevelsSettings,
            Users,
        ]),
    ],
    controllers: [AppController, BotController, UserController],
    providers: [
        AppService,
        BotService,
        UserService,
        CryptoService,
        SpotGridSettingsService,
        GridSettingsService,
        LevelsSettingsService,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AssignUserIdMiddleware).forRoutes('*');
    }
}
