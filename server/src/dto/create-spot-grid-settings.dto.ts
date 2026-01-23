import { IsString, ValidateNested } from 'class-validator';
import { CreateGridSettingsDto } from './create-grid-settings.dto';
import { CreateLevelsSettingsDto } from './create-levels-settings.dto';
import { Type } from 'class-transformer';

export class CreateSpotGridSettingsDto {
    @IsString()
    candleLength: string;

    @IsString()
    crypto: string;

    @ValidateNested()
    @Type(() => CreateGridSettingsDto)
    gridSettings: CreateGridSettingsDto;

    @ValidateNested()
    @Type(() => CreateLevelsSettingsDto)
    levelsSettings: CreateLevelsSettingsDto;
}
