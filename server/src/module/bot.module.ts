import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bots } from '../entity/Bots';
import { GridSettings } from '../entity/GridSettings';
import { UserModule } from './user.module';
import { BotController } from '../controller/bot.controller';
import { SpotGridSettings } from '../entity/SpotGridSettings';
import { LevelsSettings } from 'src/entity/LevelsSettings';
import { BotSettingsService } from '../service/database/bot-settings.service';
import { SpotGridSettingsService } from '../service/database/spot-grid-settings.service';
import { GridSettingsService } from '../service/database/grid-settings.service';
import { BotManagerService } from 'src/service/trading/bot-manager.service';
import { TradeLoopService } from '../service/trading/trade-loop.service';
import { LevelsSettingsService } from 'src/service/database/levels-settings.service';
import { BotGateway } from '../gateway/bot.gateway';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Bots,
            SpotGridSettings,
            GridSettings,
            LevelsSettings,
        ]),
        UserModule,
    ],
    controllers: [BotController],
    providers: [
        BotSettingsService,
        SpotGridSettingsService,
        GridSettingsService,
        LevelsSettingsService,
        BotManagerService,
        TradeLoopService,
        BotGateway,
    ],
})
export class BotModule {}
