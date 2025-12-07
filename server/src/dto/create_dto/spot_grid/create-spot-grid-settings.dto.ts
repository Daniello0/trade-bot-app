import {
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { CreateGridSettingsDto } from './create-grid-settings.dto';
import { CreateLevelsSettingsDto } from './create-levels-settings.dto';
import { Type } from 'class-transformer';

export class CreateSpotGridSettingsDto {
    @IsNumber()
    history_length: number;

    @IsNumber()
    candle_length: number;

    @IsString()
    crypto: string;

    @IsString()
    stop_loss_type: string;

    @IsString()
    update_grid_interval_type: string;

    @IsNumber()
    @IsOptional()
    update_grid_interval_time?: number;

    @ValidateNested()
    @Type(() => CreateGridSettingsDto)
    grid_settings: CreateGridSettingsDto;

    @ValidateNested()
    @Type(() => CreateLevelsSettingsDto)
    levels_settings: CreateLevelsSettingsDto;
}
