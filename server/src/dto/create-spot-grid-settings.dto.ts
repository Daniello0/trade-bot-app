import {
    IsString,
    ValidateNested,
} from 'class-validator';
import { CreateGridSettingsDto } from './create-grid-settings.dto';
import { CreateLevelsSettingsDto } from './create-levels-settings.dto';
import { Type } from 'class-transformer';

export class CreateSpotGridSettingsDto {
    /*@IsNumber()
    historyLength: number;*/

    @IsString()
    candleLength: string;

    @IsString()
    crypto: string;

    /*@IsString()
    stopLossType: string;

    @IsString()
    updateGridIntervalType: string;

    @IsNumber()
    @IsOptional()
    updateGridIntervalTime?: number;*/

    @ValidateNested()
    @Type(() => CreateGridSettingsDto)
    gridSettings: CreateGridSettingsDto;

    @ValidateNested()
    @Type(() => CreateLevelsSettingsDto)
    levelsSettings: CreateLevelsSettingsDto;
}
