import { ReadSpotGridSettingsDto } from './read-spot-grid-settings.dto';

export class ReadBotSummaryDto {
    id: number;
    name: string;
    botType: string;
}

export class ReadBotDetailsDto {
    id: number;
    name: string;
    deposit: number;
    botType: string;
    // fullSpotSettings?: any;
    spotGridSettings?: ReadSpotGridSettingsDto;
}
