import { IsNumber } from 'class-validator';

export class CreateLevelsSettingsDto {
    /*@IsString()
    type: string;*/

    @IsNumber()
    countStatic: number;

    @IsNumber()
    pricePerBetStatic: number;

    /*@IsNumber()
    @IsOptional()
    profitDynamic?: number;*/
}
