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
    botType: 'spotGrid' | 'fullSpot';

    @IsOptional()
    @ValidateNested()
    @Type(() => CreateSpotGridSettingsDto)
    spotGridSettingsData?: CreateSpotGridSettingsDto;
}
