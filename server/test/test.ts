import {
    getAllBotsService,
    getBotService,
} from '../src/service/database/bot_service/BotService';
import * as console from 'node:console';
import { initTypeOrm } from '../src/service/database/InitTypeOrm';
import { CreateGridSettingsDto } from '../src/dto/create_dto/spot_grid/create-grid-settings.dto';
import { CreateLevelsSettingsDto } from '../src/dto/create_dto/spot_grid/create-levels-settings.dto';
import { CreateSpotGridSettingsDto } from '../src/dto/create_dto/spot_grid/create-spot-grid-settings.dto';
import { CreateBotDto } from '../src/dto/create_dto/create-bot-dto';

console.log('Start Test.');

const gridSettings: CreateGridSettingsDto = {
    lower_bound_dynamic: undefined,
    lower_bound_static: 0,
    type: '',
    upper_bound_dynamic: undefined,
    upper_bound_static: 0,
};

const levelsSettings: CreateLevelsSettingsDto = {
    count_static: 0,
    price_per_bet_static: 0,
    profit_dynamic: 0,
    type: '',
};

const spotGridSettingsData: CreateSpotGridSettingsDto = {
    candle_length: '5m',
    crypto: '',
    grid_settings: gridSettings,
    history_length: 0,
    levels_settings: levelsSettings,
    stop_loss_type: '',
    update_grid_interval_time: 0,
    update_grid_interval_type: '',
};

const botData: CreateBotDto = {
    bot_type: 'spotGrid',
    deposit: 0,
    name: '',
    spot_grid_settings_data: spotGridSettingsData,
};

const createBotTest = async () => {
    // await (botData, 'some_uuid 2');
};

const getBotTest = async () => {
    return await getBotService({
        userId: 'some_uuid',
        botId: 3,
        botType: 'spotGrid',
    });
};

void (async () => {
    await initTypeOrm();
    await createBotTest();
    console.log(await getBotTest());
    console.log(await getAllBotsService('some_uuid'));
})();
