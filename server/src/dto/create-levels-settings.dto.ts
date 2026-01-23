import { IsNumber } from 'class-validator';

export class CreateLevelsSettingsDto {
    @IsNumber()
    countStatic: number;

    @IsNumber()
    pricePerBetStatic: number;
}
