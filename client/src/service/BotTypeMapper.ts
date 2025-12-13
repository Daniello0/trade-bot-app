import {CreateBot, CreateSpotGridSettings, ReadBotDetails} from "../api/Types";

export const mapReadBotToCreateBot = (bot: ReadBotDetails): CreateBot => {
    let spotGridSettingsData: CreateSpotGridSettings | undefined = undefined;
    if (bot.spot_grid_settings) {
        spotGridSettingsData = {
            history_length: bot.spot_grid_settings.history_length,
            candle_length: String(bot.spot_grid_settings.candle_length),
            crypto: bot.spot_grid_settings.crypto,
            stop_loss_type: bot.spot_grid_settings.stop_loss_type,
            update_grid_interval_type: bot.spot_grid_settings.update_grid_interval_type,
            update_grid_interval_time: bot.spot_grid_settings.update_grid_interval_time,
            grid_settings: {
                type: bot.spot_grid_settings.grid_settings.type,
                lower_bound_static: bot.spot_grid_settings.grid_settings.lower_bound_static,
                upper_bound_static: bot.spot_grid_settings.grid_settings.upper_bound_static,
                lower_bound_dynamic: bot.spot_grid_settings.grid_settings.lower_bound_dynamic,
                upper_bound_dynamic: bot.spot_grid_settings.grid_settings.upper_bound_dynamic,
            },
            levels_settings: {
                type: bot.spot_grid_settings.levels_settings.type,
                count_static: bot.spot_grid_settings.levels_settings.count_static,
                price_per_bet_static: bot.spot_grid_settings.levels_settings.price_per_bet_static,
                profit_dynamic: bot.spot_grid_settings.levels_settings.profit_dynamic,
            },
        };
    }

    return {
        name: bot.name,
        deposit: bot.deposit,
        bot_type: bot.bot_type,
        spot_grid_settings_data: spotGridSettingsData,
        full_spot_settings_data: bot.full_spot_settings,
    };
}