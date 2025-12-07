import { ReadGridSettingsDto } from './read-grid-settings.dto';
import { ReadLevelsSettingsDto } from './read-levels-settings.dto';

export class ReadSpotGridSettingsDto {
    id: number;
    history_length: number;
    candle_length: number;
    crypto: string;
    stop_loss_type: string;
    update_grid_interval_type: string;
    update_grid_interval_time?: number;
    grid_settings: ReadGridSettingsDto;
    levels_settings: ReadLevelsSettingsDto;
}
