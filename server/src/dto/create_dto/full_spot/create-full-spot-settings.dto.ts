import { CreateStopLossSettingsDto } from './create-stop-loss-settings.dto';
import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFullSpotSettingsDto {
    @IsString()
    ignore_list: string;

    @IsNumber()
    max_active_cryptos: number;

    @IsNumber()
    price_per_bet: number;

    @IsString()
    crypto_list_type: string;

    @IsString()
    crypto_list_static: string;

    @IsString()
    indicators: string;

    @IsNumber()
    profit_per_crypto: number;

    @ValidateNested()
    @Type(() => CreateStopLossSettingsDto)
    stop_loss_settings: CreateStopLossSettingsDto;
}
