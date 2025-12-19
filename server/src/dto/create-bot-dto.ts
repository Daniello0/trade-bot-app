import {
    IsString,
    IsNumber,
    IsEnum,
    ValidateNested,
    IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSpotGridSettingsDto } from './create-spot-grid-settings.dto';

export class CreateBotDto {
    @IsString()
    name: string;

    @IsNumber()
    deposit: number;

    @IsEnum(['spotGrid', 'fullSpot'])
    bot_type: 'spotGrid' | 'fullSpot';

    @IsOptional()
    @ValidateNested()
    @Type(() => CreateSpotGridSettingsDto)
    spot_grid_settings_data?: CreateSpotGridSettingsDto;

    // full_spot_settings_data?: CreateFullSpotSettingsDto;
}
