import {
    botCreationParams,
    createBot,
    getAllBots,
    getBot,
} from '../src/service/database/bot_service/BotService';
import { spotGridSettingsType } from '../src/service/database/bot_service/grid_spot/SpotGridSettingsService';
import { gridSettingsType } from '../src/service/database/bot_service/grid_spot/GridSettingsService';
import { levelsSettingsType } from '../src/service/database/bot_service/grid_spot/LevelsSettingsService';
import * as console from 'node:console';
import { initTypeOrm } from '../src/service/database/InitTypeOrm';
import { getUser } from '../src/service/database/user_service/UserService';

console.log('Start Test.');

const gridSettings: gridSettingsType = {
    lower_bound_dynamic: undefined,
    lower_bound_static: 0,
    type: '',
    upper_bound_dynamic: undefined,
    upper_bound_static: 0,
};

const levelsSettings: levelsSettingsType = {
    count_static: 0,
    price_per_bet_static: 0,
    profit_dynamic: 0,
    type: '',
};

const spotGridSettingsData: spotGridSettingsType = {
    candle_length: 0,
    crypto: '',
    grid_settings: gridSettings,
    history_length: 0,
    levels_settings: levelsSettings,
    stop_loss_type: '',
    update_grid_interval_time: 0,
    update_grid_interval_type: '',
};

const botData: botCreationParams = {
    bot_type: 'spotGrid',
    deposit: 0,
    name: '',
    spot_grid_settings_data: spotGridSettingsData,
    user_id: 'some_uuid',
};

const createBotTest = async () => {
    await createBot(botData);
};

const getBotTest = async () => {
    return await getBot({
        userId: 'some_uuid',
        botId: 3,
        botType: 'spotGrid',
    });
};

const getUserTest = async () => {
    return await getUser('some_uuid');
};

void (async () => {
    await initTypeOrm();
    console.log(await getBotTest());
    console.log(await getAllBots('some_uuid'));
    console.log(await getUserTest());
})();
