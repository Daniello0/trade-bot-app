import { Bots } from '../entity/Bots';
import { ReadBotDetailsDto } from '../dto/read-bot.dto';
import { ReadSpotGridSettingsDto } from '../dto/read-spot-grid-settings.dto';
import { ReadGridSettingsDto } from '../dto/read-grid-settings.dto';
import { ReadLevelsSettingsDto } from '../dto/read-levels-settings.dto';

export const mapBotToReadBotDetailsDto = (
    bot: Bots | null
): ReadBotDetailsDto | null => {
    if (!bot) {
        return null;
    }

    let spotGridSettingsDto: ReadSpotGridSettingsDto | undefined = undefined;
    if (bot.spot_grid_settings) {
        const spotSettings = bot.spot_grid_settings;

        const gridSettingsDto: ReadGridSettingsDto = {
            type: spotSettings.grid_settings.type,
            lower_bound_static: spotSettings.grid_settings.lower_bound_static,
            upper_bound_static: spotSettings.grid_settings.upper_bound_static,
            lower_bound_dynamic: spotSettings.grid_settings.lower_bound_dynamic,
            upper_bound_dynamic: spotSettings.grid_settings.upper_bound_dynamic,
        };

        const levelsSettingsDto: ReadLevelsSettingsDto = {
            type: spotSettings.levels_settings.type,
            count_static: spotSettings.levels_settings.count_static,
            price_per_bet_static:
                spotSettings.levels_settings.price_per_bet_static,
            profit_dynamic: spotSettings.levels_settings.profit_dynamic,
        };

        spotGridSettingsDto = {
            history_length: spotSettings.history_length,
            candle_length: spotSettings.candle_length,
            crypto: spotSettings.crypto,
            stop_loss_type: spotSettings.stop_loss_type,
            update_grid_interval_type: spotSettings.update_grid_interval_type,
            update_grid_interval_time: spotSettings.update_grid_interval_time,
            grid_settings: gridSettingsDto,
            levels_settings: levelsSettingsDto,
        };
    }

    return {
        id: bot.id,
        name: bot.name,
        bot_type: bot.bot_type,
        deposit: bot.deposit,
        spot_grid_settings: spotGridSettingsDto,
    };
};
