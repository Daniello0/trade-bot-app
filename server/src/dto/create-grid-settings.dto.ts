import { IsString } from 'class-validator';

export class CreateGridSettingsDto {
    /*@IsString()
    type: string;

    @IsNumber()
    @IsOptional()
    lowerBoundStatic?: number;

    @IsNumber()
    @IsOptional()
    upperBoundStatic?: number;*/

    @IsString()
    lowerBoundDynamic: string;

    @IsString()
    upperBoundDynamic: string;
}
