import { ReadGridSettingsDto } from './read-grid-settings.dto';
import { ReadLevelsSettingsDto } from './read-levels-settings.dto';

export class ReadSpotGridSettingsDto {
    candleLength: string;
    crypto: string;
    gridSettings: ReadGridSettingsDto;
    levelsSettings: ReadLevelsSettingsDto;
}
