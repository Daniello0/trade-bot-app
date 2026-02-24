import { IsNumber, IsOptional, IsString } from 'class-validator';

export class LogDto {
    @IsOptional()
    @IsNumber()
    botId?: number;

    @IsString()
    timestamp: string;

    @IsString()
    message: string;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsString()
    symbol: string;
}
