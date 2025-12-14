import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CreateStopLossSettingsDto {
    @IsEnum(['none', 'interval', 'time', 'interval_and_time'])
    stop_loss_type: 'none' | 'interval' | 'time' | 'interval_and_time';

    @IsNumber()
    @IsOptional()
    stop_loss_interval_value?: number;

    @IsNumber()
    @IsOptional()
    stop_loss_time_value?: number;
}
