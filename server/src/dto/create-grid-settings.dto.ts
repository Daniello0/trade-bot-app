import { IsString } from 'class-validator';

export class CreateGridSettingsDto {
    @IsString()
    lowerBoundDynamic: string;

    @IsString()
    upperBoundDynamic: string;
}
