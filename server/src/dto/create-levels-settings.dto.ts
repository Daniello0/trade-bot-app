import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateLevelsSettingsDto {
    @IsString()
    type: string;

    @IsNumber()
    @IsOptional()
    count_static?: number;

    @IsNumber()
    @IsOptional()
    price_per_bet_static?: number;

    @IsNumber()
    @IsOptional()
    profit_dynamic?: number;
}
