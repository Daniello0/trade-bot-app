import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateLevelsSettingsDto {
    @IsString()
    type: string;

    @IsNumber()
    @IsOptional()
    countStatic?: number;

    @IsNumber()
    @IsOptional()
    pricePerBetStatic?: number;

    @IsNumber()
    @IsOptional()
    profitDynamic?: number;
}
