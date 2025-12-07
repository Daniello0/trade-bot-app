import { ReadSpotGridSettingsDto } from './spot_grid/read-spot-grid-settings.dto';

export class ReadBotSummaryDto {
    id: number;
    user_id: string;
    name: string;
    deposit: number;
    bot_type: string;
}

export class ReadBotDetailsDto {
    id: number;
    user_id: string;
    name: string;
    deposit: number;
    bot_type: string;
    full_spot_settings?: any;
    spot_grid_settings?: ReadSpotGridSettingsDto;
}
