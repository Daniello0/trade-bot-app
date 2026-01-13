import { ReadGridSettingsDto } from './read-grid-settings.dto';
import { ReadLevelsSettingsDto } from './read-levels-settings.dto';

export class ReadSpotGridSettingsDto {
    // historyLength: number;
    candleLength: string;
    crypto: string;
    /*stopLossType: string;
    updateGridIntervalType: string;
    updateGridIntervalTime?: number;*/
    gridSettings: ReadGridSettingsDto;
    levelsSettings: ReadLevelsSettingsDto;
}
