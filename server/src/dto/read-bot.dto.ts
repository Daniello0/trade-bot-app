import { ReadSpotGridSettingsDto } from './read-spot-grid-settings.dto';

export class ReadBotSummaryDto {
    id: number;
    name: string;
    bot_type: string;
}

export class ReadBotDetailsDto {
    id: number;
    name: string;
    deposit: number;
    bot_type: string;
    full_spot_settings?: any;
    spot_grid_settings?: ReadSpotGridSettingsDto;
}
