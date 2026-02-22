import { Module } from '@nestjs/common';
import { AppController } from '../controller/app.controller';
import { AppService } from '../service/app/app.service';
import { BotSettingsService } from '../service/database/bot-settings.service';
import { BotController } from '../controller/bot.controller';
import { UserKeysService } from '../service/user/user-keys.service';
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
import { UserAuthController } from '../controller/user-auth.controller';
import { UserCrudService } from '../service/user/user-crud.service';
import { UserAuthService } from '../service/user/user-auth.service';
import { FirebaseService } from '../auth/firebase-init.auth';

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
    controllers: [
        AppController,
        BotController,
        UserController,
        UserAuthController,
    ],
    providers: [
        AppService,
        BotSettingsService,
        UserKeysService,
        CryptoService,
        SpotGridSettingsService,
        GridSettingsService,
        LevelsSettingsService,
        BotManagerService,
        TradeLoopService,
        BotGateway,
        UserCrudService,
        UserAuthService,
        FirebaseService,
    ],
})
export class AppModule {}
