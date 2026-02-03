import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from '../controller/app.controller';
import { AppService } from '../service/app/app.service';
import { AssignUserIdMiddleware } from '../middleware/user-id.middleware';
import { BotSettingsService } from '../service/database/bot-settings.service';
import { BotController } from '../controller/bot.controller';
import { UserService } from '../service/user/user.service';
import { UserController } from '../controller/user.controller';
import { CryptoService } from '../service/cryptography/crypto.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bots } from '../entity/Bots';
import { SpotGridSettings } from '../entity/SpotGridSettings';
import { GridSettings } from '../entity/GridSettings';
import { LevelsSettings } from '../entity/LevelsSettings';
import { Users } from '../entity/Users';
import { SpotGridSettingsService } from '../service/database/spot-grid-settings.service';
import { GridSettingsService } from '../service/database/grid-settings.service';
import { LevelsSettingsService } from '../service/database/levels-settings.service';
import { DatabaseService } from '../service/database/init-typeorm';
import { BotGateway } from '../gateway/bot.gateway';
import { BotManagerService } from '../service/trading/bot-manager.service';
import { TradeLoopService } from '../service/trading/trade-loop.service';
import { BybitService } from '../service/trading/bybit.service';

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
        BotSettingsService,
        UserService,
        CryptoService,
        SpotGridSettingsService,
        GridSettingsService,
        LevelsSettingsService,
        BotManagerService,
        TradeLoopService,
        BybitService,
        BotGateway,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AssignUserIdMiddleware).forRoutes('*');
    }
}
