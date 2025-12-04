import { DatabaseService } from '../InitTypeOrm';
import { SpotGridSettings } from '../entity/grid_spot/SpotGridSettings';
import { GridSettings } from '../entity/grid_spot/GridSettings';
import { LevelsSettings } from '../entity/grid_spot/LevelsSettings';
import { Bots } from '../entity/Bots';

type gridBotParams = {
    id?: number;
    history_length: number;
    candle_length: number;
    crypto: string;
    grid_settings_id: number;
    levels_settings_id: number;
    stop_loss_type: string;
    update_grid_interval_type: string;
    update_grid_interval_time: number;
    grid_settings: GridSettings;
    levels_settings: LevelsSettings;
    bot: Bots;
};

export const createGridBot = async (gridBotSettings: gridBotParams) => {
    await DatabaseService.manager.insert(SpotGridSettings, {
        history_length: gridBotSettings.history_length,
        candle_length: gridBotSettings.candle_length,
        crypto: gridBotSettings.crypto,
        grid_settings: gridBotSettings.grid_settings,
        levels_settings: gridBotSettings.levels_settings,
        stop_loss_type: gridBotSettings.stop_loss_type,
        update_grid_interval_type: gridBotSettings.update_grid_interval_type,
        update_grid_interval_time: gridBotSettings.update_grid_interval_time,
        bot: gridBotSettings.bot,
    });
};
