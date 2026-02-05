import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Optional } from '@nestjs/common';

export class LogDto {
    @IsOptional()
    @IsNumber()
    botId?: number;

    @IsString()
    timestamp: string;

    @IsString()
    message: string;

    @Optional()
    @IsNumber()
    price?: number;

    @IsString()
    symbol: string;
}
